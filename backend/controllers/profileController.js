const sql = require('mssql');
const bcrypt = require('bcrypt');

// GET /api/profile/:userId
const getProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (!userId) return res.status(400).json({ success: false, message: 'Valid userId required' });

        const result = await new sql.Request()
            .input('userId', sql.Int, userId)
            .query(`
                SELECT user_id, name, email, role, created_at
                FROM Users
                WHERE user_id = @userId
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.recordset[0];
        res.json({
            success: true,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

// PUT /api/profile/:userId
const updateProfile = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { name, email } = req.body;

        if (!userId || !name || !email) {
            return res.status(400).json({ success: false, message: 'userId, name and email are required' });
        }

        const existing = await new sql.Request()
            .input('email', sql.VarChar, email.trim())
            .input('userId', sql.Int, userId)
            .query('SELECT user_id FROM Users WHERE email = @email AND user_id <> @userId');

        if (existing.recordset.length) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        await new sql.Request()
            .input('userId', sql.Int, userId)
            .input('name', sql.VarChar, name.trim())
            .input('email', sql.VarChar, email.trim())
            .query('UPDATE Users SET name = @name, email = @email WHERE user_id = @userId');

        res.json({
            success: true,
            message: 'Profile updated',
            user: { id: userId, name: name.trim(), email: email.trim() }
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// PUT /api/profile/:userId/password
const changePassword = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const { currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'All password fields are required' });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const result = await new sql.Request()
            .input('userId', sql.Int, userId)
            .query('SELECT password_hash FROM Users WHERE user_id = @userId');

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, result.recordset[0].password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await new sql.Request()
            .input('userId', sql.Int, userId)
            .input('passwordHash', sql.VarChar, newHash)
            .query('UPDATE Users SET password_hash = @passwordHash WHERE user_id = @userId');

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
