const sql = require('mssql');
const config = require('../config/db');

const seedForumCategories = [
    ['Movie Discussions', 'Talk about favorite films, scenes, and cinematic moments.', 1],
    ['Recommendations', 'Ask for suggestions and share what to watch next.', 2],
    ['Reviews & Analysis', 'Deep dives, interpretations, and spoiler-heavy discussion.', 3],
    ['General Chat', 'Anything MovieHive and movie culture related.', 4]
];

const ensureForumCategories = async (pool) => {
    const result = await pool.request().query('SELECT COUNT(*) AS category_count FROM Forum_Categories');
    if ((result.recordset?.[0]?.category_count || 0) > 0) {
        return;
    }

    for (const [name, description, sortOrder] of seedForumCategories) {
        await pool.request()
            .input('name', sql.VarChar, name)
            .input('description', sql.VarChar, description)
            .input('sortOrder', sql.Int, sortOrder)
            .query(`
                INSERT INTO Forum_Categories (category_name, description, sort_order)
                VALUES (@name, @description, @sortOrder)
            `);
    }
};

const getForumCategories = async (_req, res) => {
    try {
        const pool = await sql.connect(config);
        await ensureForumCategories(pool);

        const result = await pool.request().query(`
            SELECT
                fc.category_id,
                fc.category_name,
                fc.description,
                fc.sort_order,
                COUNT(DISTINCT ft.thread_id) AS thread_count
            FROM Forum_Categories fc
            LEFT JOIN Forum_Threads ft ON ft.category_id = fc.category_id
            GROUP BY fc.category_id, fc.category_name, fc.description, fc.sort_order
            ORDER BY fc.sort_order ASC, fc.category_name ASC
        `);

        res.json({ success: true, categories: result.recordset || [] });
    } catch (err) {
        console.error('Error fetching forum categories:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch forum categories' });
    }
};

const getForumThreads = async (req, res) => {
    try {
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;
        const pool = await sql.connect(config);
        await ensureForumCategories(pool);

        const request = pool.request();
        let query = `
            SELECT
                ft.thread_id,
                ft.category_id,
                fc.category_name,
                ft.user_id,
                u.name AS author_name,
                u.email AS author_email,
                ft.title,
                ft.body,
                ft.created_at,
                ft.updated_at,
                ft.reply_count
            FROM Forum_Threads ft
            INNER JOIN Forum_Categories fc ON fc.category_id = ft.category_id
            INNER JOIN Users u ON u.user_id = ft.user_id
        `;

        if (categoryId) {
            request.input('categoryId', sql.Int, categoryId);
            query += ' WHERE ft.category_id = @categoryId';
        }

        query += ' ORDER BY ft.created_at DESC, ft.thread_id DESC';

        const result = await request.query(query);
        res.json({ success: true, threads: result.recordset || [] });
    } catch (err) {
        console.error('Error fetching forum threads:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch forum threads' });
    }
};

const getForumThread = async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        if (!threadId) {
            return res.status(400).json({ success: false, message: 'Valid threadId required' });
        }

        const pool = await sql.connect(config);
        const threadResult = await pool.request()
            .input('threadId', sql.Int, threadId)
            .query(`
                SELECT
                    ft.thread_id,
                    ft.category_id,
                    fc.category_name,
                    ft.user_id,
                    u.name AS author_name,
                    u.email AS author_email,
                    ft.title,
                    ft.body,
                    ft.created_at,
                    ft.updated_at,
                    ft.reply_count
                FROM Forum_Threads ft
                INNER JOIN Forum_Categories fc ON fc.category_id = ft.category_id
                INNER JOIN Users u ON u.user_id = ft.user_id
                WHERE ft.thread_id = @threadId
            `);

        if (!threadResult.recordset.length) {
            return res.status(404).json({ success: false, message: 'Thread not found' });
        }

        const repliesResult = await pool.request()
            .input('threadId', sql.Int, threadId)
            .query(`
                SELECT
                    fr.reply_id,
                    fr.thread_id,
                    fr.user_id,
                    u.name AS author_name,
                    u.email AS author_email,
                    fr.body,
                    fr.created_at,
                    fr.updated_at
                FROM Forum_Replies fr
                INNER JOIN Users u ON u.user_id = fr.user_id
                WHERE fr.thread_id = @threadId
                ORDER BY fr.created_at ASC, fr.reply_id ASC
            `);

        res.json({
            success: true,
            thread: threadResult.recordset[0],
            replies: repliesResult.recordset || []
        });
    } catch (err) {
        console.error('Error fetching forum thread:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch forum thread' });
    }
};

