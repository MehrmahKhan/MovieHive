const express = require('express');
const router = express.Router();
const { sendFriendRequest, getPendingRequests, acceptFriendRequest, getFriendsList } = require('../controllers/friendsController');

// Send friend request
router.post('/request/send', sendFriendRequest);

// Get pending requests for a user
router.get('/:userId/requests', getPendingRequests);

// Accept friend request
router.post('/request/:requestId/accept', acceptFriendRequest);

// Get friends list
router.get('/:userId/list', getFriendsList);

module.exports = router;
