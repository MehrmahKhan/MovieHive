const express = require('express');
const forumController = require('../controllers/forumController');

const router = express.Router();

router.get('/categories', forumController.getForumCategories);
router.get('/threads', forumController.getForumThreads);
router.get('/threads/:threadId', forumController.getForumThread);
router.post('/threads', forumController.createForumThread);
router.post('/threads/:threadId/replies', forumController.addForumReply);

module.exports = router;