const asyncHandler = require("../middleware/async");
const ErrorResponse = require('../utils/errorResponse');
const CourseModel = require('../models/Course.model');
const ReviewModel = require('../models/Review.model');
const { sendResponse } = require("../utils/response");
const BootcampModel = require("../models/Bootcamp.model");

// @des     Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public

module.exports.getReviews = asyncHandler(async (req, res, next)=> {    
    if (req.params.bootcampId) {
        const reviews = await ReviewModel.find({bootcamp: req.params.bootcampId});

        return sendResponse(res, 200, 'Get reviews successfully', {
            count: reviews.length,
            data: reviews
        })
    }else{
        return sendResponse(res, 200, 'Get reviews', res.advancedResults);
    }
});


// @des     Get reviews
// @route   GET /api/v1/reviews/:reviewId
// @access  Public

module.exports.getReview = asyncHandler(async (req, res, next)=> {    
    const review = await ReviewModel.findById(req.params.reviewId).populate({path:'bootcamp', select: 'name description'});

    if (!review) {
        return next(new ErrorResponse(`No review found with ${req.params.reviewId}`, 404));
    }
    return sendResponse(res, 200, 'Get Review', review);

});


// @des     Create reviews
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private

module.exports.createReview = asyncHandler(async (req, res, next)=> {    
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;
    const bootcamp = await BootcampModel.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`,404));
    }
    
    const newReview = await ReviewModel.create(req.body);
    return sendResponse(res, 200, 'Created Review', newReview);
});


// @des     Update reviews
// @route   POST /api/v1/reviews/:reviewId
// @access  Private

module.exports.updateReview = asyncHandler(async (req, res, next)=> {        
    const review = await ReviewModel.findById(req.params.reviewId);
    if (!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.bootcampId}`,404));
    }

    if (!review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorize to update review`, 404))
    }
    
    const newReview = await ReviewModel.findByIdAndUpdate(req.params.reviewId, req.body, {
        new: true, 
        runValidators: true
    });
    return sendResponse(res, 200, 'Updated Review', newReview);

});


// @des     Delete reviews
// @route   DELETE /api/v1/reviews/:reviewId
// @access  Private

module.exports.deleteReview = asyncHandler(async (req, res, next)=> {        
    const review = await ReviewModel.findById(req.params.reviewId);    
    if (!review) {
        return next(new ErrorResponse(`No review with the id of ${req.params.bootcampId}`,404));
    }

    if (!review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorize to update review`, 404))
    }
    
    await review.deleteOne();

    return sendResponse(res, 200, 'Deleted Review');

});