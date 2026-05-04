const sql = require('mssql');
const config = require('../config/db');

// Send friend request
const sendFriendRequest = async (req, res) => {
    try {
        const { userId, username } = req.body;

        if (!userId || !username) {
            return res.status(400).json({ success: false, message: 'User ID and username required' });
        }


        const pool = await sql.connect(config);

        // Get recipient user by username
        const recipientResult = await pool.request()
            .input('username', sql.VarChar, username)
            .query('SELECT user_id FROM Users WHERE name = @username');

        if (!recipientResult.recordset.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const toUserId = recipientResult.recordset[0].user_id;

        if (userId === toUserId) {
            return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
        }

        // Check if request already exists
        const existingResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('toUserId', sql.Int, toUserId)
            .query(`
                SELECT request_id FROM FriendRequests 
                WHERE (from_user_id = @userId AND to_user_id = @toUserId)
                   OR (from_user_id = @toUserId AND to_user_id = @userId)
            `);

        if (existingResult.recordset.length) {
            return res.status(409).json({ success: false, message: 'Request already exists' });
        }

        // Create friend request
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('toUserId', sql.Int, toUserId)
            .query(`
                INSERT INTO FriendRequests (from_user_id, to_user_id, status)
                VALUES (@userId, @toUserId, 'pending')
            `);

        res.json({ success: true, message: 'Friend request sent', toUserId });
    } catch (err) {
        console.error('Error sending friend request:', err);
        res.status(500).json({ success: false, message: 'Failed to send request' });
    }
};

// Get pending friend requests for a user
const getPendingRequests = async (req, res) => {
    try {
        const { userId } = req.params;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('toUserId', sql.Int, parseInt(userId))
            .query(`
                SELECT 
                    fr.request_id,
                    fr.from_user_id,
                    u.name as from_user_name,
                    fr.created_at
                FROM FriendRequests fr
                INNER JOIN Users u ON fr.from_user_id = u.user_id
                WHERE fr.to_user_id = @toUserId AND fr.status = 'pending'
                ORDER BY fr.created_at DESC
            `);

        res.json({ success: true, requests: result.recordset });
    } catch (err) {
        console.error('Error fetching pending requests:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
};

// Accept friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const pool = await sql.connect(config);

        // Get request details
        const requestResult = await pool.request()
            .input('requestId', sql.Int, parseInt(requestId))
            .query('SELECT from_user_id, to_user_id FROM FriendRequests WHERE request_id = @requestId');

        if (!requestResult.recordset.length) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        const { from_user_id, to_user_id } = requestResult.recordset[0];

        // Update request status
        await pool.request()
            .input('requestId', sql.Int, parseInt(requestId))
            .query("UPDATE FriendRequests SET status = 'accepted' WHERE request_id = @requestId");

        // Add both directions to Friends table (mutual)
        await pool.request()
            .input('userId1', sql.Int, from_user_id)
            .input('userId2', sql.Int, to_user_id)
            .query(`
                INSERT INTO Friends (user_id, friend_id)
                VALUES (@userId1, @userId2)
            `);

        await pool.request()
            .input('userId1', sql.Int, to_user_id)
            .input('userId2', sql.Int, from_user_id)
            .query(`
                INSERT INTO Friends (user_id, friend_id)
                VALUES (@userId1, @userId2)
            `);

        res.json({ success: true, message: 'Friend request accepted' });
    } catch (err) {
        console.error('Error accepting friend request:', err);
        res.status(500).json({ success: false, message: 'Failed to accept request' });
    }
};

// Get friends list for a user
const getFriendsList = async (req, res) => {
    try {
        const { userId } = req.params;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .query(`
                SELECT 
                    f.friend_id,
                    u.name as friend_name,
                    u.email,
                    f.since
                FROM Friends f
                INNER JOIN Users u ON f.friend_id = u.user_id
                WHERE f.user_id = @userId
                ORDER BY f.since DESC
            `);

        res.json({ success: true, friends: result.recordset });
    } catch (err) {
        console.error('Error fetching friends list:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch friends' });
    }
};

module.exports = {
    sendFriendRequest,
    getPendingRequests,
    acceptFriendRequest,
    getFriendsList
};
