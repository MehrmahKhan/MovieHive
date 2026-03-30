import React, { useState } from "react";
import './Signup.css';

function Signup({ onSignup, switchLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        setTimeout(() => {
          onSignup({ name: username, email: email });
        }, 1500);
      } else {
        setIsSuccess(false);
        setMessage(data.message);
      }
    } catch (err) {
      setIsSuccess(false);
      setMessage("Server error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-art" aria-hidden="true" />

        <div className="auth-panel">
          <h1 className="auth-title">Create your<br />MovieHive account</h1>
          <p className="auth-subtitle">Sign up to start your movie journey.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input"
            />

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
                {isLoading ? '...' : 'Sign up'}
              </button>
            </div>
          </form>

          {message ? (
            <p className={isSuccess ? 'auth-success' : 'auth-error'}>{message}</p>
          ) : null}

          <p className="auth-switch-text">
            Already have an account?{' '}
            <button type="button" onClick={switchLogin} className="auth-switch-link">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;