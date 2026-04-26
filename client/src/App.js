import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import MovieDetailPage from './components/MovieDetailPage';

function App() {
    const [user, setUser] = useState(null);
    const [showSignup, setShowSignup] = useState(false);

    const handleLogout = () => {
        setUser(null);
        setShowSignup(false);
    };

    if (!user) {
        return (
            <div className="bg-slate-950 min-h-screen">
                {showSignup ? 
                    <Signup onSignup={setUser} switchLogin={() => setShowSignup(false)} /> :
                    <Login onLogin={setUser} switchSignup={() => setShowSignup(true)} />
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
                    </>
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;