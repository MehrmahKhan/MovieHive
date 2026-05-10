const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const forumController = require('../controllers/forumController');

router.get('/summary', adminController.getSystemOverview);
router.get('/reports/top-movies', adminController.getTopMovies);
router.get('/reports/flagged-reviews', adminController.getFlaggedReviewsSummary);
router.get('/reports/signup-trends', adminController.getSignupTrends);
router.get('/users', adminController.getUsers);
router.put('/users/:userId', adminController.updateUser);
router.put('/users/:userId/password', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);

// Forum moderation
router.delete('/forums/threads/:threadId', forumController.adminDeleteThread);
router.delete('/forums/replies/:replyId', forumController.adminDeleteReply);

module.exports = router;