const { sendResponse, errorResponse } = require("../utils/response");
const geocoder = require('../utils/geocoder');
const BootcampModel = require('../models/Bootcamp.model');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler =require('../middleware/async');
const { getPaginatedData } = require('../utils/paginate');
const CourseModel = require("../models/Course.model");

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
module.exports.getBootcamps = asyncHandler(async (req, res, next) =>{  
    let query;   
    
    // Copy req.query
    const reqQuery = {...req.query};
    
    // Fields to exclude
    const removeFields = ['select','sort','page','limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((parm)=> delete reqQuery[parm]);        

    // Convert query parameters to a JSON string    
    let queryStr = JSON.stringify(reqQuery);

    // Replace query operators ($gte, $gte ect);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);    
        
    // Parse the modified string back to an object
    let queryObj = JSON.parse(queryStr);
    
    // Execute the query
    query = BootcampModel.find(queryObj).populate({path: 'courses', select: 'title description tuition'});

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(" ");
        query = query.select(fields);        
    }    
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join("");        
        query = query.sort(sortBy);
    }else{
        query =query.sort('-createAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await BootcampModel.countDocuments();


    query = query.skip(startIndex).limit(limit);


    // Example
    const paginationDetails = await getPaginatedData(BootcampModel, { location: "Boston" }, { page: 2, limit: 5 });
    console.log(paginationDetails);

    const bootcamps = await query;

    // Pagination result 
    const pagination = {    
        totalPages: total,
        limit: limit,
        currentPage: page    
    };
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    // Send the response
    return sendResponse(res, 200, "Show all bootcamps", {count: bootcamps.length, pagination: false && paginationDetails.pagination, data: bootcamps});            
});

// @desc    GET single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public

module.exports.getBootcamp = asyncHandler(async (req, res, next) =>{    
    const bootcamp = await BootcampModel.findById(req.params.id).populate({path: 'courses', select: 'title description tuition' });        
            
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
    console.log(req.params);
    const bootcamp = await BootcampModel.findById(req.params.id);

    console.log(bootcamp);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`,404))
    }
    
    await bootcamp.deleteOne();

    return sendResponse(res, 200, `Deleted bootcamp ${req.params.id} successfully`);    
});

// @desc    Delete all bootcamp
// @route   DELETE /api/v1/bootcamps/all
// @access  Private

module.exports.allDeleteBootcamp = asyncHandler(async (req, res, next) => {    
    const bootcamps = await BootcampModel.find({});
    
    if (!bootcamps || bootcamps.length == 0) {
        return sendResponse(res, 404, `No bootcamps found to delete`);
    }
    
    // Delete related courses for each bootcamp
    const bootcampsId = bootcamps.map((bootcamp) => bootcamp._id);

    // Delete all related courses
    await CourseModel.deleteMany({bootcamp: { $in: bootcampsId }});

    // Delete all bootcamps
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
