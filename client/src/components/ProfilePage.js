import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import Navbar from './Navbar';

export default function ProfilePage({ currentUser, onUserUpdate }) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [displayUser, setDisplayUser] = useState(currentUser);

    useEffect(() => {
        const load = async () => {
            try {
                if (!currentUser?.id) return;
                const res = await fetch(`http://localhost:3001/api/profile/${currentUser.id}`);
                const data = await res.json();
                if (data.success && data.user) {
                    setName(data.user.name || '');
                    setEmail(data.user.email || '');
                } else {
                    setMessage(data.message || 'Failed to load profile');
                }
            } catch (_err) {
                setMessage('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentUser?.id) return;
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch(`http://localhost:3001/api/profile/${currentUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (data.success) {
                const updatedUser = { ...currentUser, name, email };
                onUserUpdate(updatedUser);
                setDisplayUser(updatedUser);
                setMessage('Profile saved successfully');
            } else {
                setMessage(data.message || 'Failed to save profile');
            }
        } catch (_err) {
            setMessage('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #1f2132 0%, #595574 100%)' }}>
            <Navbar user={displayUser || currentUser} onLogout={handleLogout} />
            <div style={{ padding: 20 }}>
                <BackButton label={'Back to Movies'} sticky={false} />
            </div>

            <div className="max-w-2xl mx-auto px-8 py-6">
                <h1 className="text-3xl font-light mb-6" style={{ color: '#f4d320' }}>Profile</h1>
                {loading ? (
                    <p style={{ color: '#afafba' }}>Loading profile...</p>
                ) : (
                    <form onSubmit={handleSave} className="space-y-4" style={{ backgroundColor: 'rgba(29, 31, 43, 0.6)', border: '1px solid #3b3c45', borderRadius: 8, padding: 20 }}>
                        <div>
                            <label className="block text-sm mb-2" style={{ color: '#c7c7cc' }}>Name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 rounded"
                                style={{ backgroundColor: '#ececec', color: '#262626' }}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-2" style={{ color: '#c7c7cc' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                        {message ? <p style={{ color: '#f4d320' }}>{message}</p> : null}
                    </form>
                )}
            </div>
        </div>
    );
}
