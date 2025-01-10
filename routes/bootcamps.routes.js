const express = require("express");
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  allDeleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
  deleteBootcampPhoto,
  bootcampDocUpload,
  deleteBootcampUploadDoc,
} = require("../controllers/bootcamps.controllers");

const advancedResults = require('../middleware/advancedResults');
const BootcampModel = require('../models/Bootcamp.model');

// Include other resource router
const courseRouter = require('./courses.routes');

// Re-route into other resource routers

router.use('/:bootcampId/courses', courseRouter);

router.route("/").get(advancedResults(BootcampModel, {path: 'courses', select: 'title description tuition'}),getBootcamps).post(createBootcamp);

// Static routes first
router.route('/allDelete').delete(allDeleteBootcamp);

// Dynamic routes after static routes
router
  .route("/:id")
  .get(advancedResults(BootcampModel, {path: 'courses', select: 'title description tuition'}) , getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/:bootcampId/photo').put(bootcampPhotoUpload);

router.route('/:bootcampId/photo').delete(deleteBootcampPhoto);

router.route('/:bootcampId/uploaddoc').put(bootcampDocUpload);

router.route('/:bootcampId/uploaddoc/:docId').delete(deleteBootcampUploadDoc);


router.get('/radius/:zipcode/:distance', getBootcampsInRadius);
module.exports = router;
