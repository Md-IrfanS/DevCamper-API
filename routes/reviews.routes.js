const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getReviews, getReview, createReview, updateReview, deleteReview } = require('../controllers/reviews.controller');
const advancedResults = require('../middleware/advancedResults');
const ReviewModel = require('../models/Review.model');
const router = express.Router({mergeParams: true});

router.route('/').get(advancedResults(ReviewModel, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews).post(protect, authorize('user','admin'), createReview);

router.route('/:reviewId')
.get(protect, getReview)
.put(protect, authorize('user','admin'), updateReview)
.delete(protect, authorize('user','admin'), deleteReview);


module.exports = router