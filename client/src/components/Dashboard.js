import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Dashboard({user, onLogout}) {
    const navigate = useNavigate();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [genres, setGenres] = useState([]);
    const [browseSection, setBrowseSection] = useState('discover');

    // Fetch genres on mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/movies/genres/list');
                const data = await res.json();
                if (data.success) {
                    setGenres(data.genres);
                }
            } catch (err) {
                console.error('Failed to fetch genres:', err);
            }
        };
        fetchGenres();
    }, []);

    // Fetch movies
    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            setErrorMessage('');
            try {
                let url = 'http://localhost:3001/api/movies?';
                if (browseSection !== 'discover') {
                    url = `http://localhost:3001/api/movies/browse/${browseSection}`;
                } else {
                    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
                    if (selectedGenre) url += `genre=${encodeURIComponent(selectedGenre)}&`;
                }
                
                const res = await fetch(url);
                const data = await res.json();
                if (data.success) {
                    setMovies(data.movies || []);
                } else {
                    setMovies([]);
                    setErrorMessage(data.message || 'Failed to load movies for this section');
                }
            } catch (err) {
                console.error('Failed to fetch movies:', err);
                setMovies([]);
                setErrorMessage('Network error while loading movies. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timer = setTimeout(fetchMovies, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedGenre, browseSection]);

    const sectionTitle =
        browseSection === 'trending'
            ? 'Trending Now'
            : browseSection === 'upcoming'
            ? 'Upcoming Releases'
            : browseSection === 'top-rated'
            ? 'Top Rated Picks'
            : 'Discover Movies';

    return (
        <div className="moviehive-page" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Navbar user={user} onLogout={onLogout} activeBrowseSection={browseSection} onBrowseSectionChange={setBrowseSection} />

            <section className="moviehive-shell">
                <div className="moviehive-hero">
                    <h2 className="text-5xl font-light leading-tight mb-4 tracking-tight moviehive-accent">MovieHive</h2>
                    <p className="font-light moviehive-subtle">{sectionTitle}</p>
                </div>
            </section>

            <section className="moviehive-shell pt-0">
                <div className="moviehive-panel">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Search movies by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-3 rounded-lg"
                            disabled={browseSection !== 'discover'}
                            style={{ backgroundColor: '#ececec', borderColor: '#3b3c45', borderWidth: '2px', color: '#262626' }}
                        />
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="px-4 py-3 rounded-lg"
                            disabled={browseSection !== 'discover'}
                            style={{ backgroundColor: '#ececec', borderColor: '#3b3c45', borderWidth: '2px', color: '#262626' }}
                        >
                            <option value="">All Genres</option>
                            {genres.map(g => (
                                <option key={g.genre_id} value={g.genre_name}>{g.genre_name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="moviehive-shell pt-0 pb-12">
                <div className="moviehive-panel">
                    <h3 className="text-2xl font-light mb-8 tracking-tight moviehive-heading">
                        {loading ? 'Loading...' : `${sectionTitle}: ${movies.length} movie${movies.length !== 1 ? 's' : ''}`}
                    </h3>

                    {errorMessage ? (
                        <div style={{ textAlign: 'center', color: '#ffb4b4', marginBottom: 16 }}>{errorMessage}</div>
                    ) : null}
                    
                    {loading ? (
                        <div style={{textAlign: 'center', color: '#afafba'}}>Loading movies...</div>
                    ) : movies.length === 0 ? (
                        <div style={{textAlign: 'center', color: '#afafba'}}>
                            {browseSection === 'discover'
                                ? 'No movies found. Try different search terms or filters.'
                                : `No movies available in ${sectionTitle} right now.`}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {movies.map((movie) => (
                                <div 
                                    key={movie.movie_id} 
                                    onClick={() => navigate(`/movie/${movie.movie_id}`, { state: { from: 'home' } })}
                                    className="rounded-sm overflow-hidden transition hover:border-opacity-100 cursor-pointer hover:scale-105 hover:shadow-lg" 
                                    style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                    <div className="h-40 p-4 flex flex-col justify-between" style={{background: 'linear-gradient(to bottom right, #262626, #1d1f2b)'}}>
                                        <div>
                                            <h4 className="text-base font-light mb-2 line-clamp-2" style={{color: '#f4f4f4'}}>{movie.title}</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {movie.genres && movie.genres.split(', ').map(g => <span key={g} className="text-xs px-2 py-1 rounded" style={{backgroundColor: 'rgba(59, 60, 69, 0.5)', color: '#c7c7cc'}}>{g}</span>)}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-light" style={{color: '#afafba'}}>{movie.release_year} · {movie.duration_minutes}m</span>
                                            <span className="text-lg font-light" style={{color: '#f4d320'}}>{movie.avg_rating ? parseFloat(movie.avg_rating).toFixed(1) : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="p-4" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                                        <p className="text-xs font-light mb-2 uppercase tracking-widest" style={{color: '#595574'}}>Description</p>
                                        <p className="text-sm font-light line-clamp-2" style={{color: '#c7c7cc'}}>{movie.description || 'No description available'}</p>
                                        <p className="text-xs mt-3" style={{color: '#595574'}}>{movie.review_count} reviews</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-12 mt-12" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{color: '#595574'}}>Product</h4>
                        <ul className="space-y-2 text-xs font-light">
                            <li><button onClick={() => setBrowseSection('discover')} className="transition hover:text-white" style={{color: '#afafba'}}>Discover</button></li>
                            <li><button onClick={() => setBrowseSection('trending')} className="transition hover:text-white" style={{color: '#afafba'}}>Trending</button></li>
                            <li><button onClick={() => setBrowseSection('top-rated')} className="transition hover:text-white" style={{color: '#afafba'}}>Top Rated</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{color: '#595574'}}>Legal</h4>
                        <ul className="space-y-2 text-xs font-light">
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>Privacy</button></li>
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>Terms</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{color: '#595574'}}>Company</h4>
                        <ul className="space-y-2 text-xs font-light">
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>About</button></li>
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>Contact</button></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 text-center text-xs font-light" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px', color: '#595574'}}>
                    <p>MovieHive 2026 - Database Project - FAST NU</p>
                </div>
            </footer>
        </div>
    )
}