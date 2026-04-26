import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({user, onLogout}) {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [genres, setGenres] = useState([]);

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
            try {
                let url = 'http://localhost:3001/api/movies?';
                if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
                if (selectedGenre) url += `genre=${encodeURIComponent(selectedGenre)}&`;
                
                const res = await fetch(url);
                const data = await res.json();
                if (data.success) {
                    setMovies(data.movies || []);
                }
            } catch (err) {
                console.error('Failed to fetch movies:', err);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timer = setTimeout(fetchMovies, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedGenre]);

    return (
        <div className="min-h-screen text-white" style={{background: 'linear-gradient(135deg, #1f2132 0%, #595574 100%)', fontFamily: "'Poppins', sans-serif"}}>
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.7)', borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-light tracking-tight">MovieHive</h1>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex gap-8 text-sm font-light" style={{color: '#c7c7cc'}}>
                            <button className="transition hover:text-white">Discover</button>
                            <button className="transition hover:text-white">Trending</button>
                            <button className="transition hover:text-white">My Watchlist</button>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-10 h-10 rounded-full font-medium text-sm transition flex items-center justify-center"
                                style={{backgroundColor: 'rgba(244, 211, 32, 0.1)', borderColor: '#f4d320', borderWidth: '1px', color: '#f4d320'}}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-3 w-48 rounded-sm shadow-xl overflow-hidden" style={{backgroundColor: '#1d1f2b', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                    <div className="px-4 py-3" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                                        <p className="font-light text-sm" style={{color: '#f4f4f4'}}>{user?.name || 'User'}</p>
                                        <p className="text-xs" style={{color: '#afafba'}}>{user?.email || 'email@example.com'}</p>
                                    </div>
                                    <button className="w-full text-left block px-4 py-2 text-sm transition font-light" style={{color: '#c7c7cc'}} onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Profile</button>
                                    <button className="w-full text-left block px-4 py-2 text-sm transition font-light" style={{color: '#c7c7cc'}} onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Settings</button>
                                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm transition border-t font-light" style={{color: '#c7c7cc', borderTopColor: '#3b3c45'}} onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-8 py-16">
                <div>
                    <h2 className="text-5xl font-light leading-tight mb-4 tracking-tight" style={{color: '#f4d320'}}>MovieHive</h2>
                    <p className="font-light" style={{color: '#afafba'}}>Explore and discover movies</p>
                </div>
            </section>

            {/* Search Section */}
            <section className="max-w-7xl mx-auto px-8 py-8" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px', borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Search movies by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-3 rounded-lg"
                        style={{backgroundColor: '#ececec', borderColor: '#3b3c45', borderWidth: '2px', color: '#262626'}}
                    />
                    <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className="px-4 py-3 rounded-lg"
                        style={{backgroundColor: '#ececec', borderColor: '#3b3c45', borderWidth: '2px', color: '#262626'}}
                    >
                        <option value="">All Genres</option>
                        {genres.map(g => (
                            <option key={g.genre_id} value={g.genre_name}>{g.genre_name}</option>
                        ))}
                    </select>
                </div>
            </section>

            {/* Movie Catalogue */}
            <section className="max-w-7xl mx-auto px-8 py-12">
                <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>
                    {loading ? 'Loading...' : `Found ${movies.length} movie${movies.length !== 1 ? 's' : ''}`}
                </h3>
                
                {loading ? (
                    <div style={{textAlign: 'center', color: '#afafba'}}>Loading movies...</div>
                ) : movies.length === 0 ? (
                    <div style={{textAlign: 'center', color: '#afafba'}}>No movies found. Try different search terms or filters.</div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {movies.map((movie) => (
                            <div 
                                key={movie.movie_id} 
                                onClick={() => navigate(`/movie/${movie.movie_id}`)}
                                className="rounded-sm overflow-hidden transition hover:border-opacity-100 cursor-pointer hover:scale-105 hover:shadow-lg" 
                                style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                {/* Movie Header */}
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

                                {/* Movie Info */}
                                <div className="p-4" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                                    <p className="text-xs font-light mb-2 uppercase tracking-widest" style={{color: '#595574'}}>Description</p>
                                    <p className="text-sm font-light line-clamp-2" style={{color: '#c7c7cc'}}>{movie.description || 'No description available'}</p>
                                    <p className="text-xs mt-3" style={{color: '#595574'}}>{movie.review_count} reviews</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-12 mt-12" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest font-medium mb-4" style={{color: '#595574'}}>Product</h4>
                        <ul className="space-y-2 text-xs font-light">
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>Discover</button></li>
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>Trending</button></li>
                            <li><button className="transition hover:text-white" style={{color: '#afafba'}}>Browse</button></li>
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