const createForumThread = async (req, res) => {
    try {
        const { userId, categoryId, title, body } = req.body;
        const parsedUserId = parseInt(userId, 10);
        const parsedCategoryId = parseInt(categoryId, 10);

        if (!parsedUserId || !parsedCategoryId || !String(title || '').trim() || !String(body || '').trim()) {
            return res.status(400).json({ success: false, message: 'userId, categoryId, title, and body are required' });
        }

        const pool = await sql.connect(config);
        await ensureForumCategories(pool);

        const categoryCheck = await pool.request()
            .input('categoryId', sql.Int, parsedCategoryId)
            .query('SELECT category_id FROM Forum_Categories WHERE category_id = @categoryId');

        if (!categoryCheck.recordset.length) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const result = await pool.request()
            .input('userId', sql.Int, parsedUserId)
            .input('categoryId', sql.Int, parsedCategoryId)
            .input('title', sql.VarChar, String(title).trim().slice(0, 200))
            .input('body', sql.VarChar, String(body).trim().slice(0, 4000))
            .query(`
                DECLARE @Inserted TABLE (thread_id INT, created_at DATETIME, updated_at DATETIME);
                INSERT INTO Forum_Threads (category_id, user_id, title, body)
                OUTPUT INSERTED.thread_id, INSERTED.created_at, INSERTED.updated_at INTO @Inserted
                VALUES (@categoryId, @userId, @title, @body);
                SELECT thread_id, created_at, updated_at FROM @Inserted;
            `);

        res.json({
            success: true,
            message: 'Thread created',
            thread: {
                thread_id: result.recordset[0].thread_id,
                category_id: parsedCategoryId,
                user_id: parsedUserId,
                title: String(title).trim().slice(0, 200),
                body: String(body).trim().slice(0, 4000),
                created_at: result.recordset[0].created_at,
                updated_at: result.recordset[0].updated_at,
                reply_count: 0
            }
        });
    } catch (err) {
        console.error('Error creating forum thread:', err);
        res.status(500).json({ success: false, message: 'Failed to create thread' });
    }
};

const addForumReply = async (req, res) => {
    try {
        const threadId = parseInt(req.params.threadId, 10);
        const { userId, body } = req.body;
        const parsedUserId = parseInt(userId, 10);

        if (!threadId || !parsedUserId || !String(body || '').trim()) {
            return res.status(400).json({ success: false, message: 'threadId, userId, and body are required' });
        }

        const pool = await sql.connect(config);
        const threadCheck = await pool.request()
            .input('threadId', sql.Int, threadId)
            .query('SELECT thread_id FROM Forum_Threads WHERE thread_id = @threadId');

        if (!threadCheck.recordset.length) {
            return res.status(404).json({ success: false, message: 'Thread not found' });
        }

        const result = await pool.request()
            .input('threadId', sql.Int, threadId)
            .input('userId', sql.Int, parsedUserId)
            .input('body', sql.VarChar, String(body).trim().slice(0, 4000))
            .query(`
                DECLARE @Inserted TABLE (reply_id INT, created_at DATETIME, updated_at DATETIME);
                INSERT INTO Forum_Replies (thread_id, user_id, body)
                OUTPUT INSERTED.reply_id, INSERTED.created_at, INSERTED.updated_at INTO @Inserted
                VALUES (@threadId, @userId, @body);
                SELECT reply_id, created_at, updated_at FROM @Inserted;

                UPDATE Forum_Threads
                SET reply_count = reply_count + 1,
                    updated_at = GETDATE()
                WHERE thread_id = @threadId;
            `);

        res.json({
            success: true,
            message: 'Reply added',
            reply: {
                reply_id: result.recordset[0].reply_id,
                thread_id: threadId,
                user_id: parsedUserId,
                body: String(body).trim().slice(0, 4000),
                created_at: result.recordset[0].created_at,
                updated_at: result.recordset[0].updated_at
            }
        });
    } catch (err) {
        console.error('Error adding forum reply:', err);
        res.status(500).json({ success: false, message: 'Failed to add reply' });
    }
};

module.exports = {
    getForumCategories,
    getForumThreads,
    getForumThread,
    createForumThread,
    addForumReply
};