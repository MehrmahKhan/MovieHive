const sql = require('mssql');

// GET all movies with filters
const getMovies = async (req, res) => {
    try {
        const { search, genre, minRating } = req.query;
        let query = `
            SELECT DISTINCT
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.duration_minutes,
                AVG(CAST(r.rating AS DECIMAL(5,2))) AS avg_rating,
                COUNT(r.review_id) AS review_count,
                STRING_AGG(g.genre_name, ', ') AS genres
            FROM Movies m
            LEFT JOIN Reviews r ON r.movie_id = m.movie_id
            LEFT JOIN Movie_Genres mg ON mg.movie_id = m.movie_id
            LEFT JOIN Genres g ON g.genre_id = mg.genre_id
            WHERE 1=1
        `;

        let params = [];

        if (search && search.trim()) {
            query += ` AND (m.title LIKE @search OR m.description LIKE @search)`;
            params.push({ name: 'search', value: `%${search}%` });
        }

        if (genre && genre.trim()) {
            query += ` AND g.genre_name = @genre`;
            params.push({ name: 'genre', value: genre });
        }

        query += ` GROUP BY m.movie_id, m.title, m.description, m.release_year, m.duration_minutes`;

        if (minRating) {
            query += ` HAVING AVG(CAST(r.rating AS DECIMAL(5,2))) >= @minRating`;
            params.push({ name: 'minRating', value: parseFloat(minRating) });
        }

        query += ` ORDER BY m.title`;

        const request = new sql.Request();
        params.forEach(p => request.input(p.name, p.value));
        const result = await request.query(query);

        res.json({
            success: true,
            movies: result.recordset || [],
            count: result.recordset.length
        });
    } catch (err) {
        console.error('Get movies error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch movies' });
    }
};

// GET movie by ID with reviews
const getMovieById = async (req, res) => {
    try {
        const { movieId } = req.params;

        const request = new sql.Request();
        request.input('MovieId', sql.Int, movieId);
        
        const result = await request.query(`
            SELECT TOP 1
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.duration_minutes,
                AVG(CAST(r.rating AS DECIMAL(5,2))) AS avg_rating,
                COUNT(r.review_id) AS review_count,
                STRING_AGG(g.genre_name, ', ') AS genres
            FROM Movies m
            LEFT JOIN Reviews r ON r.movie_id = m.movie_id
            LEFT JOIN Movie_Genres mg ON mg.movie_id = m.movie_id
            LEFT JOIN Genres g ON g.genre_id = mg.genre_id
            WHERE m.movie_id = @MovieId
            GROUP BY m.movie_id, m.title, m.description, m.release_year, m.duration_minutes
        `);

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        res.json({ success: true, movie: result.recordset[0] });
    } catch (err) {
        console.error('Get movie by ID error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch movie' });
    }
};

// GET all genres
const getGenres = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query('SELECT genre_id, genre_name FROM Genres ORDER BY genre_name');
        
        res.json({
            success: true,
            genres: result.recordset || []
        });
    } catch (err) {
        console.error('Get genres error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch genres' });
    }
};

module.exports = { getMovies, getMovieById, getGenres };
