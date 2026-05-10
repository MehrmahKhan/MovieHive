import React, { useState, useEffect } from 'react';

const ReviewForm = ({ movieId, userId, onReviewSubmitted, existingReview = null, onCancel = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isValid = rating >= 1 && rating <= 5;
  const isEditing = !!existingReview;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isEditing
        ? `http://localhost:3001/api/reviews/${existingReview.review_id}`
        : 'http://localhost:3001/api/reviews';

      const method = isEditing ? 'PUT' : 'POST';

      const payload = isEditing
        ? { rating, reviewText }
        : { userId, movieId, rating, reviewText };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to submit review');
        return;
      }

      setSuccess(data.message || (isEditing ? 'Review updated!' : 'Review added!'));
      setRating(5);
      setReviewText('');

      setTimeout(() => onReviewSubmitted(data.review), 1500);
    } catch (err) {
      setError(err.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>{isEditing ? 'Edit Your Review' : 'Write a Review'}</h3>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <div className="form-group">
        <label>Rating *</label>
        <div className="rating-selector">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`star-button ${star <= rating ? 'filled' : 'empty'}`}
              title={`${star} star${star > 1 ? 's' : ''}`}
            >
              {star}
            </button>
          ))}
          <span className="rating-text">{rating}/5</span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reviewText">Review (optional, max 1000 characters)</label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value.slice(0, 1000))}
          placeholder="Share your thoughts about this movie..."
          maxLength={1000}
          rows={5}
        />
        <small>{reviewText.length}/1000</small>
      </div>

      <div className="form-buttons">
        <button
          type="submit"
          disabled={loading || !isValid}
          className="btn-submit"
        >
          {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;
