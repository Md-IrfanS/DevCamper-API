const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, postForgotPassword, resetPassword } = require('../controllers/auth.controllers');
const { protect } = require('../middleware/auth');

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/me').get(protect, getMe);

router.route('/forgotpassword').post(postForgotPassword);

router.route('/resetpassword/:resetToken').put(resetPassword);

module.exports = router;