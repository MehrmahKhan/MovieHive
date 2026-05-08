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

// ADMIN ROUTES
// GET all reviews for admin management
router.get('/admin/all', reviewsController.getAllReviewsAdmin);

// PUT flag review as inappropriate (admin only)
router.put('/admin/flag/:reviewId', reviewsController.flagReview);

// PUT unflag review (admin only)
router.put('/admin/unflag/:reviewId', reviewsController.unflagReview);

// DELETE review (admin only)
router.delete('/admin/:reviewId', reviewsController.adminDeleteReview);

module.exports = router;
