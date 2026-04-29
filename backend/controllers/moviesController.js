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

// POST - Add new movie (admin only)
const addMovie = async (req, res) => {
    try {
        const { title, description, release_year, duration_minutes, genreIds } = req.body;

        // Validate input
        if (!title || !release_year || !duration_minutes) {
            return res.status(400).json({ success: false, message: 'Title, release year, and duration are required' });
        }

        let movieId = null;

        try {
            const request = new sql.Request();
            
            // Insert movie with OUTPUT to get the ID
            const movieResult = await request
                .input('Title', sql.VarChar, title.trim())
                .input('Description', sql.VarChar, description ? description.trim() : null)
                .input('ReleaseYear', sql.Int, parseInt(release_year))
                .input('DurationMinutes', sql.Int, parseInt(duration_minutes))
                .query(`
                    DECLARE @InsertedIds TABLE (id INT);
                    INSERT INTO Movies (title, description, release_year, duration_minutes)
                    OUTPUT INSERTED.movie_id INTO @InsertedIds
                    VALUES (@Title, @Description, @ReleaseYear, @DurationMinutes);
                    SELECT id as movie_id FROM @InsertedIds;
                `);

            if (!movieResult.recordset || movieResult.recordset.length === 0) {
                console.error('Movie insert failed - no ID returned');
                return res.status(500).json({ success: false, message: 'Failed to insert movie' });
            }

            movieId = movieResult.recordset[0].movie_id;
            console.log('[OK] Inserted movie with ID:', movieId);
        } catch (insertErr) {
            console.error('✗ Insert movie error:', insertErr.message);
            throw insertErr;
        }

        // Link genres to movie
        if (genreIds && Array.isArray(genreIds) && genreIds.length > 0) {
            try {
                for (const genreId of genreIds) {
                    const genreRequest = new sql.Request();
                    await genreRequest
                        .input('MovieId', sql.Int, movieId)
                        .input('GenreId', sql.Int, parseInt(genreId))
                        .query('INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (@MovieId, @GenreId)');
                }
                console.log('[OK] Linked', genreIds.length, 'genres to movie', movieId);
            } catch (genreErr) {
                console.error('✗ Error linking genres:', genreErr.message);
                // Don't throw - genre linking failure shouldn't fail the entire operation
            }
        }

        res.json({
            success: true,
            message: 'Movie added successfully',
            movie: {
                movie_id: movieId,
                title,
                description,
                release_year,
                duration_minutes
            }
        });
    } catch (err) {
        console.error('✗ Add movie error:', err.message);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

module.exports = { getMovies, getMovieById, getGenres, addMovie };
