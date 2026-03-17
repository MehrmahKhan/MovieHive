// client/src/components/Signup.js
import React, { useState } from "react";
import "./Signup.css";

function Signup({ onSignup, switchLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Signup button clicked");

    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          onSignup(username);
        }, 1000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.log(err);
      setMessage("Server error");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Join MovieHive 🎬</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Create Account</button>

        {message && <p className="signup-message">{message}</p>}

        <p className="link" onClick={switchLogin}>
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}

export default Signup;