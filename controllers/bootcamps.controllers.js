const { sendResponse } = require("../utils/response");
const BootcampModel = require('../models/Bootcamp.model');

// @desc    GET all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
module.exports.getBootcamps = async function (req, res, next) {
  return sendResponse(res, 200, "Show all bootcamps", req.hello);
};

// @desc    GET single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public

module.exports.getBootcamp = async function (req, res, next) {
    return sendResponse(res, 200, `Show bootcamp ${req.params.id}`);
};

// @desc    create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private

module.exports.createBootcamp = async function (req, res, next) {
    console.log(req.body);

    const newBootcamp = await BootcampModel.create(req.body);
    return sendResponse(res, 201, 'create new bootcamp', newBootcamp);
};

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private

module.exports.updateBootcamp = async function (req, res, next) {
    return sendResponse(res, 201, `Update bootcamp ${req.params.id}`);
};

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private

module.exports.deleteBootcamp = async function (req, res, next) {
    return sendResponse(res, 201, `Deleted bootcamp ${req.params.id}`);   
};


