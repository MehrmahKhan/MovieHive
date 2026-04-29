const express = require('express');
const reviewsController = require('../controllers/reviewsController');

const router = express.Router();

// GET all reviews for a movie
router.get('/movie/:movieId', reviewsController.getMovieReviews);

// GET user's review for a movie
router.get('/user/:movieId', reviewsController.getUserMovieReview);

// POST add new review
router.post('/', reviewsController.addReview);

// PUT update review
router.put('/:reviewId', reviewsController.updateReview);

// DELETE review
router.delete('/:reviewId', reviewsController.deleteReview);

module.exports = router;
