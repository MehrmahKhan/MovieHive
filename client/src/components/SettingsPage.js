import React, { useState } from 'react';
import BackButton from './BackButton';

export default function SettingsPage({ currentUser }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');

        if (newPassword !== confirmPassword) {
            setMessage('New passwords do not match');
            return;
        }

        if (!currentUser?.id) {
            setMessage('User not available');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`http://localhost:3001/api/profile/${currentUser.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage(data.message || 'Failed to change password');
            }
        } catch (_err) {
            setMessage('Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #1f2132 0%, #595574 100%)' }}>
            <div style={{ padding: 20 }}>
                <BackButton label={'Back to Movies'} sticky={false} />
            </div>

            <div className="max-w-2xl mx-auto px-8 py-6">
                <h1 className="text-3xl font-light mb-6" style={{ color: '#f4d320' }}>Settings</h1>
                <form onSubmit={handlePasswordChange} className="space-y-4" style={{ backgroundColor: 'rgba(29, 31, 43, 0.6)', border: '1px solid #3b3c45', borderRadius: 8, padding: 20 }}>
                    <h2 className="text-xl font-light" style={{ color: '#f4f4f4' }}>Change Password</h2>
                    <div>
                        <label className="block text-sm mb-2" style={{ color: '#c7c7cc' }}>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded"
                            style={{ backgroundColor: '#ececec', color: '#262626' }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2" style={{ color: '#c7c7cc' }}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded"
                            style={{ backgroundColor: '#ececec', color: '#262626' }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2" style={{ color: '#c7c7cc' }}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded"
                            style={{ backgroundColor: '#ececec', color: '#262626' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded font-medium"
                        style={{ backgroundColor: '#f4d320', color: '#262626' }}
                    >
                        {saving ? 'Saving...' : 'Update Password'}
                    </button>
                    {message ? <p style={{ color: '#f4d320' }}>{message}</p> : null}
                </form>
            </div>
        </div>
    );
}
