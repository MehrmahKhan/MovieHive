import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import MovieDetailPage from './components/MovieDetailPage';
import FriendsPage from './components/FriendsPage';
import ChatWindow from './components/ChatWindow';
import WatchlistPage from './components/WatchlistPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';

function App() {
    const [user, setUser] = useState(null);
    const [showSignup, setShowSignup] = useState(false);

    // Restore user from localStorage on initial load
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setShowSignup(false);
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    if (!user) {
        return (
            <div className="bg-slate-950 min-h-screen">
                {showSignup ? 
                    <Signup onSignup={handleLogin} switchLogin={() => setShowSignup(false)} /> :
                    <Login onLogin={handleLogin} switchSignup={() => setShowSignup(true)} />
                }
            </div>
        );
    }

    return (
        <div className="bg-slate-950 min-h-screen">
            <Routes>
                {user.role === 'admin' ? (
                    <>
                        <Route path="/" element={<AdminDashboard user={user} onLogout={handleLogout} />} />
                        <Route path="/movie/:movieId" element={<MovieDetailPage />} />
                    </>
                ) : (
                    <>
                        <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
                        <Route path="/movie/:movieId" element={<MovieDetailPage />} />
                        <Route path="/watchlist" element={<WatchlistPage />} />
                        <Route path="/profile" element={<ProfilePage currentUser={user} onUserUpdate={handleUserUpdate} />} />
                        <Route path="/settings" element={<SettingsPage currentUser={user} />} />
                        <Route path="/friends" element={<FriendsPage currentUser={user} />} />
                        <Route path="/chat/:friendId" element={<ChatWindow currentUser={user} />} />
                    </>
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;