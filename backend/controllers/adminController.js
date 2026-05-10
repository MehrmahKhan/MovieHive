const sql = require('mssql');
const bcrypt = require('bcrypt');

const verifyAdmin = async (adminUserId) => {
    if (!adminUserId || Number.isNaN(adminUserId)) {
        return null;
    }

    const result = await new sql.Request()
        .input('adminUserId', sql.Int, adminUserId)
        .query('SELECT user_id, name, email, role FROM Users WHERE user_id = @adminUserId');

    if (!result.recordset.length || result.recordset[0].role !== 'admin') {
        return null;
    }

    return result.recordset[0];
};

const getSystemOverview = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const summaryResult = await new sql.Request().query(`
            SELECT
                (SELECT COUNT(*) FROM Users) AS total_users,
                (SELECT COUNT(*) FROM Movies) AS total_movies,
                (SELECT COUNT(*) FROM Reviews) AS total_reviews,
                CAST(COALESCE((SELECT AVG(CAST(rating AS DECIMAL(5,2))) FROM Reviews), 0) AS DECIMAL(5,2)) AS avg_rating
        `);

        const summary = summaryResult.recordset[0] || {};

        res.json({
            success: true,
            summary: {
                totalUsers: summary.total_users || 0,
                totalMovies: summary.total_movies || 0,
                totalReviews: summary.total_reviews || 0,
                avgRating: Number(summary.avg_rating || 0).toFixed(1)
            }
        });
    } catch (err) {
        console.error('Get system overview error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch system overview' });
    }
};

const getUsers = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const result = await new sql.Request().query(`
            SELECT user_id, name, email, role, created_at
            FROM Users
            ORDER BY created_at DESC, user_id DESC
        `);

        res.json({ success: true, users: result.recordset || [] });
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

const updateUser = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const userId = parseInt(req.params.userId, 10);
        const { name, email, role } = req.body;

        if (!userId || !name || !email || !role) {
            return res.status(400).json({ success: false, message: 'userId, name, email, and role are required' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const duplicate = await new sql.Request()
            .input('email', sql.VarChar, email.trim())
            .input('userId', sql.Int, userId)
            .query('SELECT user_id FROM Users WHERE email = @email AND user_id <> @userId');

        if (duplicate.recordset.length) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        await new sql.Request()
            .input('userId', sql.Int, userId)
            .input('name', sql.VarChar, name.trim())
            .input('email', sql.VarChar, email.trim())
            .input('role', sql.VarChar, role)
            .query(`
                UPDATE Users
                SET name = @name,
                    email = @email,
                    role = @role
                WHERE user_id = @userId
            `);

        res.json({
            success: true,
            message: 'User updated successfully',
            user: { id: userId, name: name.trim(), email: email.trim(), role }
        });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const userId = parseInt(req.params.userId, 10);
        const { newPassword } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({ success: false, message: 'userId and newPassword are required' });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await new sql.Request()
            .input('userId', sql.Int, userId)
            .input('passwordHash', sql.VarChar, hashedPassword)
            .query('UPDATE Users SET password_hash = @passwordHash WHERE user_id = @userId');

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset user password error:', err);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const userId = parseInt(req.params.userId, 10);

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Valid userId required' });
        }

        if (userId === adminUserId) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
        }

        // Transactional cleanup: remove dependent rows before deleting user
        let pool = null;
        let transaction = null;
        try {
            pool = await sql.connect(require('../config/db'));
            transaction = new sql.Transaction(pool);
            await transaction.begin();

            // Delete movies from collections owned by user
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query(`
                    DELETE cm FROM Collection_Movies cm
                    INNER JOIN Collections c ON cm.collection_id = c.collection_id
                    WHERE c.user_id = @userId
                `);

            // Delete collection shares where user is owner or shared_with
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Collection_Shares WHERE shared_with_user_id = @userId');

            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Collection_Shares WHERE collection_id IN (SELECT collection_id FROM Collections WHERE user_id = @userId)');

            // Delete collections owned by user
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Collections WHERE user_id = @userId');

            // Delete watchlist entries
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Watchlist WHERE user_id = @userId');

            // Delete reviews by user
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Reviews WHERE user_id = @userId');

            // Delete messages where user is sender or recipient
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Messages WHERE sender_id = @userId OR recipient_id = @userId');

            // Delete friend relationships where user is either side
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Friends WHERE user_id = @userId OR friend_id = @userId');

            // Finally delete user
            await new sql.Request(transaction)
                .input('userId', sql.Int, userId)
                .query('DELETE FROM Users WHERE user_id = @userId');

            await transaction.commit();

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (delErr) {
            console.error('Delete user error:', delErr);
            try {
                if (transaction) await transaction.rollback();
            } catch (rbErr) {
                console.error('Rollback failed during deleteUser:', rbErr);
            }
            res.status(500).json({ success: false, message: 'Failed to delete user' });
        }
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

const getTopMovies = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const result = await new sql.Request().query(`
            SELECT TOP 10
                m.movie_id,
                m.title,
                m.release_year,
                COUNT(r.review_id) AS total_reviews,
                CAST(COALESCE(AVG(CAST(r.rating AS DECIMAL(5,2))), 0) AS DECIMAL(5,2)) AS avg_rating
            FROM Movies m
            LEFT JOIN Reviews r ON m.movie_id = r.movie_id
            GROUP BY m.movie_id, m.title, m.release_year
            ORDER BY avg_rating DESC, total_reviews DESC
        `);

        res.json({ success: true, movies: result.recordset || [] });
    } catch (err) {
        console.error('Get top movies error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch top movies' });
    }
};

