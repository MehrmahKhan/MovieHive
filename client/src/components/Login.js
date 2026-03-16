import React, { useState } from "react";
import "./Login.css";

function Login({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (typeof setLoggedIn === "function") {
      setLoggedIn(true);
    }
  };

  return (
    <div className="login-page">

      <div className="background-grid">
        <img src="https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg" alt="" />
        <img src="https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg" alt="" />
        <img src="https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg" alt="" />
        <img src="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" alt="" />
        <img src="https://image.tmdb.org/t/p/w500/5weKu49pzJCt06OPpjvT80efnQj.jpg" alt="" />
        <img src="https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg" alt="" />
      </div>

      <div className="dark-overlay"></div>

      <div className="login-card">

        <h1 className="logo">MovieHive 🎬</h1>
        <p className="subtitle">Your personal movie universe</p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button type="submit">Enter MovieHive</button>

        </form>

      </div>

    </div>
  );
}

export default Login;