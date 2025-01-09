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

},{timestamps: true});


const CourseModel = mongoose.model('course', CourseSchema);

module.exports = CourseModel