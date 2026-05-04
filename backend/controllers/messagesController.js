const sql = require('mssql');
const config = require('../config/db');

// Send message
const sendMessage = async (req, res) => {
    try {
        const { senderId, recipientId, content } = req.body;

        if (!senderId || !recipientId || !content) {
            return res.status(400).json({ success: false, message: 'Sender, recipient, and content required' });
        }

        if (senderId === recipientId) {
            return res.status(400).json({ success: false, message: 'Cannot message yourself' });
        }

        const pool = await sql.connect(config);

        // Check if users are friends
        const friendCheckResult = await pool.request()
            .input('userId1', sql.Int, senderId)
            .input('userId2', sql.Int, recipientId)
            .query(`
                SELECT user_id FROM Friends 
                WHERE user_id = @userId1 AND friend_id = @userId2
            `);

        if (!friendCheckResult.recordset.length) {
            return res.status(403).json({ success: false, message: 'You must be friends to message' });
        }

        // Insert message
        const result = await pool.request()
            .input('senderId', sql.Int, senderId)
            .input('recipientId', sql.Int, recipientId)
            .input('content', sql.VarChar, content.slice(0, 2000))
            .query(`
                INSERT INTO Messages (sender_id, recipient_id, content, is_read)
                OUTPUT INSERTED.message_id, INSERTED.sent_at
                VALUES (@senderId, @recipientId, @content, 0)
            `);

        const message = result.recordset[0];

        res.json({ success: true, message: 'Message sent', messageId: message.message_id, sentAt: message.sent_at });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, message: 'Failed to send message' });
    }
};

// Get messages between two users (polling endpoint)
const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { friendId } = req.query;

        if (!userId || !friendId) {
            return res.status(400).json({ success: false, message: 'User ID and friend ID required' });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .input('friendId', sql.Int, parseInt(friendId))
            .query(`
                SELECT 
                    message_id,
                    sender_id,
                    recipient_id,
                    content,
                    sent_at,
                    is_read
                FROM Messages
                WHERE (sender_id = @userId AND recipient_id = @friendId)
                   OR (sender_id = @friendId AND recipient_id = @userId)
                ORDER BY sent_at ASC
            `);

        // Mark messages as read
        await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .input('friendId', sql.Int, parseInt(friendId))
            .query(`
                UPDATE Messages
                SET is_read = 1
                WHERE recipient_id = @userId AND sender_id = @friendId
            `);

        res.json({ success: true, messages: result.recordset });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.params;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .query(`
                SELECT COUNT(*) as unread_count FROM Messages
                WHERE recipient_id = @userId AND is_read = 0
            `);

        res.json({ success: true, unreadCount: result.recordset[0].unread_count });
    } catch (err) {
        console.error('Error fetching unread count:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch unread count' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getUnreadCount
};
