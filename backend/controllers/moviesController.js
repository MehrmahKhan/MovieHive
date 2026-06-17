const sql = require('mssql');
const config = require('../config/db');

// GET all movies with filters
const getMovies = async (req, res) => {
    try {
        const { search, genre, minRating, maxRating, minYear, maxYear, actor } = req.query;
        
        let query = `
            SELECT DISTINCT
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.duration_minutes,
                m.is_upcoming,
                AVG(CAST(r.rating AS DECIMAL(5,2))) AS avg_rating,
                COUNT(r.review_id) AS review_count,
                STRING_AGG(g.genre_name, ', ') AS genres
            FROM Movies m
            LEFT JOIN Reviews r ON r.movie_id = m.movie_id
            LEFT JOIN Movie_Genres mg ON mg.movie_id = m.movie_id
            LEFT JOIN Genres g ON g.genre_id = mg.genre_id
        `;

        let params = [];

        // Add actor JOINs if actor filter is present
        if (actor && actor.trim()) {
            query += ` INNER JOIN Movie_Cast mc ON mc.movie_id = m.movie_id
                       INNER JOIN Persons p ON p.person_id = mc.person_id`;
        }

        query += ` WHERE 1=1`;

        if (search && search.trim()) {
            query += ` AND (m.title LIKE @search OR m.description LIKE @search)`;
            params.push({ name: 'search', value: `%${search}%` });
        }

        if (genre && genre.trim()) {
            query += ` AND g.genre_name = @genre`;
            params.push({ name: 'genre', value: genre });
        }

        if (minYear) {
            query += ` AND m.release_year >= @minYear`;
            params.push({ name: 'minYear', value: parseInt(minYear) });
        }

        if (maxYear) {
            query += ` AND m.release_year <= @maxYear`;
            params.push({ name: 'maxYear', value: parseInt(maxYear) });
        }

        if (actor && actor.trim()) {
            query += ` AND p.full_name LIKE @actor`;
            params.push({ name: 'actor', value: `%${actor}%` });
        }

        query += ` GROUP BY m.movie_id, m.title, m.description, m.release_year, m.duration_minutes, m.is_upcoming`;

        let havingConditions = [];
        if (minRating) {
            havingConditions.push(`AVG(CAST(r.rating AS DECIMAL(5,2))) >= @minRating`);
            params.push({ name: 'minRating', value: parseFloat(minRating) });
        }

        if (maxRating) {
            havingConditions.push(`AVG(CAST(r.rating AS DECIMAL(5,2))) <= @maxRating`);
            params.push({ name: 'maxRating', value: parseFloat(maxRating) });
        }

        if (havingConditions.length > 0) {
            query += ` HAVING ` + havingConditions.join(' AND ');
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

// GET browse section movies (discover | trending | upcoming | top-rated)
const getBrowseMovies = async (req, res) => {
    try {
        const section = (req.params.section || 'discover').toLowerCase();

        let query = `
            SELECT
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

        const filters = [];

        if (section === 'trending') {
            // handled after GROUP BY
        } else if (section === 'upcoming') {
            filters.push(`m.is_upcoming = 1`);
        } else if (section === 'top-rated') {
        } else {
            // discover section has no extra filter
        }

        if (filters.length > 0) {
            query += ` AND ${filters.join(' AND ')}`;
        }

        query += ` GROUP BY m.movie_id, m.title, m.description, m.release_year, m.duration_minutes`;

        if (section === 'trending') {
            query += ` ORDER BY COUNT(r.review_id) DESC, AVG(CAST(r.rating AS DECIMAL(5,2))) DESC, m.title ASC`;
        } else if (section === 'upcoming') {
            query += ` ORDER BY m.release_year ASC, m.title ASC`;
        } else if (section === 'top-rated') {
            // Require at least one review so unrated movies do not appear in top-rated
            query += ` HAVING COUNT(r.review_id) > 0`;
            query += ` ORDER BY AVG(CAST(r.rating AS DECIMAL(5,2))) DESC, COUNT(r.review_id) DESC, m.title ASC`;
        } else {
            query += ` ORDER BY m.title ASC`;
        }

        const request = new sql.Request();
        const result = await request.query(query);

        res.json({
            success: true,
            section,
            movies: result.recordset || [],
            count: (result.recordset || []).length
        });
    } catch (err) {
        console.error('Get browse movies error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch browse movies' });
    }
};

// GET movie by ID with reviews
const getMovieById = async (req, res) => {
    try {
        const { movieId } = req.params;

        const movieRequest = new sql.Request();
        movieRequest.input('MovieId', sql.Int, movieId);

        const result = await movieRequest.query(`
            SELECT TOP 1
                m.movie_id,
                m.title,
                m.description,
                m.release_year,
                m.duration_minutes,
                m.is_upcoming,
                AVG(CAST(r.rating AS DECIMAL(5,2))) AS avg_rating,
                COUNT(r.review_id) AS review_count,
                STRING_AGG(g.genre_name, ', ') AS genres
            FROM Movies m
            LEFT JOIN Reviews r ON r.movie_id = m.movie_id
            LEFT JOIN Movie_Genres mg ON mg.movie_id = m.movie_id
            LEFT JOIN Genres g ON g.genre_id = mg.genre_id
            WHERE m.movie_id = @MovieId
            GROUP BY m.movie_id, m.title, m.description, m.release_year, m.duration_minutes, m.is_upcoming
        `);

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        const castRequest = new sql.Request();
        castRequest.input('MovieId', sql.Int, movieId);
        const castResult = await castRequest.query(`
            SELECT
                mc.person_id,
                p.full_name,
                p.birth_date,
                mc.role_name
            FROM Movie_Cast mc
            INNER JOIN Persons p ON p.person_id = mc.person_id
            WHERE mc.movie_id = @MovieId AND mc.role_name NOT IN ('Director', 'Producer', 'Writer', 'Cinematographer')
            ORDER BY p.full_name ASC
        `);

        const crewRequest = new sql.Request();
        crewRequest.input('MovieId', sql.Int, movieId);
        const crewResult = await crewRequest.query(`
            SELECT
                mc.person_id,
                p.full_name,
                p.birth_date,
                mc.role_name
            FROM Movie_Cast mc
            INNER JOIN Persons p ON p.person_id = mc.person_id
            WHERE mc.movie_id = @MovieId AND mc.role_name IN ('Director', 'Producer', 'Writer', 'Cinematographer')
            ORDER BY mc.role_name DESC, p.full_name ASC
        `);

        const movie = result.recordset[0];
        movie.cast = castResult.recordset || [];
        movie.crew = crewResult.recordset || [];

        res.json({ success: true, movie });
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
        const { title, description, release_year, duration_minutes, genreIds, castMembers, isUpcoming } = req.body;
        const normalizedIsUpcoming = isUpcoming === true || isUpcoming === 'true' || isUpcoming === 1 || isUpcoming === '1';

        // Validate input
        if (!title || !release_year || !duration_minutes) {
            return res.status(400).json({ success: false, message: 'Title, release year, and duration are required' });
        }

        const normalizedCastMembers = Array.isArray(castMembers)
            ? castMembers
            : String(castMembers || '')
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    const parts = line.split(/\s+as\s+/i);
                    return {
                        full_name: (parts[0] || '').trim(),
                        role_name: (parts[1] || '').trim() || 'Cast Member'
                    };
                });

        let pool = null;
        let transaction = null;
        let movieId = null;

        try {
            pool = await sql.connect(config);
            transaction = new sql.Transaction(pool);
            await transaction.begin();

            // Insert movie and get ID using transaction-scoped request
            const trRequest = new sql.Request(transaction);
            const movieResult = await trRequest
                .input('Title', sql.VarChar, title.trim())
                .input('Description', sql.VarChar, description ? description.trim() : null)
                .input('ReleaseYear', sql.Int, parseInt(release_year))
                .input('DurationMinutes', sql.Int, parseInt(duration_minutes))
                .input('IsUpcoming', sql.Bit, normalizedIsUpcoming ? 1 : 0)
                .query(`
                    DECLARE @InsertedIds TABLE (id INT);
                    INSERT INTO Movies (title, description, release_year, duration_minutes, is_upcoming)
                    OUTPUT INSERTED.movie_id INTO @InsertedIds
                    VALUES (@Title, @Description, @ReleaseYear, @DurationMinutes, @IsUpcoming);
                    SELECT id as movie_id FROM @InsertedIds;
                `);

            if (!movieResult.recordset || movieResult.recordset.length === 0) {
                throw new Error('Failed to insert movie');
            }

            movieId = movieResult.recordset[0].movie_id;

            // Link genres
            if (genreIds && Array.isArray(genreIds) && genreIds.length > 0) {
                for (const genreId of genreIds) {
                    await new sql.Request(transaction)
                        .input('MovieId', sql.Int, movieId)
                        .input('GenreId', sql.Int, parseInt(genreId))
                        .query('INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (@MovieId, @GenreId)');
                }
            }

            // Link cast members
            if (normalizedCastMembers.length > 0) {
                for (const member of normalizedCastMembers) {
                    const fullName = String(member.full_name || '').trim();
                    const roleName = String(member.role_name || 'Cast Member').trim() || 'Cast Member';

                    if (!fullName) continue;

                    const personLookup = await new sql.Request(transaction)
                        .input('FullName', sql.VarChar, fullName)
                        .query('SELECT person_id FROM Persons WHERE full_name = @FullName');

                    let personId = personLookup.recordset?.[0]?.person_id;

                    if (!personId) {
                        const personResult = await new sql.Request(transaction)
                            .input('FullName', sql.VarChar, fullName)
                            .query(`
                                DECLARE @InsertedPeople TABLE (person_id INT);
                                INSERT INTO Persons (full_name)
                                OUTPUT INSERTED.person_id INTO @InsertedPeople
                                VALUES (@FullName);
                                SELECT person_id FROM @InsertedPeople;
                            `);
                        personId = personResult.recordset?.[0]?.person_id;
                    }

                    if (personId) {
                        await new sql.Request(transaction)
                            .input('MovieId', sql.Int, movieId)
                            .input('PersonId', sql.Int, personId)
                            .input('RoleName', sql.VarChar, roleName)
                            .query('INSERT INTO Movie_Cast (movie_id, person_id, role_name) VALUES (@MovieId, @PersonId, @RoleName)');
                    }
                }
            }

            await transaction.commit();
            console.log('[OK] Inserted movie with ID:', movieId);
        } catch (txErr) {
            console.error('Transaction error (addMovie):', txErr.message);
            try {
                if (transaction) await transaction.rollback();
            } catch (rbErr) {
                console.error('Rollback failed (addMovie):', rbErr.message);
            }
            return res.status(500).json({ success: false, message: 'Failed to add movie: ' + txErr.message });
        }

        res.json({
            success: true,
            message: 'Movie added successfully',
            movie: {
                movie_id: movieId,
                title,
                description,
                release_year,
                duration_minutes,
                is_upcoming: normalizedIsUpcoming,
                castMembers: normalizedCastMembers
            }
        });
    } catch (err) {
        console.error('Add movie error:', err.message);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

const updateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { adminUserId: rawAdminUserId, title, description, release_year, duration_minutes, genreIds, isUpcoming } = req.body;

        const adminUserId = parseInt(rawAdminUserId, 10);
        if (Number.isNaN(adminUserId)) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const admin = await new sql.Request()
            .input('adminUserId', sql.Int, adminUserId)
            .query('SELECT user_id, role FROM Users WHERE user_id = @adminUserId');

        if (!admin.recordset.length || admin.recordset[0].role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        if (!movieId || !title || !release_year || !duration_minutes) {
            return res.status(400).json({ success: false, message: 'Movie ID, title, release year, and duration are required' });
        }

        const normalizedIsUpcoming = isUpcoming === true || isUpcoming === 'true' || isUpcoming === 1 || isUpcoming === '1';

        let pool = null;
        let transaction = null;
        try {
            pool = await sql.connect(config);
            transaction = new sql.Transaction(pool);
            await transaction.begin();

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .input('Title', sql.VarChar, title.trim())
                .input('Description', sql.VarChar, description ? description.trim() : null)
                .input('ReleaseYear', sql.Int, parseInt(release_year))
                .input('DurationMinutes', sql.Int, parseInt(duration_minutes))
                .input('IsUpcoming', sql.Bit, normalizedIsUpcoming ? 1 : 0)
                .query(`
                    UPDATE Movies
                    SET title = @Title,
                        description = @Description,
                        release_year = @ReleaseYear,
                        duration_minutes = @DurationMinutes,
                        is_upcoming = @IsUpcoming
                    WHERE movie_id = @MovieId
                `);

            if (genreIds && Array.isArray(genreIds) && genreIds.length > 0) {
                await new sql.Request(transaction)
                    .input('MovieId', sql.Int, movieId)
                    .query('DELETE FROM Movie_Genres WHERE movie_id = @MovieId');

                for (const genreId of genreIds) {
                    await new sql.Request(transaction)
                        .input('MovieId', sql.Int, movieId)
                        .input('GenreId', sql.Int, parseInt(genreId))
                        .query('INSERT INTO Movie_Genres (movie_id, genre_id) VALUES (@MovieId, @GenreId)');
                }
            }

            await transaction.commit();

            res.json({
                success: true,
                message: 'Movie updated successfully',
                movie: {
                    movie_id: movieId,
                    title,
                    description,
                    release_year,
                    duration_minutes,
                    is_upcoming: normalizedIsUpcoming
                }
            });
        } catch (txErr) {
            console.error('Transaction error (updateMovie):', txErr.message);
            try {
                if (transaction) await transaction.rollback();
            } catch (rbErr) {
                console.error('Rollback failed (updateMovie):', rbErr.message);
            }
            res.status(500).json({ success: false, message: 'Server error: ' + txErr.message });
        }
    } catch (err) {
        console.error('Update movie error:', err.message);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const rawAdminUserId = req.query.adminUserId;

        const adminUserId = parseInt(rawAdminUserId, 10);
        if (Number.isNaN(adminUserId)) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const admin = await new sql.Request()
            .input('adminUserId', sql.Int, adminUserId)
            .query('SELECT user_id, role FROM Users WHERE user_id = @adminUserId');

        if (!admin.recordset.length || admin.recordset[0].role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        if (!movieId) {
            return res.status(400).json({ success: false, message: 'Movie ID is required' });
        }

        const movie = await new sql.Request()
            .input('MovieId', sql.Int, movieId)
            .query('SELECT movie_id FROM Movies WHERE movie_id = @MovieId');

        if (!movie.recordset.length) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        let pool = null;
        let transaction = null;
        try {
            pool = await sql.connect(config);
            transaction = new sql.Transaction(pool);
            await transaction.begin();

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .query('DELETE FROM Movie_Genres WHERE movie_id = @MovieId');

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .query('DELETE FROM Movie_Cast WHERE movie_id = @MovieId');

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .query('DELETE FROM Reviews WHERE movie_id = @MovieId');

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .query('DELETE FROM Watchlist WHERE movie_id = @MovieId');

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .query('DELETE FROM Collection_Movies WHERE movie_id = @MovieId');

            await new sql.Request(transaction)
                .input('MovieId', sql.Int, movieId)
                .query('DELETE FROM Movies WHERE movie_id = @MovieId');

            await transaction.commit();

            res.json({
                success: true,
                message: 'Movie deleted successfully'
            });
        } catch (txErr) {
            console.error('Transaction error (deleteMovie):', txErr.message);
            try {
                if (transaction) await transaction.rollback();
            } catch (rbErr) {
                console.error('Rollback failed (deleteMovie):', rbErr.message);
            }
            res.status(500).json({ success: false, message: 'Server error: ' + txErr.message });
        }
    } catch (err) {
        console.error('Delete movie error:', err.message);
        res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
};

module.exports = { getMovies, getBrowseMovies, getMovieById, getGenres, addMovie, updateMovie, deleteMovie };
