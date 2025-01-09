const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCourses } = require('../controllers/coursers.controller');

router.route('/').get(getCourses);

module.exports = router