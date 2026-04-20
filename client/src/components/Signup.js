import React, { useState } from "react";
import './Signup.css';

function Signup({ onSignup, switchLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Password validation: min 8 chars, 1 uppercase, 1 number, 1 special char
  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pwd)) errors.push("At least 1 uppercase letter");
    if (!/[0-9]/.test(pwd)) errors.push("At least 1 number");
    if (!/[!@#$%^&*]/.test(pwd)) errors.push("At least 1 special character (!@#$%^&*)");
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    if (!username.trim()) errors.username = "Username required";
    if (!email.trim()) errors.email = "Email required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Valid email required";
    
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) errors.password = pwdErrors.join(", ");

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setIsSuccess(false);
      setMessage("Please fix the errors above");
      return;
    }

    setIsLoading(true);

    try {
      const role = adminCode === "ADMIN2026" ? "admin" : "user";
      
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        setFieldErrors({});
        setTimeout(() => {
          onSignup({ name: username, email: email, role: data.role || role });
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
            <div className="form-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`auth-input ${fieldErrors.username ? 'input-error' : ''}`}
              />
              {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`auth-input ${fieldErrors.email ? 'input-error' : ''}`}
              />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`auth-input ${fieldErrors.password ? 'input-error' : ''}`}
              />
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
              <p className="password-hint">Min 8 chars, 1 uppercase, 1 number, 1 special (!@#$%^&*)</p>
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="Admin Code (optional)"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="auth-input"
              />
              <p className="password-hint">Leave blank for regular user account</p>
            </div>

            <button type="submit" disabled={isLoading} className="auth-button" style={{width: '100%'}}>
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
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