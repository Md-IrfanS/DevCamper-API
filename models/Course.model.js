const mongoose =require('mongoose');


const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required:[ true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minium skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
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

},{timestamps: true});

// Statics method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId){
    const result = await this.aggregate([
        {
            $match: {bootcamp: bootcampId}
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ])
    
    try{
        const averageCost = result.length > 0 ? Math.ceil(result[0].averageCost / 10) * 10 : 0;
        
        // Update the bootcamp with the new averageCost
        await this.model('bootcamp').findByIdAndUpdate(bootcampId, { averageCost });
    }catch(error){
        console.error(`Error updating average cost for bootcamp ${bootcampId}:`, error);
        throw error;
    }
};

// Call getAverageCost after save
CourseSchema.post('save', async function(doc, next){
    try {
        await doc.constructor.getAverageCost(doc.bootcamp);  // Reference directly to Course model
        next();  // Continue the chain
      } catch (error) {
        console.error('Error in post-save hook:', error);
        next(error);  // Pass the error to the next middleware
      }
});

// Call getAverageCost before remove
CourseSchema.pre('deleteOne',{ document: true, query: false }, async function(next){
    try {    

        // Ensure that the bootcamp ID is available before calculating the average cost
        const course = this; // Access the current document
        if (course.bootcamp) {
            await this.constructor.getAverageCost(course.bootcamp); // Update the average cost
        }

        next(); // Continue the chain
    } catch (error) {
        console.error('Error in pre-delete hook:', error);
        next(error); // Pass the error to the next middleware
    }
});

const CourseModel = mongoose.model('course', CourseSchema);

module.exports = CourseModel