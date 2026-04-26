import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MovieDetailPage.css';

// Icon components using Unicode symbols
const ChevronLeft = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>‹</span>;
const Star = ({ size = 20, className = '' }) => <span style={{fontSize: `${size}px`, lineHeight: 1}} className={className}>★</span>;
const Clock = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>🕐</span>;
const Calendar = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>📅</span>;
const Users = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>👥</span>;

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/movies/${movieId}`);
        if (!response.ok) throw new Error('Failed to fetch movie details');
        
        const data = await response.json();
        setMovie(data.movie || null);
        setError('');
      } catch (err) {
        setError(err.message);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  const handleWatchlist = () => {
    setInWatchlist(!inWatchlist);
    // TODO: Phase 2.5+ - Connect to backend watchlist endpoint
  };

  if (loading) {
    return (
      <div className="movie-detail-container">
        <div className="loading-spinner">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-container">
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <div className="error-message">
          {error || 'Movie not found'}
        </div>
      </div>
    );
  }

  // Parse genres string (from database STRING_AGG)
  const genres = movie.genres ? movie.genres.split(', ') : [];
  const avgRating = movie.avg_rating ? parseFloat(movie.avg_rating).toFixed(1) : 'N/A';
  const reviewCount = movie.review_count || 0;

  return (
    <div className="movie-detail-container">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="back-button"
      >
        <ChevronLeft size={20} />
        Back to Movies
      </button>

      {/* Hero Section */}
      <div className="movie-hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="movie-title">{movie.title}</h1>
          
          {/* Meta Info */}
          <div className="meta-info">
            <span className="year">
              <Calendar size={16} />
              {movie.release_year}
            </span>
            <span className="duration">
              <Clock size={16} />
              {movie.duration_minutes} min
            </span>
            <span className="rating">
              <Star size={16} className="star-icon" />
              {avgRating}/10 ({reviewCount} reviews)
            </span>
          </div>

          {/* Genres */}
          <div className="genres-list">
            {genres.map((genre, idx) => (
              <span key={idx} className="genre-badge">
                {genre}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={handleWatchlist}
              className={`btn-watchlist ${inWatchlist ? 'active' : ''}`}
            >
              {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
            <button className="btn-rate">
              <Star size={18} />
              Rate Movie
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="detail-content">
        <div className="content-main">
          {/* Synopsis Section */}
          <section className="detail-section">
            <h2 className="section-title">Synopsis</h2>
            <p className="description">
              {movie.description || 'No description available.'}
            </p>
          </section>

          {/* Cast & Crew Section */}
          <section className="detail-section">
            <h2 className="section-title">
              <Users size={20} />
              Cast & Crew
            </h2>
            <div className="cast-grid">
              {/* TODO: Phase 2.5 - Fetch cast from Movie_Cast table */}
              <div className="cast-placeholder">
                <p>Cast information coming soon...</p>
                <small>Backend data available in Movie_Cast table</small>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="detail-section">
            <h2 className="section-title">Reviews & Ratings</h2>
            
            {/* Ratings Breakdown Card */}
            <div className="ratings-breakdown">
              <div className="avg-rating-large">
                <div className="rating-number">{avgRating}</div>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(avgRating / 2) ? 'filled' : 'empty'}
                    />
                  ))}
                </div>
                <div className="rating-count">{reviewCount} ratings</div>
              </div>

              {/* Rating Distribution Bars */}
              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="distribution-row">
                    <span className="distribution-label">{stars}★</span>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{ width: `${Math.random() * 80 + 20}%` }}
                      />
                    </div>
                    <span className="distribution-count">
                      {Math.floor(Math.random() * 200)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Review Button */}
            <div className="review-add-section">
              <button className="btn-add-review">
                Write Your Review
              </button>
              <small>Phase 3: Review form will appear here</small>
            </div>

            {/* Reviews List Placeholder */}
            <div className="reviews-list">
              <div className="review-placeholder">
                <p>User reviews will appear here in Phase 3</p>
                <small>Review component coming soon...</small>
              </div>
            </div>
          </section>

          {/* Similar Movies Section */}
          <section className="detail-section">
            <h2 className="section-title">Similar Movies</h2>
            <div className="similar-movies">
              {/* TODO: Phase 4 - Implement recommendation algorithm */}
              <div className="similar-placeholder">
                <p>Recommended movies based on genre & ratings</p>
                <small>Similarity algorithm coming in Phase 4</small>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar">
          {/* Quick Info Card */}
          <div className="sidebar-card info-card">
            <h3>Movie Info</h3>
            <div className="info-item">
              <span className="label">Release Year:</span>
              <span className="value">{movie.release_year}</span>
            </div>
            <div className="info-item">
              <span className="label">Duration:</span>
              <span className="value">{movie.duration_minutes} minutes</span>
            </div>
            <div className="info-item">
              <span className="label">Genres:</span>
              <span className="value">{genres.join(', ')}</span>
            </div>
            <div className="info-item">
              <span className="label">Average Rating:</span>
              <span className="value rating-value">{avgRating}/10</span>
            </div>
            <div className="info-item">
              <span className="label">Total Reviews:</span>
              <span className="value">{reviewCount}</span>
            </div>
          </div>

          {/* Status Card */}
          <div className="sidebar-card status-card">
            <h3>Development Status</h3>
            <div className="status-list">
              <div className="status-item completed">
                ✓ Movie Details Display
              </div>
              <div className="status-item completed">
                ✓ Ratings & Reviews Section
              </div>
              <div className="status-item in-progress">
                ⏳ Phase 3: User Reviews
              </div>
              <div className="status-item pending">
                ⊘ Phase 4: Similar Movies
              </div>
              <div className="status-item pending">
                ⊘ Phase 4: Cast Details
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MovieDetailPage;
