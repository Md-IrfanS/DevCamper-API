const asyncHandler = require("../middleware/async");
const ErrorResponse = require('../utils/errorResponse');
const CourseModel = require('../models/Course.model');
const BootcampModel = require('../models/Bootcamp.model');
const { sendResponse } = require("../utils/response");

// @des     Get Courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public

module.exports.getCourses = asyncHandler(async (req, res, next)=> {    
    let query;
    if (req.params.bootcampId) {        
        query = CourseModel.find({bootcamp: req.params.bootcampId});
        console.log(query);
    }else{
        query = CourseModel.find({}).populate({
            path: 'bootcamp',
            select: {name: 1, description: 1}
        });
    }
    const courses = await query;
    return sendResponse(res, 200, 'All Courses', {count: courses.length, data: courses});
});