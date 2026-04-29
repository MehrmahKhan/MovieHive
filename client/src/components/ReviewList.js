import React, { useState, useEffect } from 'react';
import ReviewItem from './ReviewItem';

const ReviewList = ({ movieId, currentUserId, refreshTrigger, onReviewsLoaded }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch reviews whenever movieId changes or refreshTrigger updates
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:3001/api/reviews/movie/${movieId}`);
        const data = await response.json();

        if (data.success) {
          const nextReviews = data.reviews || [];
          setReviews(nextReviews);
          if (onReviewsLoaded) {
            onReviewsLoaded(nextReviews);
          }
        } else {
          setError(data.message || 'Failed to fetch reviews');
          if (onReviewsLoaded) {
            onReviewsLoaded([]);
          }
        }
      } catch (err) {
        setError(err.message || 'Error fetching reviews');
        if (onReviewsLoaded) {
          onReviewsLoaded([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchReviews();
    }
  }, [movieId, refreshTrigger]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        const nextReviews = reviews.filter(r => r.review_id !== reviewId);
        setReviews(nextReviews);
        if (onReviewsLoaded) {
          onReviewsLoaded(nextReviews);
        }
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      alert(err.message || 'Error deleting review');
    }
  };

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (error) {
    return <div className="reviews-error">{error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="reviews-empty">No reviews yet. Be the first to review!</div>;
  }

  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <ReviewItem
          key={review.review_id}
          review={review}
          currentUserId={currentUserId}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};

export default ReviewList;