const getFlaggedReviewsSummary = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const result = await new sql.Request().query(`
            SELECT
                COUNT(*) AS total_flagged,
                (SELECT COUNT(*) FROM Reviews WHERE is_flagged = 1 AND flagged_date > DATEADD(DAY, -7, GETDATE())) AS flagged_last_week
            FROM Reviews
            WHERE is_flagged = 1
        `);

        const summary = result.recordset[0] || {};
        const recentResult = await new sql.Request().query(`
            SELECT TOP 5
                r.review_id, r.review_text, r.flag_reason, u.name, m.title
            FROM Reviews r
            LEFT JOIN Users u ON r.user_id = u.user_id
            LEFT JOIN Movies m ON r.movie_id = m.movie_id
            WHERE r.is_flagged = 1
            ORDER BY r.flagged_date DESC
        `);

        res.json({
            success: true,
            summary: {
                totalFlagged: summary.total_flagged || 0,
                flaggedLastWeek: summary.flagged_last_week || 0,
                recentFlagged: recentResult.recordset || []
            }
        });
    } catch (err) {
        console.error('Get flagged reviews error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch flagged reviews' });
    }
};

const getSignupTrends = async (req, res) => {
    try {
        const adminUserId = parseInt(req.query.adminUserId, 10);
        const admin = await verifyAdmin(adminUserId);

        if (!admin) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const result = await new sql.Request().query(`
            SELECT
                DATEPART(MONTH, created_at) AS month,
                DATEPART(YEAR, created_at) AS year,
                COUNT(*) AS signup_count
            FROM Users
            WHERE created_at >= DATEADD(MONTH, -6, GETDATE())
            GROUP BY DATEPART(YEAR, created_at), DATEPART(MONTH, created_at)
            ORDER BY year DESC, month DESC
        `);

        res.json({ success: true, trends: result.recordset || [] });
    } catch (err) {
        console.error('Get signup trends error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch signup trends' });
    }
};

module.exports = {
    getTopMovies,
    getFlaggedReviewsSummary,
    getSignupTrends,
    getSystemOverview,
    getUsers,
    updateUser,
    resetUserPassword,
    deleteUser
};