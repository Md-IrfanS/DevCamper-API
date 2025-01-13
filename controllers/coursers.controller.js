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

// @des     Get Course
// @route   GET /api/v1/courses/:courseId
// @access  Public

module.exports.getCourse = asyncHandler(async (req, res, next)=> {    
    const course = await CourseModel.findById(req.params.courseId).populate({
        path: 'bootcamp',
        select: 'name description careers'
    });

    if (!course) {
        return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`,404))
    }    

    return sendResponse(res, 200, 'All Courses', {data: course});
});


// @des     Add Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private

module.exports.addCourse = asyncHandler(async (req, res, next)=> {    
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await BootcampModel.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`,404))
    }

    if (bootcamp.user.toString() !== req.user.id && !req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this add courses to bootcamp ${bootcamp._id}`, 401));
    }    

    const newCourse = await CourseModel.create(req.body);    

    return sendResponse(res, 200, 'New Course', {data: newCourse});
});


// @des     Update Course
// @route   PUT /api/v1/course/:courseId
// @access  Private

module.exports.updateCourse = asyncHandler(async (req, res, next)=> {    

    let course = await CourseModel.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.courseId}`,404))
    }

    if (course.user.toString() !== req.user.id && !req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course bootcamp ${bootcamp._id}`, 401));
    }  

    course = await CourseModel.findByIdAndUpdate(req.params.courseId, req.body, {
        new: true,
        runValidators: true
    });

    return sendResponse(res, 200, 'update Course', {data: course});
});


// @des     Delete Course
// @route   DELETE /api/v1/course/:courseId
// @access  Private

module.exports.deleteCourse = asyncHandler(async (req, res, next)=> {    

    const course = await CourseModel.findById(req.params.courseId);

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.courseId}`,404))
    }

    if (course.user.toString() !== req.user.id && !req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course`, 401));
    } 

    const bootcampId = course.bootcamp; // Capture the associated bootcamp ID
    
    await course.deleteOne();

    // Update the average cost for the associated bootcamp
    await CourseModel.getAverageCost(bootcampId);

    return sendResponse(res, 200, 'Delete course', {data: {}});
});