const jwt = require('jsonwebtoken');
const asynHandler =require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const UserModel = require('../models/User.model');


// Protect routes
module.exports.protect = asynHandler( async (req, res, next)=> {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    
        token = req?.headers?.authorization?.split(" ")[1];        
    }
    // else if (req.cookies.token) {
    //     console.log('cookiieee')
    //     token = req.cookies.token
    // }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorize to access this route'), 401);
    }
    try{
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            return next(new ErrorResponse('Invalid token', 401));
        }

        // Find user by ID stored in token
        const user = await UserModel.findById(decoded.id);

        if (!user) {
            return next(new ErrorResponse('No user found with this ID', 404));
        }

        req.user = user;
        next();
    }catch(error){
        return next(new ErrorResponse('Not authorize to access this route'), 401);
    }

});


module.exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403))
        }
        next();
    }
};
