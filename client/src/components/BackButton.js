import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BackButton({ label = 'Back', to, sticky = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (to) return navigate(to);


    if (String(label).toLowerCase().includes('movies')) {
      return navigate('/');
    }


    const from = location.state && location.state.from;
    if (from === 'watchlist') {
      return navigate(-1);
    }

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
