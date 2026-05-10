import React from 'react';

const ReviewItem = ({ review, currentUserId, onEdit, onDelete }) => {
  const isOwnReview = currentUserId && review.user_id === currentUserId;
  const sentimentClass = review.sentiment_score > 0 ? 'positive' : review.sentiment_score < 0 ? 'negative' : 'neutral';

  const reviewDate = new Date(review.review_date);
  const formattedDate = reviewDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="review-user-info">
          <div className="review-username">
            {review.username || 'Anonymous'}
            {isOwnReview && <span className="badge-own">(You)</span>}
          </div>
          <div className="review-date">{formattedDate}</div>
        </div>

        <div className="review-actions">
          <div className="review-rating">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`rating-star ${i < review.rating ? 'filled' : 'empty'}`}
              >
                {i + 1}
              </span>
            ))}
            <span className="rating-number">{review.rating}/5</span>
          </div>

          {isOwnReview && (
            <div className="review-buttons">
              <button onClick={() => onEdit(review)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(review.review_id)} className="btn-delete">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {review.review_text && (
        <p className="review-text">{review.review_text}</p>
      )}

      {review.sentiment_score && (
        <div className={`review-sentiment ${sentimentClass}`}>
          {sentimentClass === 'positive' && 'Positive feedback'}
          {sentimentClass === 'negative' && 'Critical feedback'}
          {sentimentClass === 'neutral' && 'Neutral'}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
