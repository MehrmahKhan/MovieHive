import React, { useState, useEffect } from 'react';
import './App.css'; // Import custom styles

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:2000')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error:', error));
  }, []);

  return (
    <div className="app-container">
      <h1>Mehrmah khan!</h1>
      <img 
        src="https://via.placeholder.com/150" 
        alt="Profile" 
        className="profile-pic"
      />
      <p>I’m learning React and connecting it with a backend server.</p>
      <p>Here’s the message from the backend:</p>
      <h2>{message}</h2>
    </div>
  );
}

export default App;
