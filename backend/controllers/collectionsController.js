const sql = require('mssql');

const hasCollectionSharesTable = async () => {
    const result = await new sql.Request().query("SELECT CASE WHEN OBJECT_ID('dbo.Collection_Shares', 'U') IS NULL THEN 0 ELSE 1 END AS has_table");
    return result.recordset?.[0]?.has_table === 1;
};

const loadCollectionAccess = async (collectionId, userId) => {

    const result = await new sql.Request()
        .input('collectionId', sql.Int, collectionId)
        .input('userId', sql.Int, userId)
        .query(`
            SELECT
                c.collection_id,
                c.collection_name,
                c.user_id AS owner_user_id,
                owner.name AS owner_name,
                CASE
                    WHEN c.user_id = @userId THEN 'owner'
                    WHEN EXISTS (
                        SELECT 1
                        FROM Collection_Shares cs
                        WHERE cs.collection_id = c.collection_id
                          AND cs.shared_with_user_id = @userId
                    ) THEN 'collaborator'
                    ELSE NULL
                END AS access_role
            FROM Collections c
            INNER JOIN Users owner ON owner.user_id = c.user_id
            WHERE c.collection_id = @collectionId
        `);

    if (!result.recordset.length) {
        return null;
    }

    return result.recordset[0];
};

