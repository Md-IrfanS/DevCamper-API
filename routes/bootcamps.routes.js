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
  getAllBootcampsByUser,
} = require("../controllers/bootcamps.controllers");

const advancedResults = require('../middleware/advancedResults');
const BootcampModel = require('../models/Bootcamp.model');
const { protect, authorize } = require('../middleware/auth');

// Include other resource router
const courseRouter = require('./courses.routes');
const reviewRouter = require('./reviews.routes');

// Re-route into other resource routers

router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route("/").get(advancedResults(BootcampModel, {path: 'courses', select: 'title description tuition'}), getBootcamps).post(protect, authorize('publisher','admin'), createBootcamp);

// Static routes first
router.route('/allDelete').delete(protect, allDeleteBootcamp);
router.route('/user').get(protect, authorize('publisher','admin'), getAllBootcampsByUser)

// Dynamic routes after static routes
router
  .route("/:id")
  .get(protect, authorize('publisher','admin'), getBootcamp)
  .put(protect, authorize('publisher','admin'), updateBootcamp)
  .delete(protect, authorize('publisher','admin'), deleteBootcamp);

router.route('/:bootcampId/photo').put(protect, authorize('publisher','admin'), bootcampPhotoUpload);

router.route('/:bootcampId/photo').delete(protect, authorize('publisher','admin'), deleteBootcampPhoto);

router.route('/:bootcampId/uploaddoc').put(protect, authorize('publisher','admin'), bootcampDocUpload);

router.route('/:bootcampId/uploaddoc/:docId').delete(protect, authorize('publisher','admin'), deleteBootcampUploadDoc);

router.get('/radius/:zipcode/:distance', protect, authorize('publisher','admin'), getBootcampsInRadius);




module.exports = router;
