const { sendResponse, errorResponse } = require("../utils/response");
const geocoder = require('../utils/geocoder');
const BootcampModel = require('../models/Bootcamp.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler =require('../middleware/async');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
module.exports.getBootcamps = asyncHandler(async (req, res, next) =>{    
    const bootcamps = await BootcampModel.find({});
    return sendResponse(res, 200, "Show all bootcamps", {count: bootcamps.length, data: bootcamps});            
});

// @desc    GET single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public

module.exports.getBootcamp = asyncHandler(async (req, res, next) =>{    
    const bootcamp = await BootcampModel.findById(req.params.id);        
        
    bootcamp.getCost()
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }        
        
    return sendResponse(res, 200, `Show bootcamp ${req.params.id}`, {data: bootcamp});    
});

// @desc    create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private

module.exports.createBootcamp = asyncHandler(async (req, res, next) => {    
    const newBootcamp = await BootcampModel.create(req.body);
    return sendResponse(res, 201, 'create new bootcamp', newBootcamp);    
});

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private

module.exports.updateBootcamp = asyncHandler(async (req, res, next) => {    
    const updateOne = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    if (!updateOne) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }

    return sendResponse(res, 201, `Update bootcamp ${req.params.id}`);    
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private

module.exports.deleteBootcamp = asyncHandler(async (req, res, next) => {    
    const deleteOne = await BootcampModel.findByIdAndDelete(req.params.id);
    if (!deleteOne) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }

    return sendResponse(res, 200, `Deleted bootcamp ${req.params.id} successfully`);    
});

// @desc    Delete all bootcamp
// @route   DELETE /api/v1/bootcamps/all
// @access  Private

module.exports.allDeleteBootcamp = asyncHandler(async (req, res, next) => {
    console.log(req);
    const deleteAll = await BootcampModel.deleteMany({});
    
    return sendResponse(res, 200, `Deleted all bootcamps`, { deletedData: deleteAll });
});


// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private

module.exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const {zipcode, distance} = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lng = loc[0].longitude;
    const lat = loc[0].latitude;

    // Calc radius using radians
    // Divide distance by radius
    // Earth Radius = 3,963.1906 mi / 6,378.1370 km
    const radius = distance / 3963
    const bootcamps = await BootcampModel.find({location: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}});

    return sendResponse(res, 200, `Filter by Based on radius and distance bootcamps`, {count: bootcamps.length, data: bootcamps });
});
