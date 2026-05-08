import React, { useState, useEffect } from 'react';

export default function AddMovieForm({ onMovieAdded, onClose }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [release_year, setReleaseYear] = useState(new Date().getFullYear());
    const [duration_minutes, setDurationMinutes] = useState('');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [castText, setCastText] = useState('');
    const [isUpcoming, setIsUpcoming] = useState(false);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

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

    const validateForm = () => {
        const errors = {};
        if (!title.trim()) errors.title = 'Title required';
        if (!release_year || release_year < 1888 || release_year > new Date().getFullYear() + 5) {
            errors.release_year = 'Valid release year required';
        }
        if (!duration_minutes || parseInt(duration_minutes) <= 0) {
            errors.duration_minutes = 'Duration must be greater than 0';
        }
        if (selectedGenres.length === 0) errors.genres = 'Select at least one genre';

        const castLines = castText.split('\n').map((line) => line.trim()).filter(Boolean);
        const invalidCastLine = castLines.find((line) => !line.match(/^.+\s+as\s+.+$/i));
        if (castLines.length > 0 && invalidCastLine) {
            errors.castText = 'Use one cast member per line in the format: Name as Role';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleGenreChange = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId)
                ? prev.filter(g => g !== genreId)
                : [...prev, genreId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setIsSuccess(false);
            setMessage('Please fix the errors below');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    release_year: parseInt(release_year),
                    duration_minutes: parseInt(duration_minutes),
                    genreIds: selectedGenres,
                    castMembers: castText,
                    isUpcoming
                }),
            });

            const data = await res.json();

            if (data.success) {
                setIsSuccess(true);
                setMessage('Movie added successfully!');
                setFieldErrors({});
                // Reset form
                setTitle('');
                setDescription('');
                setReleaseYear(new Date().getFullYear());
                setDurationMinutes('');
                setSelectedGenres([]);
                setCastText('');
                setIsUpcoming(false);
                
                if (onMovieAdded) {
                    onMovieAdded();
                }
                
                setTimeout(() => {
                    if (onClose) onClose();
                }, 1500);
            } else {
                setIsSuccess(false);
                setMessage(data.message || 'Failed to add movie');
            }
        } catch (err) {
            setIsSuccess(false);
            setMessage('Server error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-6">
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
                style={{
                    backgroundColor: '#1d1f2b',
                    borderColor: '#3b3c45',
                    borderWidth: '1px',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light" style={{color: '#f4d320'}}>Add New Movie</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl"
                        style={{color: '#afafba'}}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div className="mb-4">
                        <label className="block text-sm mb-2" style={{color: '#c7c7cc'}}>Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded"
                            style={{
                                backgroundColor: '#ececec',
                                borderColor: fieldErrors.title ? '#ff8f8f' : '#3b3c45',
                                borderWidth: '2px',
                                color: '#262626'
                            }}
                            placeholder="Movie title"
                        />
                        {fieldErrors.title && <p className="text-xs mt-1" style={{color: '#ff8f8f'}}>{fieldErrors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                        <label className="block text-sm mb-2" style={{color: '#c7c7cc'}}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded"
                            style={{
                                backgroundColor: '#ececec',
                                borderColor: '#3b3c45',
                                borderWidth: '2px',
                                color: '#262626'
                            }}
                            placeholder="Movie description"
                            rows="3"
                        />
                    </div>

                    {/* Release Year and Duration */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm mb-2" style={{color: '#c7c7cc'}}>Release Year *</label>
                            <input
                                type="number"
                                value={release_year}
                                onChange={(e) => setReleaseYear(e.target.value)}
                                className="w-full px-4 py-2 rounded"
                                style={{
                                    backgroundColor: '#ececec',
                                    borderColor: fieldErrors.release_year ? '#ff8f8f' : '#3b3c45',
                                    borderWidth: '2px',
                                    color: '#262626'
                                }}
                                min="1888"
                                max={new Date().getFullYear() + 5}
                            />
                            {fieldErrors.release_year && <p className="text-xs mt-1" style={{color: '#ff8f8f'}}>{fieldErrors.release_year}</p>}
                        </div>
                        <div>
                            <label className="block text-sm mb-2" style={{color: '#c7c7cc'}}>Duration (minutes) *</label>
                            <input
                                type="number"
                                value={duration_minutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                className="w-full px-4 py-2 rounded"
                                style={{
                                    backgroundColor: '#ececec',
                                    borderColor: fieldErrors.duration_minutes ? '#ff8f8f' : '#3b3c45',
                                    borderWidth: '2px',
                                    color: '#262626'
                                }}
                                min="1"
                                placeholder="e.g. 120"
                            />
                            {fieldErrors.duration_minutes && <p className="text-xs mt-1" style={{color: '#ff8f8f'}}>{fieldErrors.duration_minutes}</p>}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="mb-6">
                        <label className="block text-sm mb-2" style={{color: '#c7c7cc'}}>Genres * (select at least one)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {genres.map(genre => (
                                <label key={genre.genre_id} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre.genre_id)}
                                        onChange={() => handleGenreChange(genre.genre_id)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm" style={{color: '#c7c7cc'}}>{genre.genre_name}</span>
                                </label>
                            ))}
                        </div>
                        {fieldErrors.genres && <p className="text-xs mt-1" style={{color: '#ff8f8f'}}>{fieldErrors.genres}</p>}
                    </div>

                    {/* Upcoming */}
                    <div className="mb-6 flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={isUpcoming}
                            onChange={(e) => setIsUpcoming(e.target.checked)}
                            id="isUpcoming"
                        />
                        <label htmlFor="isUpcoming" className="text-sm" style={{color: '#c7c7cc'}}>
                            Is this an upcoming movie?
                        </label>
                    </div>

                    {/* Cast */}
                    <div className="mb-6">
                        <label className="block text-sm mb-2" style={{color: '#c7c7cc'}}>Cast (optional)</label>
                        <textarea
                            value={castText}
                            onChange={(e) => setCastText(e.target.value)}
                            className="w-full px-4 py-2 rounded"
                            style={{
                                backgroundColor: '#ececec',
                                borderColor: fieldErrors.castText ? '#ff8f8f' : '#3b3c45',
                                borderWidth: '2px',
                                color: '#262626'
                            }}
                            placeholder={'Leonardo DiCaprio as Cobb\nMarion Cotillard as Mal'}
                            rows="4"
                        />
                        <p className="text-xs mt-1" style={{color: '#afafba'}}>One person per line. Use <span style={{color: '#f4d320'}}>Name as Role</span>.</p>
                        {fieldErrors.castText && <p className="text-xs mt-1" style={{color: '#ff8f8f'}}>{fieldErrors.castText}</p>}
                    </div>

                    {/* Messages */}
                    {message && (
                        <p className="mb-4 text-sm" style={{color: isSuccess ? '#a6f3af' : '#ff8f8f'}}>
                            {message}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 rounded font-medium transition"
                            style={{
                                backgroundColor: '#f4d320',
                                color: '#191919',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Adding...' : 'Add Movie'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded font-medium transition"
                            style={{
                                backgroundColor: '#3b3c45',
                                color: '#c7c7cc'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
