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
} = require("../controllers/bootcamps.controllers");

// Include other resource router
const courseRouter = require('./courses.routes');

// Re-route into other resource routers

router.use('/:bootcampId/courses', courseRouter);

router.route("/").get(getBootcamps).post(createBootcamp);

// Static routes first
router.route('/allDelete').delete(allDeleteBootcamp);

// Dynamic routes after static routes
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);


router.get('/radius/:zipcode/:distance', getBootcampsInRadius);
module.exports = router;
