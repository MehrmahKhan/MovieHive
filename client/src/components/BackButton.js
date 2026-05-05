import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackButton({ label = 'Back', to, sticky = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (to) return navigate(to);

    // If the label suggests going back to movies, send user to homepage
    if (String(label).toLowerCase().includes('movies')) {
      return navigate('/');
    }

    // If navigation state includes a logical origin, try to respect it
    const from = location.state && location.state.from;
    if (from === 'watchlist') {
      return navigate(-1);
    }

    // Fallback: go back in history
    navigate(-1);
  };

  const style = {};
  if (!sticky) {
    style.position = 'relative';
    style.top = 'auto';
    style.margin = '12px';
  }

  return (
    <button onClick={handleClick} className="back-button" style={style}>
      {label}
    </button>
  );
}
