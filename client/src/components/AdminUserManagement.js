import React, { useEffect, useState } from 'react';

export default function AdminUserManagement({ adminUser, onClose }) {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [form, setForm] = useState({ name: '', email: '', role: 'user', newPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const reloadUsers = async () => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/users?adminUserId=${adminUser.id}`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.users || []);
            } else {
                setError(data.message || 'Failed to load users');
            }
        } catch (err) {
            setError('Failed to load users');
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/admin/users?adminUserId=${adminUser.id}`);
                const data = await res.json();
                if (data.success) {
                    setUsers(data.users || []);
                } else {
                    setError(data.message || 'Failed to load users');
                }
            } catch (err) {
                setError('Failed to load users');
            }
        };

        fetchUsers();
    }, [adminUser.id]);

    useEffect(() => {
        const selected = users.find((user) => String(user.user_id) === String(selectedUserId));
        if (selected) {
            setForm({
                name: selected.name || '',
                email: selected.email || '',
                role: selected.role || 'user',
                newPassword: ''
            });
        }
    }, [selectedUserId, users]);

    const handleSelect = (event) => {
        setSelectedUserId(event.target.value);
        setMessage('');
        setError('');
    };

    const handleSave = async () => {
        if (!selectedUserId) return;

        setMessage('');
        setError('');

        try {
            const res = await fetch(`http://localhost:3001/api/admin/users/${selectedUserId}?adminUserId=${adminUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.name, email: form.email, role: form.role })
            });
            const data = await res.json();
            if (data.success) {
                setMessage(data.message || 'User updated');
                await reloadUsers();
            } else {
                setError(data.message || 'Failed to update user');
            }
        } catch (err) {
            setError('Failed to update user');
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUserId || !form.newPassword) return;

        setMessage('');
        setError('');

        try {
            const res = await fetch(`http://localhost:3001/api/admin/users/${selectedUserId}/password?adminUserId=${adminUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword: form.newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setMessage(data.message || 'Password reset');
                setForm((prev) => ({ ...prev, newPassword: '' }));
            } else {
                setError(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError('Failed to reset password');
        }
    };

    const handleDelete = async () => {
        if (!selectedUserId) return;
        if (!window.confirm('Delete this user?')) return;

        setMessage('');
        setError('');

        try {
            const res = await fetch(`http://localhost:3001/api/admin/users/${selectedUserId}?adminUserId=${adminUser.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setMessage(data.message || 'User deleted');
                setSelectedUserId('');
                await reloadUsers();
            } else {
                setError(data.message || 'Failed to delete user');
            }
        } catch (err) {
            setError('Failed to delete user');
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            style={{ backgroundColor: 'rgba(3, 5, 10, 0.72)' }}
        >
            <div
                className="w-full max-w-6xl max-h-[90vh] overflow-auto"
                style={{ padding: 24, borderRadius: 16, background: 'rgba(11,14,22,0.96)', border: '1px solid rgba(244,211,32,0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}
            >
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-light" style={{ color: '#f4f4f4' }}>User Management</h3>
                        <p className="text-sm" style={{ color: '#afafba' }}>Edit user profiles, change roles, reset passwords, or remove accounts.</p>
                    </div>
                    <button onClick={onClose} className="px-4 py-2 rounded" style={{ backgroundColor: 'rgba(244, 211, 32, 0.12)', color: '#f4d320', border: '1px solid rgba(244,211,32,0.24)' }}>
                        Close
                    </button>
                </div>

                {error ? <p className="mb-4" style={{ color: '#ffb4b4' }}>{error}</p> : null}
                {message ? <p className="mb-4" style={{ color: '#c5f4b5' }}>{message}</p> : null}

                <div className="grid lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-sm" style={{ color: '#afafba' }}>Select User</label>
                        <select value={selectedUserId} onChange={handleSelect} className="w-full px-4 py-3 rounded" style={{ backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45' }}>
                            <option value="">Choose a user</option>
                            {users.map((user) => (
                                <option key={user.user_id} value={user.user_id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>

                        <div className="mt-5 space-y-4">
                            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" className="w-full px-4 py-3 rounded" style={{ backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45' }} />
                            <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-3 rounded" style={{ backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45' }} />
                            <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} className="w-full px-4 py-3 rounded" style={{ backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45' }}>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex gap-3 mt-5 flex-wrap">
                            <button onClick={handleSave} className="px-4 py-2 rounded" style={{ backgroundColor: '#f4d320', color: '#111' }}>
                                Save Profile
                            </button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded" style={{ backgroundColor: 'rgba(255,90,90,0.15)', color: '#ffb4b4', border: '1px solid rgba(255,90,90,0.25)' }}>
                                Delete User
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm" style={{ color: '#afafba' }}>Reset Password</label>
                        <input value={form.newPassword} onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))} placeholder="New password" type="password" className="w-full px-4 py-3 rounded" style={{ backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45' }} />
                        <button onClick={handleResetPassword} className="px-4 py-2 rounded mt-4" style={{ backgroundColor: 'rgba(244, 211, 32, 0.12)', color: '#f4d320', border: '1px solid rgba(244,211,32,0.24)' }}>
                            Reset Password
                        </button>

                        <div className="mt-6">
                            <h4 className="text-sm mb-3" style={{ color: '#f4f4f4' }}>Users</h4>
                            <div style={{ maxHeight: 360, overflow: 'auto' }}>
                                {users.map((user) => (
                                    <button
                                        key={user.user_id}
                                        onClick={() => setSelectedUserId(String(user.user_id))}
                                        className="w-full text-left px-4 py-3 mb-2 rounded"
                                        style={{
                                            backgroundColor: String(selectedUserId) === String(user.user_id) ? 'rgba(244,211,32,0.12)' : '#1d1f2b',
                                            color: '#f4f4f4',
                                            border: '1px solid #3b3c45'
                                        }}
                                    >
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-xs" style={{ color: '#afafba' }}>{user.email} · {user.role}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}