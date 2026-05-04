const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getUnreadCount } = require('../controllers/messagesController');

// Send message (requires friendship)
router.post('/send', sendMessage);

// Get messages between two friends (polling)
router.get('/:userId', getMessages);

// Get unread count for user
router.get('/:userId/unread', getUnreadCount);

module.exports = router;
