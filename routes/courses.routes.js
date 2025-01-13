const express = require('express');
const router = express.Router({ mergeParams: true });
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/coursers.controller');

router.route('/').get(getCourses).post(addCourse);

router.route('/:courseId').get(getCourse).put(updateCourse).delete(deleteCourse);


module.exports = router