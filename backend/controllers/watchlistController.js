const sql = require('mssql');
const config = require('../config/db');

// Add a movie to a user's watchlist
const addToWatchlist = async (req, res) => {
    try {
        const { userId, movieId } = req.body;
        console.log('[watchlist] addToWatchlist called', { userId, movieId });
        if (!userId || !movieId) return res.status(400).json({ success: false, message: 'userId and movieId required' });

        const pool = await sql.connect(config);

        // Check if already exists
        const exists = await pool.request()
            .input('userId', sql.Int, userId)
            .input('movieId', sql.Int, movieId)
            .query('SELECT 1 FROM Watchlist WHERE user_id = @userId AND movie_id = @movieId');

        if (exists.recordset.length) {
            return res.status(409).json({ success: false, message: 'Already in watchlist' });
        }

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('movieId', sql.Int, movieId)
            .query('INSERT INTO Watchlist (user_id, movie_id) VALUES (@userId, @movieId)');

        res.json({ success: true, message: 'Added to watchlist' });
    } catch (err) {
        console.error('Add to watchlist error:', err);
        res.status(500).json({ success: false, message: 'Failed to add to watchlist' });
    }
};

// Remove a movie from a user's watchlist
const removeFromWatchlist = async (req, res) => {
    try {
        const { userId, movieId } = req.body;
        console.log('[watchlist] removeFromWatchlist called', { userId, movieId });
        if (!userId || !movieId) return res.status(400).json({ success: false, message: 'userId and movieId required' });

        const pool = await sql.connect(config);
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('movieId', sql.Int, movieId)
            .query('DELETE FROM Watchlist WHERE user_id = @userId AND movie_id = @movieId');

        res.json({ success: true, message: 'Removed from watchlist' });
    } catch (err) {
        console.error('Remove from watchlist error:', err);
        res.status(500).json({ success: false, message: 'Failed to remove from watchlist' });
    }
};

// Get a user's watchlist with movie details
const getWatchlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('userId', sql.Int, parseInt(userId))
            .query(`
                SELECT w.movie_id, m.title, m.description, m.release_year, m.duration_minutes
                FROM Watchlist w
                INNER JOIN Movies m ON m.movie_id = w.movie_id
                WHERE w.user_id = @userId
                ORDER BY w.added_at DESC
            `);

        res.json({ success: true, movies: result.recordset || [] });
    } catch (err) {
        console.error('Get watchlist error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch watchlist' });
    }
};

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlist };
