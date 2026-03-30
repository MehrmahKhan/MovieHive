import React, { useState } from 'react';
import './Login.css';

export default function Login({ onLogin, switchSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) onLogin(data.user);
            else setError(data.msg || 'Invalid credentials');
        } catch (_err) {
            setError('Server error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-shell">
                <div className="auth-art" aria-hidden="true" />

                <div className="auth-panel">
                    <h1 className="auth-title">Welcome to<br />MovieHive</h1>
                    <p className="auth-subtitle">Sign in to explore the movies you love!</p>

                    <form className="auth-form" onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />

                        <div className="auth-row">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="auth-input"
                            />
                            <button type="submit" disabled={isLoading} className="auth-button">
                                {isLoading ? '...' : 'Login'}
                            </button>
                        </div>
                    </form>

                    {error ? <p className="auth-error">{error}</p> : null}

                    <p className="auth-switch-text">
                        Don't have an account?{' '}
                        <button type="button" onClick={switchSignup} className="auth-switch-link">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}