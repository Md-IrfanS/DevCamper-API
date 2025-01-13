const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/coursers.controller');
const {protect} = require('../middleware/auth');

router.route('/').get(getCourses).post(protect, addCourse);

router.route('/:courseId').get(getCourse).put(protect, updateCourse).delete(protect, deleteCourse);


module.exports = router