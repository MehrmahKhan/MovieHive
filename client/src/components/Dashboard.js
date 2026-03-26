import React, { useState } from 'react';

export default function Dashboard({user}) {
    const [showUserMenu, setShowUserMenu] = useState(false);

    const movies = [
        { movie_id: 1, title: 'Inception', release_year: 2010, rating: 8.8, duration_minutes: 148, genre: ['Sci-Fi', 'Thriller'], cast: ['Leonardo DiCaprio', 'Marion Cotillard'] },
        { movie_id: 2, title: 'The Dark Knight', release_year: 2008, rating: 9.0, duration_minutes: 152, genre: ['Crime', 'Drama'], cast: ['Christian Bale', 'Heath Ledger'] },
        { movie_id: 3, title: 'Interstellar', release_year: 2014, rating: 8.7, duration_minutes: 169, genre: ['Sci-Fi', 'Drama'], cast: ['Matthew McConaughey', 'Anne Hathaway'] },
        { movie_id: 4, title: 'The Shawshank Redemption', release_year: 1994, rating: 9.3, duration_minutes: 142, genre: ['Drama'], cast: ['Tim Robbins', 'Morgan Freeman'] },
        { movie_id: 5, title: 'Pulp Fiction', release_year: 1994, rating: 8.9, duration_minutes: 154, genre: ['Crime', 'Drama'], cast: ['John Travolta', 'Samuel L. Jackson'] },
        { movie_id: 6, title: 'The Matrix', release_year: 1999, rating: 8.7, duration_minutes: 136, genre: ['Sci-Fi', 'Action'], cast: ['Keanu Reeves', 'Laurence Fishburne'] },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            {/* Navbar */}
            <nav className="bg-slate-950/60 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-light tracking-tight">MovieHive</h1>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex gap-8 text-sm font-light text-slate-300">
                            <a href="#" className="hover:text-white transition">Discover</a>
                            <a href="#" className="hover:text-white transition">Trending</a>
                            <a href="#" className="hover:text-white transition">My Watchlist</a>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-10 h-10 rounded-full bg-teal-600/20 border border-teal-600/50 text-white font-medium text-sm hover:bg-teal-600/30 transition flex items-center justify-center"
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-3 w-48 bg-slate-900 border border-slate-700 rounded-sm shadow-xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-700">
                                        <p className="font-light text-sm text-white">{user?.name || 'User'}</p>
                                        <p className="text-xs text-slate-400">{user?.email || 'email@example.com'}</p>
                                    </div>
                                    <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition font-light">Profile</a>
                                    <a href="#" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition font-light">Settings</a>
                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition border-t border-slate-700 font-light">Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-8 py-16">
                <div>
                    <h2 className="text-5xl font-light leading-tight mb-4 tracking-tight">MovieHive</h2>
                    <p className="text-slate-400 font-light">Explore our collection of movies</p>
                </div>
            </section>

            {/* Movie Catalogue */}
            <section className="max-w-7xl mx-auto px-8 py-12 border-t border-slate-800/50">
                <h3 className="text-2xl font-light mb-8 tracking-tight">Movie Catalogue</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {movies.map((movie) => (
                        <div key={movie.movie_id} className="border border-slate-800/50 rounded-sm bg-slate-900/30 overflow-hidden hover:border-slate-700 transition">
                            {/* Movie Header */}
                            <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 p-4 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-base font-light mb-2 line-clamp-2">{movie.title}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {movie.genre.map(g => <span key={g} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">{g}</span>)}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400 font-light">{movie.release_year} · {movie.duration_minutes}m</span>
                                    <span className="text-lg font-light text-teal-400">{movie.rating}</span>
                                </div>
                            </div>

                            {/* Movie Info */}
                            <div className="p-4 border-t border-slate-800/50">
                                <p className="text-xs text-slate-500 font-light mb-3 uppercase tracking-widest">Cast</p>
                                <p className="text-sm text-slate-300 font-light line-clamp-2">{movie.cast.join(', ')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-12 mt-12 border-t border-slate-800/50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-4">Product</h4>
                        <ul className="space-y-2 text-xs text-slate-400 font-light">
                            <li><a href="#" className="hover:text-white transition">Discover</a></li>
                            <li><a href="#" className="hover:text-white transition">Trending</a></li>
                            <li><a href="#" className="hover:text-white transition">Browse</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-4">Legal</h4>
                        <ul className="space-y-2 text-xs text-slate-400 font-light">
                            <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-4">Company</h4>
                        <ul className="space-y-2 text-xs text-slate-400 font-light">
                            <li><a href="#" className="hover:text-white transition">About</a></li>
                            <li><a href="#" className="hover:text-white transition">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-800/50 text-center text-xs text-slate-500 font-light">
                    <p>MovieHive 2026 · Database Project · FAST-NU</p>
                </div>
            </footer>
        </div>
    )
}