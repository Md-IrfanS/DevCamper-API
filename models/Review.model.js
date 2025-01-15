const mongoose =require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxLength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
    },    
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

// Pervent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1}, {unique: true});

// Statics method to get avg of rating and save tuitions
ReviewSchema.statics.getAverageRating = async function(bootcampId){
    const result = await this.aggregate([
        {
            $match: { bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating'}
            }
        }
    ]);
    
    try{
        console.log(result)
        if (result.length > 0) {
            await this.model("bootcamp").findByIdAndUpdate(bootcampId, {
                averageRating: result[0].averageRating.toFixed(1), // Update average rating
            });
        } else {
            // If no reviews, set averageRating to null
            await this.model("bootcamp").findByIdAndUpdate(bootcampId, {
                averageRating: null,
            });
        }      
    }catch(error){
        console.error(`Error updating average cost for bootcamp ${bootcampId}:`, error);
        throw error;
    }
};

// Call averageRating after save
ReviewSchema.post('save', async function(doc, next){
    try {
        await doc.constructor.getAverageRating(doc.bootcamp);  // Reference directly to Course model
        next();  // Continue the chain
      } catch (error) {
        console.error('Error in post-save hook:', error);
        next(error);  // Pass the error to the next middleware
      }
});

// Call averageRating before remove
ReviewSchema.pre('deleteOne', { document: true, query: false }, async function(next){
    try {    

        // Ensure that the bootcamp ID is available before calculating the average cost
        const review = this; // Access the current document
        if (review.bootcamp) {
            await review.constructor.getAverageRating(review.bootcamp); // Update the average cost
        }

        next(); // Continue the chain
    } catch (error) {
        console.error('Error in pre-delete hook:', error);
        next(error); // Pass the error to the next middleware
    }
});


const ReviewModel = mongoose.model('review', ReviewSchema);

module.exports = ReviewModel