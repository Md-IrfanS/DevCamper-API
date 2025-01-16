const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, postForgotPassword, resetPassword, updateDetails, updatePassword, logoutUser } = require('../controllers/auth.controllers');
const { protect } = require('../middleware/auth');

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/me').get(protect, getMe);

router.route('/forgotpassword').post(postForgotPassword);

router.route('/resetpassword/:resetToken').put(resetPassword);

router.route('/updatedetails').put(protect, updateDetails);

router.route('/updatepassword').put(protect, updatePassword);

router.route('/logout').post(logoutUser)

module.exports = router;