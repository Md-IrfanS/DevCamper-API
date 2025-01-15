const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const UserModel = require('../models/User.model');
const { sendResponse } = require('../utils/response');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin

module.exports.getUsers = asyncHandler( async (req, res, next) => {
   res.status(200).json(res.advancedResults);
});


// @desc    Get single user
// @route   GET /api/v1/users/:userId
// @access  Private/Admin

module.exports.getUser = asyncHandler( async (req, res, next) => {
    const user = await UserModel.findById(req.params.userId);
    sendResponse(res, 200, 'Get user details', user);
});


// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin

module.exports.createUser = asyncHandler( async (req, res, next) => {
    const user = await UserModel.create(req.body);    
    sendResponse(res, 201, 'Create user ', user);
});


// @desc    Update user
// @route   Put /api/v1/users/:userId
// @access  Private/Admin

module.exports.updateUser = asyncHandler( async (req, res, next) => {
    const user = await UserModel.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
        runValidators: true
    });    
    sendResponse(res, 201, 'Update user ', user);
});


// @desc    Delete user
// @route   Delete /api/v1/users/:userId
// @access  Private/Admin

module.exports.deleteUser = asyncHandler( async (req, res, next) => {
    const user = await UserModel.findByIdAndDelete(req.params.userId);
    if (!user) {
        return next(new ErrorResponse(`Invalid user ${req.params.userId}`))
    }    
    sendResponse(res, 200, `Delete user ${req.params.userId} `, user);
});