import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import Navbar from './Navbar';
import './WatchlistPage.css';

export default function WatchlistPage() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (!stored) return navigate('/');
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);

        const fetchWatchlist = async () => {
            try {
                const res = await fetch(`http://localhost:3001/api/watchlist/${parsedUser.id}`);
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

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleRemove = async (movieId) => {
        const stored = localStorage.getItem('user');
        if (!stored) return;
        const parsedUser = JSON.parse(stored);

        try {
            const res = await fetch('http://localhost:3001/api/watchlist/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: parsedUser.id, movieId })
            });
            const data = await res.json();
            if (data.success) setMovies((prev) => prev.filter(m => m.movie_id !== movieId));
        } catch (err) {
            console.error('Failed to remove', err);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="moviehive-page" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="watchlist-container moviehive-shell">
                <div style={{ marginBottom: 12 }}>
                    <BackButton label={'Back to Movies'} sticky={false} />
                </div>
                <div className="moviehive-panel">
                    <h2>Your Watchlist</h2>
                    {movies.length === 0 ? (
                        <div className="moviehive-subtle">No movies in your watchlist yet.</div>
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
            </div>
        </div>
    );
}
