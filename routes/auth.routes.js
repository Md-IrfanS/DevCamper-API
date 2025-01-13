const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, postForgotPassword } = require('../controllers/auth.controllers');
const {protect} = require('../middleware/auth');

router.route('/register').post(registerUser);

router.route('/login').post(loginUser);

router.route('/me').get(protect, getMe);

router.route('/forgotpassword').post(postForgotPassword);

module.exports = router;