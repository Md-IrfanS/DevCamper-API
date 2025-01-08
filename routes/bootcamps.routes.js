const express = require("express");
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  allDeleteBootcamp,
} = require("../controllers/bootcamps.controllers");

router.route("/").get(getBootcamps).post(createBootcamp);

// Static routes first
router.route('/allDelete').delete(allDeleteBootcamp);

// Dynamic routes after static routes
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
