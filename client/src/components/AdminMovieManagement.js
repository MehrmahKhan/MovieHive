import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Search } from 'lucide-react';

export default function AdminMovieManagement({ adminUser, onClose }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMovie, setEditingMovie] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMovies();
        fetchGenres();
    }, []);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/movies?search=' + searchTerm);
            const data = await response.json();
            setMovies(data.movies || []);
        } catch (error) {
            console.error('Error fetching movies:', error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchGenres = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/movies/genres/list');
            const data = await response.json();
            setGenres(data.genres || []);
        } catch (error) {
            console.error('Error fetching genres:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        if (searchTerm.length > 0 || searchTerm === '') {
            const timer = setTimeout(() => fetchMovies(), 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    const handleEditClick = (movie) => {
        setEditingMovie(movie.movie_id);
        setEditFormData({
            title: movie.title,
            description: movie.description,
            release_year: movie.release_year,
            duration_minutes: movie.duration_minutes,
            is_upcoming: movie.is_upcoming
        });
        // Parse genres from comma-separated string
        const movieGenres = movie.genres ? movie.genres.split(', ').map(g => g.trim()) : [];
        const selectedIds = genres
            .filter(gen => movieGenres.includes(gen.genre_name))
            .map(gen => gen.genre_id);
        setSelectedGenres(selectedIds);
    };

    const handleGenreToggle = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const handleUpdateMovie = async () => {
        if (!editFormData.title || !editFormData.release_year || !editFormData.duration_minutes) {
            setError('Title, release year, and duration are required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            setMessage('');

            const response = await fetch(`http://localhost:3001/api/movies/${editingMovie}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...editFormData,
                    adminUserId: adminUser.user_id,
                    genreIds: selectedGenres
                })
            });

            const data = await response.json();
            if (data.success) {
                setMessage('Movie updated successfully!');
                setTimeout(() => {
                    setEditingMovie(null);
                    setMessage('');
                    fetchMovies();
                }, 1500);
            } else {
                setError(data.message || 'Failed to update movie');
                console.error('Update error:', data);
            }
        } catch (error) {
            console.error('Error updating movie:', error);
            setError('Failed to update movie: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMovie = async (movieId) => {
        if (!window.confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            setMessage('');

            const response = await fetch(`http://localhost:3001/api/movies/${movieId}?adminUserId=${adminUser.user_id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                setMessage('Movie deleted successfully!');
                setTimeout(() => {
                    setMessage('');
                    fetchMovies();
                    setDeleteConfirm(null);
                }, 1500);
            } else {
                setError(data.message || 'Failed to delete movie');
                console.error('Delete error:', data);
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            setError('Failed to delete movie: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
            <div className="w-full max-w-4xl max-h-96 rounded-lg overflow-hidden flex flex-col" style={{background: 'rgba(11,14,22,0.96)', border: '1px solid rgba(244,211,32,0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
                {/* Header */}
                <div className="flex items-center justify-between p-6" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                    <h2 className="text-2xl font-light" style={{color: '#f4f4f4'}}>Manage Movies</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                        style={{color: '#afafba'}}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="px-6 py-4" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                    <div className="flex items-center gap-2 rounded px-3 py-2" style={{backgroundColor: '#1d1f2b', border: '1px solid #3b3c45'}}>
                        <Search size={18} style={{color: '#afafba'}} />
                        <input
                            type="text"
                            placeholder="Search movies..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="flex-1 outline-none"
                            style={{backgroundColor: 'transparent', color: '#f4f4f4'}}
                        />
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="px-6 py-3 mx-4 mt-4 rounded" style={{backgroundColor: 'rgba(255,90,90,0.1)', border: '1px solid rgba(255,90,90,0.2)'}}>
                        <p style={{color: '#ffb4b4', fontSize: '0.875rem'}}>{error}</p>
                    </div>
                )}
                {message && (
                    <div className="px-6 py-3 mx-4 mt-4 rounded" style={{backgroundColor: 'rgba(197,244,181,0.1)', border: '1px solid rgba(197,244,181,0.2)'}}>
                        <p style={{color: '#c5f4b5', fontSize: '0.875rem'}}>{message}</p>
                    </div>
                )}

                {/* Movies List / Edit Form */}
                <div className="flex-1 overflow-y-auto">
                    {editingMovie ? (
                        <div className="p-6 space-y-4">
                            <h3 className="text-lg font-light" style={{color: '#f4f4f4'}}>Edit Movie</h3>
                            
                            <input
                                type="text"
                                placeholder="Title"
                                value={editFormData.title}
                                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                className="w-full px-3 py-2 rounded"
                                style={{backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45'}}
                            />

                            <textarea
                                placeholder="Description"
                                value={editFormData.description || ''}
                                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                className="w-full px-3 py-2 rounded"
                                style={{backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45'}}
                                rows="2"
                            />

                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="number"
                                    placeholder="Release Year"
                                    value={editFormData.release_year}
                                    onChange={(e) => setEditFormData({...editFormData, release_year: e.target.value})}
                                    className="px-3 py-2 rounded"
                                    style={{backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45'}}
                                />
                                <input
                                    type="number"
                                    placeholder="Duration (min)"
                                    value={editFormData.duration_minutes}
                                    onChange={(e) => setEditFormData({...editFormData, duration_minutes: e.target.value})}
                                    className="px-3 py-2 rounded"
                                    style={{backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45'}}
                                />
                                <label className="flex items-center gap-2" style={{color: '#f4f4f4'}}>
                                    <input
                                        type="checkbox"
                                        checked={editFormData.is_upcoming}
                                        onChange={(e) => setEditFormData({...editFormData, is_upcoming: e.target.checked})}
                                    />
                                    <span>Upcoming</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{color: '#f4f4f4'}}>Genres</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {genres.map(genre => (
                                        <label key={genre.genre_id} className="flex items-center gap-2" style={{color: '#f4f4f4'}}>
                                            <input
                                                type="checkbox"
                                                checked={selectedGenres.includes(genre.genre_id)}
                                                onChange={() => handleGenreToggle(genre.genre_id)}
                                            />
                                            <span className="text-sm">{genre.genre_name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleUpdateMovie}
                                    className="flex-1 py-2 rounded transition font-light"
                                    style={{backgroundColor: '#f4d320', color: '#111'}}
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingMovie(null)}
                                    className="flex-1 py-2 rounded transition font-light"
                                    style={{backgroundColor: 'rgba(255,90,90,0.15)', color: '#ffb4b4', border: '1px solid rgba(255,90,90,0.25)'}}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="p-6 text-center" style={{color: '#afafba'}}>Loading movies...</div>
                    ) : movies.length === 0 ? (
                        <div className="p-6 text-center" style={{color: '#afafba'}}>No movies found</div>
                    ) : (
                        <div>
                            {movies.map(movie => (
                                <div key={movie.movie_id} className="p-4 flex items-start justify-between" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px', backgroundColor: 'rgba(29,31,43,0.3)'}}>
                                    <div className="flex-1">
                                        <h4 className="font-semibold" style={{color: '#f4f4f4'}}>{movie.title}</h4>
                                        <p className="text-sm" style={{color: '#afafba'}}>{movie.release_year} • {movie.duration_minutes} min</p>
                                        <p className="text-xs" style={{color: '#595574'}}>{movie.genres}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(movie)}
                                            className="p-2 rounded transition"
                                            style={{color: '#f4d320', backgroundColor: 'rgba(244,211,32,0.1)'}}
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteMovie(movie.movie_id)}
                                            className="p-2 rounded transition"
                                            style={{color: '#ffb4b4', backgroundColor: 'rgba(255,90,90,0.1)'}}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
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
