import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
    const [user, setUser] = useState(null);
    const [showSignup, setShowSignup] = useState(false);

    return (
        <div className="bg-slate-950 min-h-screen">
            {!user ? (
                showSignup ? 
                    <Signup onSignup={setUser} switchLogin={() => setShowSignup(false)} /> :
                    <Login onLogin={setUser} switchSignup={() => setShowSignup(true)} />
            ) : (
                <Dashboard user={user} />
            )}
        </div>
    );
}

export default App;