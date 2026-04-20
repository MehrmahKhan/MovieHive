import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
    const [user, setUser] = useState(null);
    const [showSignup, setShowSignup] = useState(false);

    const handleLogout = () => {
        setUser(null);
        setShowSignup(false);
    };

    return (
        <div className="bg-slate-950 min-h-screen">
            {!user ? (
                showSignup ? 
                    <Signup onSignup={setUser} switchLogin={() => setShowSignup(false)} /> :
                    <Login onLogin={setUser} switchSignup={() => setShowSignup(true)} />
            ) : user.role === 'admin' ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
                <Dashboard user={user} onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;