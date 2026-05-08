import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import Navbar from './Navbar';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import './MovieDetailPage.css';
import './ReviewStyles.css';
import ListPickerModal from './ListPickerModal';

// Icon components using Unicode symbols
const ChevronLeft = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>‹</span>;
const Star = ({ size = 20, className = '' }) => <span style={{fontSize: `${size}px`, lineHeight: 1}} className={className}>★</span>;
const Clock = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>⏱</span>;
const Calendar = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>●</span>;
const Users = ({ size = 20 }) => <span style={{fontSize: `${size}px`, lineHeight: 1}}>◉</span>;

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [availableCollections, setAvailableCollections] = useState([]);
  const [listsMessage, setListsMessage] = useState('');
  
  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [movieReviews, setMovieReviews] = useState([]);

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

    // Get current user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    }

    // Check if in watchlist when user/movie available
    const checkWatchlistIfReady = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const user = JSON.parse(stored);
      if (!user || !movieId) return;
      try {
        const res = await fetch(`http://localhost:3001/api/watchlist/${user.id}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.movies)) {
          const found = data.movies.some(m => String(m.movie_id) === String(movieId));
          setInWatchlist(found);
        }
      } catch (err) {
        console.error('Error checking watchlist', err);
      }
    };

    checkWatchlistIfReady();

    fetchMovieDetails();
  }, [movieId]);

  // Fetch user's existing review for this movie
  useEffect(() => {
    if (!currentUser || !movieId) return;

    const fetchUserReview = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/reviews/user/${movieId}?userId=${currentUser.id}`
        );
        const data = await response.json();
        if (data.success && data.review) {
          setUserReview(data.review);
        } else {
          setUserReview(null);
        }
      } catch (err) {
        console.error('Error fetching user review:', err);
      }
    };

    fetchUserReview();
  }, [currentUser, movieId, reviewsRefresh]);

  const handleWatchlist = async () => {
    const stored = localStorage.getItem('user');
    if (!stored) return alert('Please login');
    const user = JSON.parse(stored);
    if (!user?.id) return alert('User ID missing');

    if (watchlistLoading) return; // avoid duplicate clicks
    setWatchlistLoading(true);

    try {
      if (inWatchlist) {
        const res = await fetch('http://localhost:3001/api/watchlist/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, movieId: parseInt(movieId) })
        });
        const data = await res.json();
        if (data.success) {
          setInWatchlist(false);
        } else {
          console.warn('Remove failed:', data.message);
          alert(data.message || 'Failed to remove from watchlist');
        }
      } else {
        const res = await fetch('http://localhost:3001/api/watchlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, movieId: parseInt(movieId) })
        });
        const data = await res.json();
        if (data.success) {
          setInWatchlist(true);
        } else {
          console.warn('Add failed:', data.message);
          alert(data.message || 'Failed to add to watchlist');
        }
      }
    } catch (err) {
      console.error('Watchlist toggle error', err);
      alert('Network error toggling watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleAddToList = async () => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      setListsMessage('Please login to add to lists');
      return;
    }
    const user = JSON.parse(stored);
    if (!user?.id) {
      setListsMessage('User ID missing');
      return;
    }

    if (listsLoading) return;
    setListsLoading(true);

    try {
      const collectionsRes = await fetch(`http://localhost:3001/api/collections/user/${user.id}`);
      const collectionsData = await collectionsRes.json();
      if (!collectionsData.success) {
        setListsMessage(collectionsData.message || 'Failed to fetch lists');
        return;
      }

      const collections = collectionsData.collections || [];
      setAvailableCollections(collections);
      setListModalOpen(true);
    } catch (err) {
      console.error('Add to list error', err);
      setListsMessage('Network error while fetching lists');
    } finally {
      setListsLoading(false);
    }
  };

  const handleListPickerConfirm = async (result) => {
    setListModalOpen(false);
    setListsMessage('');
    const stored = localStorage.getItem('user');
    if (!stored) return setListsMessage('Please login');
    const user = JSON.parse(stored);
    if (!user?.id) return setListsMessage('User ID missing');

    try {
      let collection = null;
      if (result.type === 'create') {
        const createRes = await fetch('http://localhost:3001/api/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, collectionName: result.name })
        });
        const createData = await createRes.json();
        if (!createData.success) return setListsMessage(createData.message || 'Failed to create list');
        collection = createData.collection;
      } else if (result.type === 'existing') {
        collection = result.collection;
      }

      if (!collection) return setListsMessage('No collection selected');

      const addRes = await fetch(`http://localhost:3001/api/collections/${collection.collection_id}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, movieId: parseInt(movieId) })
      });
      const addData = await addRes.json();
      if (addData.success) {
        setListsMessage(`Added to list: ${collection.collection_name}`);
      } else {
        setListsMessage(addData.message || 'Failed to add movie to list');
      }
    } catch (err) {
      console.error('Add to list error', err);
      setListsMessage('Network error while adding to list');
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setUserReview(newReview);
    setShowReviewForm(false);
    // Trigger refresh of review list
    setReviewsRefresh(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <>
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="movie-detail-container">
        <div className="loading-spinner">Loading movie details...</div>
      </div>
      </>
    );
  }

  if (error || !movie) {
    return (
      <>
      <Navbar user={currentUser} onLogout={handleLogout} />
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
      </>
    );
  }

  // Parse genres string (from database STRING_AGG)
  const genres = movie.genres ? movie.genres.split(', ') : [];
  const avgRating = movie.avg_rating ? parseFloat(movie.avg_rating).toFixed(1) : 'N/A';
  const reviewCount = movie.review_count || 0;
  const castMembers = Array.isArray(movie.cast) ? movie.cast : [];
  const crewMembers = Array.isArray(movie.crew) ? movie.crew : [];
  const displayedReviewCount = movieReviews.length > 0 ? movieReviews.length : reviewCount;
  const reviewTotals = movieReviews.reduce((counts, review) => {
    const rating = Number(review.rating);
    if (rating >= 1 && rating <= 5) {
      counts[rating - 1] += 1;
    }
    return counts;
  }, [0, 0, 0, 0, 0]);
  const totalForDistribution = movieReviews.length || reviewCount;

  return (
    <>
    <Navbar user={currentUser} onLogout={handleLogout} />
    <div className="movie-detail-container">
      {/* Back Button */}
      <div style={{ marginBottom: 12 }}>
        <BackButton label={'Back to Movies'} />
      </div>

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
              {avgRating}/5 ({reviewCount} reviews)
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
              disabled={watchlistLoading}
            >
              {watchlistLoading ? (inWatchlist ? 'Removing...' : 'Adding...') : (inWatchlist ? 'In Watchlist' : 'Add to Watchlist')}
            </button>
            <button 
              onClick={handleAddToList}
              className="btn-rate"
              disabled={listsLoading}
            >
              {listsLoading ? 'Adding to List...' : 'Add to List'}
            </button>
            <button className="btn-rate">
              <Star size={18} />
              Rate Movie
            </button>
          </div>
          {listsMessage ? <div style={{ color: '#ffd56d', marginTop: 8 }}>{listsMessage}</div> : null}

          <ListPickerModal open={listModalOpen} collections={availableCollections} onCancel={() => setListModalOpen(false)} onConfirm={handleListPickerConfirm} />
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

            {/* Crew Section */}
            {crewMembers.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#f4d320', fontWeight: '600' }}>
                  ☆ Crew
                </h3>
                <div className="cast-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                  {crewMembers.map((member) => (
                    <div key={`${member.person_id}-${member.role_name}`} className="cast-card">
                      <div className="cast-avatar">
                        {String(member.full_name || '')
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join('') || 'C'}
                      </div>
                      <div className="cast-name">{member.full_name}</div>
                      <div className="cast-role" style={{ color: '#f4d320', fontWeight: '500' }}>{member.role_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cast Section */}
            <div>
              <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#f4f4f4', fontWeight: '600' }}>
                Cast
              </h3>
              {castMembers.length > 0 ? (
                <div className="cast-grid">
                  {castMembers.map((member) => (
                    <div key={member.person_id} className="cast-card">
                      <div className="cast-avatar">
                        {String(member.full_name || '')
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part.charAt(0).toUpperCase())
                          .join('') || 'C'}
                      </div>
                      <div className="cast-name">{member.full_name}</div>
                      <div className="cast-role">{member.role_name || 'Cast Member'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cast-grid">
                  <div className="cast-placeholder">
                    <p>Cast information coming soon...</p>
                    <small>Backend data available in Movie_Cast table</small>
                  </div>
                </div>
              )}
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
                      className={i < Math.round(parseFloat(avgRating)) ? 'filled' : 'empty'}
                    />
                  ))}
                </div>
                <div className="rating-count">{displayedReviewCount} ratings</div>
              </div>

              {/* Rating Distribution Bars */}
              <div className="rating-distribution">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewTotals[stars - 1] || 0;
                  const width = totalForDistribution > 0 ? (count / totalForDistribution) * 100 : 0;

                  return (
                  <div key={stars} className="distribution-row">
                    <span className="distribution-label">{stars}★</span>
                    <div className="distribution-bar">
                      <div 
                        className="distribution-fill"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="distribution-count">
                      {count}
                    </span>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Add Review Button */}
            {currentUser && !showReviewForm ? (
              <div className="review-add-section">
                <button 
                  onClick={() => setShowReviewForm(true)}
                  className="btn-add-review"
                >
                  {userReview ? 'Edit Your Review' : 'Write Your Review'}
                </button>
              </div>
            ) : null}

            {/* Review Form */}
            {currentUser && showReviewForm && (
              <ReviewForm
                movieId={parseInt(movieId)}
                userId={currentUser.id}
                existingReview={userReview}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

            {/* Reviews List */}
            {currentUser ? (
              <ReviewList
                movieId={parseInt(movieId)}
                currentUserId={currentUser.id}
                refreshTrigger={reviewsRefresh}
                onReviewsLoaded={setMovieReviews}
              />
            ) : (
              <div className="reviews-empty">
                Please login to see and write reviews.
              </div>
            )}
          </section>

          {/* Similar Movies Section */}
          <section className="detail-section">
            <h2 className="section-title">Similar Movies</h2>
            <div className="similar-movies">
              {/* TODO: Phase 4 - Implement recommendation algorithm */}
              <div className="similar-placeholder">
                <p>Recommended movies based on genre & ratings</p>
                <small>Similar Movies</small>
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
              <span className="value rating-value">{avgRating}/5</span>
            </div>
            <div className="info-item">
              <span className="label">Total Reviews:</span>
              <span className="value">{reviewCount}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
};

export default MovieDetailPage;
