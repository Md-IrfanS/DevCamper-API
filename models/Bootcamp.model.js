const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: true,
        trim: true,
        maxLength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxLength: [500, 'Description can not be more than 500 characters']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]        
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point'],            
        },
        coordinates: {
            type: [Number],            
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ],
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
        type: String,
        default: "no-photo.jpg"
    },
    uploadDoc: [
        {           
            fileName: {
                type: String,
                required: true
            },
            fileSize: {
                type: Number,
                required: true
            },   
            fileType: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }                 
        }
    ],
    housing: {
        type: Boolean,
        default: false,
    },
    jobAssistance: {
        type: Boolean,
        default: false,
    },
    jobGuarantee: {
        type: Boolean,
        default: false,
    },
    acceptGi: {
        type: Boolean,
        default: false,
    },
    since: {
        type: Number,
        default: new Date().getFullYear()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true,
    },
    averageRating: {
        type: Number,
        default: null, // Default to null when no reviews exist
    }    
},{ timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}});


// Create bootcamp slug from the name
BootcampSchema.pre('save', function(next){    
    this.slug = slugify(this.name, {lower: true});    
    next();
});

// Geocoder & create location field

BootcampSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location= {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc [0].city,
        state: loc[0].state,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
    };

    // Do not save address in DB
    this.address = undefined;
    next();
});

// Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('deleteOne',{ document: true, query: false }, async function (next) {
    await this.model('course').deleteMany({ bootcamp: this._id });
    next();
});


// Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'course',
    localField: "_id",
    foreignField: 'bootcamp',
    justOne: false
});

const BootcampModel = mongoose.model('bootcamp', BootcampSchema);

module.exports = BootcampModel;