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

        await new sql.Request()
            .input('userId', sql.Int, userId)
            .query('DELETE FROM Users WHERE user_id = @userId');

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};

module.exports = {
    getUsers,
    updateUser,
    resetUserPassword,
    deleteUser
};