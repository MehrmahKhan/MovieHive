const sql = require('mssql');
const config = require('../config/db');

// Get all reviews for a specific movie
const getMovieReviews = async (req, res) => {
    try {
        const { movieId } = req.params;

        if (!movieId || isNaN(movieId)) {
            return res.status(400).json({ success: false, message: 'Invalid movie ID' });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('movieId', sql.Int, parseInt(movieId))
            .query(`
                SELECT 
                    r.review_id,
                    r.user_id,
                    u.name as username,
                    r.movie_id,
                    r.rating,
                    r.review_text,
                    r.review_date,
                    dbo.fn_ReviewSentimentScore(r.review_text) as sentiment_score
                FROM Reviews r
                LEFT JOIN Users u ON r.user_id = u.user_id
                WHERE r.movie_id = @movieId
                ORDER BY r.review_date DESC
            `);

        res.json({ success: true, reviews: result.recordset });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
};

// Get a user's review for a specific movie (if they already reviewed)
const getUserMovieReview = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { userId } = req.query;

        if (!movieId || !userId) {
            return res.status(400).json({ success: false, message: 'Movie ID and User ID required' });
        }

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('movieId', sql.Int, parseInt(movieId))
            .input('userId', sql.Int, parseInt(userId))
            .query(`
                SELECT 
                    review_id,
                    user_id,
                    movie_id,
                    rating,
                    review_text,
                    review_date
                FROM Reviews
                WHERE movie_id = @movieId AND user_id = @userId
            `);

        if (result.recordset.length > 0) {
            res.json({ success: true, review: result.recordset[0] });
        } else {
            res.json({ success: true, review: null });
        }
    } catch (err) {
        console.error('Error fetching user review:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch review' });
    }
};

// Add a new review
const addReview = async (req, res) => {
    try {
        const { userId, movieId, rating, reviewText } = req.body;

        // Validation
        if (!userId || !movieId || !rating) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID, Movie ID, and rating are required' 
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rating must be between 1 and 5' 
            });
        }

        const pool = await sql.connect(config);
        
        // Try to insert the review
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('movieId', sql.Int, movieId)
            .input('rating', sql.Int, rating)
            .input('reviewText', sql.NVarChar(1000), reviewText || null)
            .query(`
                INSERT INTO Reviews (user_id, movie_id, rating, review_text)
                VALUES (@userId, @movieId, @rating, @reviewText);
                
                SELECT SCOPE_IDENTITY() as review_id;
            `);

        const reviewId = result.recordset[0].review_id;

        // Fetch and return the newly created review with username
        const newReview = await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .query(`
                SELECT 
                    r.review_id,
                    r.user_id,
                    u.name as username,
                    r.movie_id,
                    r.rating,
                    r.review_text,
                    r.review_date,
                    dbo.fn_ReviewSentimentScore(r.review_text) as sentiment_score
                FROM Reviews r
                LEFT JOIN Users u ON r.user_id = u.user_id
                WHERE r.review_id = @reviewId
            `);

        res.json({ 
            success: true, 
            message: 'Review added successfully',
            review: newReview.recordset[0]
        });

    } catch (err) {
        console.error('Error adding review:', err);
        
        // Check if it's a unique constraint violation (user already reviewed)
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(409).json({ 
                success: false, 
                message: 'You have already reviewed this movie. Please edit your existing review.' 
            });
        }

        res.status(500).json({ success: false, message: 'Failed to add review' });
    }
};

// Update an existing review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, reviewText } = req.body;

        if (!reviewId || !rating) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review ID and rating are required' 
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                message: 'Rating must be between 1 and 5' 
            });
        }

        const pool = await sql.connect(config);
        
        await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .input('rating', sql.Int, rating)
            .input('reviewText', sql.NVarChar(1000), reviewText || null)
            .query(`
                UPDATE Reviews
                SET rating = @rating, review_text = @reviewText
                WHERE review_id = @reviewId
            `);

        // Fetch updated review
        const updated = await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .query(`
                SELECT 
                    r.review_id,
                    r.user_id,
                    u.name as username,
                    r.movie_id,
                    r.rating,
                    r.review_text,
                    r.review_date,
                    dbo.fn_ReviewSentimentScore(r.review_text) as sentiment_score
                FROM Reviews r
                LEFT JOIN Users u ON r.user_id = u.user_id
                WHERE r.review_id = @reviewId
            `);

        res.json({ 
            success: true, 
            message: 'Review updated successfully',
            review: updated.recordset[0]
        });

    } catch (err) {
        console.error('Error updating review:', err);
        res.status(500).json({ success: false, message: 'Failed to update review' });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!reviewId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review ID is required' 
            });
        }

        const pool = await sql.connect(config);
        
        await pool.request()
            .input('reviewId', sql.Int, reviewId)
            .query(`DELETE FROM Reviews WHERE review_id = @reviewId`);

        res.json({ 
            success: true, 
            message: 'Review deleted successfully'
        });

    } catch (err) {
        console.error('Error deleting review:', err);
        res.status(500).json({ success: false, message: 'Failed to delete review' });
    }
};

module.exports = {
    getMovieReviews,
    getUserMovieReview,
    addReview,
    updateReview,
    deleteReview
};