// GET /api/collections/user/:userId
const getUserCollections = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!userId) return res.status(400).json({ success: false, message: 'Valid userId required' });

        const sharesEnabled = await hasCollectionSharesTable();

        if (!sharesEnabled) {
            const ownedOnly = await new sql.Request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT
                        c.collection_id,
                        c.collection_name,
                        c.created_at,
                        c.user_id AS owner_user_id,
                        owner.name AS owner_name,
                        CAST(1 AS BIT) AS is_owner,
                        'owner' AS access_role,
                        COUNT(DISTINCT cm.movie_id) AS movie_count
                    FROM Collections c
                    INNER JOIN Users owner ON owner.user_id = c.user_id
                    LEFT JOIN Collection_Movies cm ON cm.collection_id = c.collection_id
                    WHERE c.user_id = @userId
                    GROUP BY c.collection_id, c.collection_name, c.created_at, c.user_id, owner.name
                    ORDER BY c.created_at DESC, c.collection_id DESC;
                `);

            return res.json({ success: true, collections: ownedOnly.recordset || [] });
        }

        const result = await new sql.Request()
            .input('userId', sql.Int, userId)
            .query(`
                WITH owned AS (
                    SELECT
                        c.collection_id,
                        c.collection_name,
                        c.created_at,
                        c.user_id AS owner_user_id,
                        owner.name AS owner_name,
                        CAST(1 AS BIT) AS is_owner,
                        'owner' AS access_role,
                        COUNT(DISTINCT cm.movie_id) AS movie_count
                    FROM Collections c
                    INNER JOIN Users owner ON owner.user_id = c.user_id
                    LEFT JOIN Collection_Movies cm ON cm.collection_id = c.collection_id
                    WHERE c.user_id = @userId
                    GROUP BY c.collection_id, c.collection_name, c.created_at, c.user_id, owner.name
                ), shared AS (
                    SELECT
                        c.collection_id,
                        c.collection_name,
                        c.created_at,
                        c.user_id AS owner_user_id,
                        owner.name AS owner_name,
                        CAST(0 AS BIT) AS is_owner,
                        'collaborator' AS access_role,
                        COUNT(DISTINCT cm.movie_id) AS movie_count
                    FROM Collections c
                    INNER JOIN Users owner ON owner.user_id = c.user_id
                    INNER JOIN Collection_Shares cs ON cs.collection_id = c.collection_id
                    LEFT JOIN Collection_Movies cm ON cm.collection_id = c.collection_id
                    WHERE cs.shared_with_user_id = @userId
                    GROUP BY c.collection_id, c.collection_name, c.created_at, c.user_id, owner.name
                )
                SELECT *
                FROM owned
                UNION ALL
                SELECT *
                FROM shared
                ORDER BY created_at DESC, collection_id DESC;
            `);

        res.json({ success: true, collections: result.recordset || [] });
    } catch (err) {
        console.error('Get user collections error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch collections' });
    }
};

// POST /api/collections
const createCollection = async (req, res) => {
    try {
        const { userId, collectionName } = req.body;
        if (!userId || !collectionName || !String(collectionName).trim()) {
            return res.status(400).json({ success: false, message: 'userId and collectionName are required' });
        }

        const duplicate = await new sql.Request()
            .input('userId', sql.Int, parseInt(userId, 10))
            .input('collectionName', sql.VarChar, collectionName.trim())
            .query('SELECT collection_id FROM Collections WHERE user_id = @userId AND collection_name = @collectionName');

        if (duplicate.recordset.length) {
            return res.status(409).json({ success: false, message: 'Collection with this name already exists' });
        }

        const result = await new sql.Request()
            .input('userId', sql.Int, parseInt(userId, 10))
            .input('collectionName', sql.VarChar, collectionName.trim())
            .query(`
                DECLARE @Inserted TABLE (collection_id INT);
                INSERT INTO Collections (user_id, collection_name)
                OUTPUT INSERTED.collection_id INTO @Inserted
                VALUES (@userId, @collectionName);
                SELECT collection_id FROM @Inserted;
            `);

        res.json({
            success: true,
            message: 'Collection created',
            collection: {
                collection_id: result.recordset[0].collection_id,
                collection_name: collectionName.trim(),
                user_id: parseInt(userId, 10),
                owner_user_id: parseInt(userId, 10),
                owner_name: null,
                is_owner: true,
                access_role: 'owner'
            }
        });
    } catch (err) {
        console.error('Create collection error:', err);
        res.status(500).json({ success: false, message: 'Failed to create collection' });
    }
};

// PUT /api/collections/:collectionId
const renameCollection = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const { userId, collectionName } = req.body;

        if (!collectionId || !userId || !collectionName || !String(collectionName).trim()) {
            return res.status(400).json({ success: false, message: 'collectionId, userId and collectionName required' });
        }

        const ownership = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('userId', sql.Int, parseInt(userId, 10))
            .query('SELECT collection_id FROM Collections WHERE collection_id = @collectionId AND user_id = @userId');

        if (!ownership.recordset.length) {
            return res.status(403).json({ success: false, message: 'Not allowed to edit this collection' });
        }

        await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('collectionName', sql.VarChar, collectionName.trim())
            .query('UPDATE Collections SET collection_name = @collectionName WHERE collection_id = @collectionId');

        res.json({ success: true, message: 'Collection renamed' });
    } catch (err) {
        console.error('Rename collection error:', err);
        res.status(500).json({ success: false, message: 'Failed to rename collection' });
    }
};

// DELETE /api/collections/:collectionId
const deleteCollection = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const userId = parseInt(req.query.userId, 10);

        if (!collectionId || !userId) {
            return res.status(400).json({ success: false, message: 'collectionId and userId required' });
        }

        const ownership = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('userId', sql.Int, userId)
            .query('SELECT collection_id FROM Collections WHERE collection_id = @collectionId AND user_id = @userId');

        if (!ownership.recordset.length) {
            return res.status(403).json({ success: false, message: 'Not allowed to delete this collection' });
        }

        await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .query('DELETE FROM Collections WHERE collection_id = @collectionId');

        res.json({ success: true, message: 'Collection deleted' });
    } catch (err) {
        console.error('Delete collection error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete collection' });
    }
};

// GET /api/collections/:collectionId/movies?userId=1
const getCollectionMovies = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const userId = parseInt(req.query.userId, 10);

        if (!collectionId || !userId) {
            return res.status(400).json({ success: false, message: 'collectionId and userId required' });
        }

        const access = await loadCollectionAccess(collectionId, userId);
        if (!access || !access.access_role) {
            return res.status(403).json({ success: false, message: 'Not allowed to view this collection' });
        }

        const result = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .query(`
                SELECT m.movie_id, m.title, m.description, m.release_year, m.duration_minutes
                FROM Collection_Movies cm
                INNER JOIN Movies m ON m.movie_id = cm.movie_id
                WHERE cm.collection_id = @collectionId
                ORDER BY m.title
            `);

        res.json({
            success: true,
            collection: access,
            movies: result.recordset || []
        });
    } catch (err) {
        console.error('Get collection movies error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch collection movies' });
    }
};

// POST /api/collections/:collectionId/movies
const addMovieToCollection = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const { userId, movieId } = req.body;

        if (!collectionId || !userId || !movieId) {
            return res.status(400).json({ success: false, message: 'collectionId, userId, movieId required' });
        }

        const access = await loadCollectionAccess(collectionId, parseInt(userId, 10));
            if (!access || !access.access_role) {
            return res.status(403).json({ success: false, message: 'Not allowed to modify this collection' });
        }

        const existing = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('movieId', sql.Int, parseInt(movieId, 10))
            .query('SELECT 1 FROM Collection_Movies WHERE collection_id = @collectionId AND movie_id = @movieId');

        if (existing.recordset.length) {
            return res.status(409).json({ success: false, message: 'Movie already in this collection' });
        }

        await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('movieId', sql.Int, parseInt(movieId, 10))
            .query('INSERT INTO Collection_Movies (collection_id, movie_id) VALUES (@collectionId, @movieId)');

        res.json({ success: true, message: 'Movie added to collection' });
    } catch (err) {
        console.error('Add movie to collection error:', err);
        res.status(500).json({ success: false, message: 'Failed to add movie to collection' });
    }
};

// DELETE /api/collections/:collectionId/movies/:movieId?userId=1
const removeMovieFromCollection = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const movieId = parseInt(req.params.movieId, 10);
        const userId = parseInt(req.query.userId, 10);

        if (!collectionId || !movieId || !userId) {
            return res.status(400).json({ success: false, message: 'collectionId, movieId, userId required' });
        }

        const access = await loadCollectionAccess(collectionId, userId);
        if (!access || !access.access_role) {
            return res.status(403).json({ success: false, message: 'Not allowed to modify this collection' });
        }

        await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('movieId', sql.Int, movieId)
            .query('DELETE FROM Collection_Movies WHERE collection_id = @collectionId AND movie_id = @movieId');

        res.json({ success: true, message: 'Movie removed from collection' });
    } catch (err) {
        console.error('Remove movie from collection error:', err);
        res.status(500).json({ success: false, message: 'Failed to remove movie from collection' });
    }
};

// GET /api/collections/:collectionId/collaborators?userId=1
const getCollectionCollaborators = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const userId = parseInt(req.query.userId, 10);

        if (!collectionId || !userId) {
            return res.status(400).json({ success: false, message: 'collectionId and userId required' });
        }

        const sharesEnabled = await hasCollectionSharesTable();
        if (!sharesEnabled) {
            return res.status(503).json({ success: false, message: 'Collection sharing is not available until the DB migration is applied' });
        }

        const access = await loadCollectionAccess(collectionId, userId);
        if (!access || access.access_role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Only the owner can view collaborators' });
        }

        const result = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .query(`
                SELECT
                    cs.share_id,
                    cs.collection_id,
                    cs.shared_with_user_id,
                    u.name,
                    u.email,
                    cs.created_at
                FROM Collection_Shares cs
                INNER JOIN Users u ON u.user_id = cs.shared_with_user_id
                WHERE cs.collection_id = @collectionId
                ORDER BY cs.created_at DESC, u.name ASC;
            `);

        res.json({ success: true, collaborators: result.recordset || [] });
    } catch (err) {
        console.error('Get collection collaborators error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch collaborators' });
    }
};

// POST /api/collections/:collectionId/share
const shareCollection = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const { userId, email } = req.body;

        if (!collectionId || !userId || !String(email || '').trim()) {
            return res.status(400).json({ success: false, message: 'collectionId, userId and email are required' });
        }

        const sharesEnabled = await hasCollectionSharesTable();
        if (!sharesEnabled) {
            return res.status(503).json({ success: false, message: 'Collection sharing is not available until the DB migration is applied' });
        }

        const access = await loadCollectionAccess(collectionId, parseInt(userId, 10));
        if (!access || access.access_role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Only the owner can share this collection' });
        }

        const targetUser = await new sql.Request()
            .input('email', sql.VarChar, String(email).trim())
            .query('SELECT user_id, name, email FROM Users WHERE email = @email');

        if (!targetUser.recordset.length) {
            return res.status(404).json({ success: false, message: 'No user found with that email' });
        }

        const collaborator = targetUser.recordset[0];
        if (collaborator.user_id === parseInt(userId, 10)) {
            return res.status(400).json({ success: false, message: 'You already own this collection' });
        }

        const existingShare = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('sharedWithUserId', sql.Int, collaborator.user_id)
            .query('SELECT share_id FROM Collection_Shares WHERE collection_id = @collectionId AND shared_with_user_id = @sharedWithUserId');

        if (existingShare.recordset.length) {
            return res.status(409).json({ success: false, message: 'That user already has access' });
        }

        const inserted = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('sharedWithUserId', sql.Int, collaborator.user_id)
            .input('sharedByUserId', sql.Int, parseInt(userId, 10))
            .query(`
                DECLARE @Inserted TABLE (share_id INT, created_at DATETIME);
                INSERT INTO Collection_Shares (collection_id, shared_with_user_id, shared_by_user_id)
                OUTPUT INSERTED.share_id, INSERTED.created_at INTO @Inserted
                VALUES (@collectionId, @sharedWithUserId, @sharedByUserId);
                SELECT share_id, created_at FROM @Inserted;
            `);

        res.json({
            success: true,
            message: 'Collection shared',
            collaborator: {
                share_id: inserted.recordset[0].share_id,
                collection_id: collectionId,
                shared_with_user_id: collaborator.user_id,
                name: collaborator.name,
                email: collaborator.email,
                created_at: inserted.recordset[0].created_at
            }
        });
    } catch (err) {
        console.error('Share collection error:', err);
        res.status(500).json({ success: false, message: 'Failed to share collection' });
    }
};

// DELETE /api/collections/:collectionId/shares/:shareId?userId=1
const removeCollaborator = async (req, res) => {
    try {
        const collectionId = parseInt(req.params.collectionId, 10);
        const shareId = parseInt(req.params.shareId, 10);
        const userId = parseInt(req.query.userId, 10);

        if (!collectionId || !shareId || !userId) {
            return res.status(400).json({ success: false, message: 'collectionId, shareId and userId required' });
        }

        const sharesEnabled = await hasCollectionSharesTable();
        if (!sharesEnabled) {
            return res.status(503).json({ success: false, message: 'Collection sharing is not available until the DB migration is applied' });
        }

        const access = await loadCollectionAccess(collectionId, userId);
        if (!access || access.access_role !== 'owner') {
            return res.status(403).json({ success: false, message: 'Only the owner can remove collaborators' });
        }

        const result = await new sql.Request()
            .input('collectionId', sql.Int, collectionId)
            .input('shareId', sql.Int, shareId)
            .query('DELETE FROM Collection_Shares WHERE share_id = @shareId AND collection_id = @collectionId');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ success: false, message: 'Collaborator share not found' });
        }

        res.json({ success: true, message: 'Collaborator removed' });
    } catch (err) {
        console.error('Remove collaborator error:', err);
        res.status(500).json({ success: false, message: 'Failed to remove collaborator' });
    }
};

module.exports = {
    getUserCollections,
    createCollection,
    renameCollection,
    deleteCollection,
    getCollectionMovies,
    addMovieToCollection,
    removeMovieFromCollection,
    getCollectionCollaborators,
    shareCollection,
    removeCollaborator
};
