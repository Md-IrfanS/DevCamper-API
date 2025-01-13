const ErrorResponse = require('../utils/errorResponse');
const asyncHandler =require('../middleware/async');
const UserModel = require('../models/User.model');
const { sendResponse } = require('../utils/response');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public

module.exports.registerUser = asyncHandler( async (req, res, next) => {
    const {name, email, password, role} = req.body;
    
    const user = await UserModel.create({
        name,
        email, 
        password,
        role
    });
        
    return sendTokenResponse(res, user, 200, 'Register user created');
});


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public

module.exports.loginUser = asyncHandler( async(req, res, next) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return next(new ErrorResponse(`Please provide an email and password`,400))
    }
    // Check for users
    const user = await UserModel.findOne({email}).select("+password");
    
    if (!user) {
        return next(new ErrorResponse(`Invalid credentials`,401))
    }

    // Check if password matches
    const isValidPassword = await user.matchPassword(password);

    if (!isValidPassword) {
        return next(new ErrorResponse(`Invalid credentials`,401))
    }
    
    return sendTokenResponse(res, user, 200, 'Login successfully');
});


// Get token from model, create cookie and send response
const sendTokenResponse = (res, user, statusCode, message) => {
    const token = user.getSignedJWTToken();
    const options = {
        expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" ? true : false
    };
    return res.status(statusCode).cookie('token', token, options).json({statusCode, message, details: {token, user}});
};


// @desc    Login user
// @route   POST /api/v1/auth/me
// @access  Private

module.exports.getMe = asyncHandler ( async (req, res, next)=> {
    const user = await UserModel.findById(req.user.id);    
    return sendResponse(res, 200, 'User details', user)
});