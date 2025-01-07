require('dotenv').config();

const sendResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({statusCode: statusCode, success: true, message, details: data})
};

const errorResponse = (res, statusCode, message, error) => {
    return res.status(statusCode).json({statusCode, success: false, message, error});
};

module.exports = {sendResponse, errorResponse}