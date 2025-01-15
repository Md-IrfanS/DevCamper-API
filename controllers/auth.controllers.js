const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler =require('../middleware/async');
const UserModel = require('../models/User.model');
const { sendResponse } = require('../utils/response');
const  sendMail  = require('../utils/sendEmail');

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


// @desc    Login user
// @route   POST /api/v1/auth/me
// @access  Private

module.exports.getMe = asyncHandler ( async (req, res, next)=> {
    const user = await UserModel.findById(req.user.id);    
    return sendResponse(res, 200, 'User details', user)
});


// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public

module.exports.postForgotPassword = asyncHandler ( async (req, res, next)=> {
    const user = await UserModel.findOne({email: req.body.email});    
    if (!user) {
        return next(new ErrorResponse('There is no user with that email.', 404));
    }
    
    // Get reset token
    const resetToken = user.getResetPasswordToken();    

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try{
        await sendMail({
            email: user.email,
            subject: "Password reset token",
            message: message,
        });

        return sendResponse(res, 200, 'Email sent successfully', );
    }catch(error){
        console.error(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false});
        return next(new ErrorResponse('Email could not be sent', 500));
    }
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


// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resetToken
// @access  Private

module.exports.resetPassword = asyncHandler ( async (req, res, next)=> {
    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const user = await UserModel.findOne({resetPasswordToken: resetPasswordToken, resetPasswordExpire: { $gt: Date.now() }});    
    console.log(user)
    if (!user) {
        return next(new ErrorResponse('Invalid token',400));
    }

    // Set new Password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();    
    sendTokenResponse(res, user, 200, 'Password updated successfully');
});
