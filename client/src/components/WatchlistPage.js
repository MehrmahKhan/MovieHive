import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WatchlistPage.css';

export default function WatchlistPage() {
    const navigate = useNavigate();
    // include a back button that goes to movies list
    const [showBack, setShowBack] = React.useState(true);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) return navigate('/');
        const user = JSON.parse(stored);

        const fetchWatchlist = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/watchlist/${user.id}`);
                const data = await res.json();
                if (data.success) setMovies(data.movies || []);
            } catch (err) {
                console.error('Failed to fetch watchlist', err);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [navigate]);

    // Back button component (lazy import to avoid circulars)
    const BackButton = require('./BackButton').default;

    const handleRemove = async (movieId) => {
        const stored = localStorage.getItem('user');
        if (!stored) return;
        const user = JSON.parse(stored);

        try {
            const res = await fetch('http://localhost:3001/api/watchlist/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, movieId })
            });
            const data = await res.json();
            if (data.success) setMovies((prev) => prev.filter(m => m.movie_id !== movieId));
        } catch (err) {
            console.error('Failed to remove', err);
        }
    };

    if (loading) return <div className="watchlist-container">Loading watchlist...</div>;

    return (
        <div className="watchlist-container">
            <div style={{ marginBottom: 12 }}>
                <BackButton label={'Back to Movies'} sticky={false} />
            </div>
            <h2>Your Watchlist</h2>
            {movies.length === 0 ? (
                <div>No movies in your watchlist yet.</div>
            ) : (
                <div className="watchlist-grid">
                    {movies.map(m => (
                        <div key={m.movie_id} className="watchlist-card">
                            <h4 onClick={() => navigate(`/movie/${m.movie_id}`, { state: { from: 'watchlist' } })} className="watchlist-title">{m.title}</h4>
                            <p className="watchlist-year">{m.release_year} · {m.duration_minutes}m</p>
                            <div className="watchlist-actions">
                                <button onClick={() => navigate(`/movie/${m.movie_id}`, { state: { from: 'watchlist' } })}>View</button>
                                <button onClick={() => handleRemove(m.movie_id)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
