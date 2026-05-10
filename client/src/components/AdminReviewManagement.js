import React, { useState, useEffect } from 'react';
import { X, Flag, Trash2, Search } from 'lucide-react';

export default function AdminReviewManagement({ adminUser, onClose }) {
    const adminId = adminUser?.user_id ?? adminUser?.id;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterFlagged, setFilterFlagged] = useState(false);
    const [flagReason, setFlagReason] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3001/api/reviews/admin/all?adminUserId=${adminId}`);
            const data = await response.json();
            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFlagReview = async (reviewId) => {
        if (!flagReason.trim()) {
            alert('Please enter a reason for flagging');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/reviews/admin/flag/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminUserId: adminId,
                    reason: flagReason
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('Review flagged successfully');
                setFlagReason('');
                setSelectedReview(null);
                fetchReviews();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error flagging review:', error);
            alert('Failed to flag review');
        }
    };

    const handleUnflagReview = async (reviewId) => {
        try {
            const response = await fetch(`http://localhost:3001/api/reviews/admin/unflag/${reviewId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUserId: adminId })
            });

            const data = await response.json();
            if (data.success) {
                alert('Review unflagged successfully');
                fetchReviews();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error unflagging review:', error);
            alert('Failed to unflag review');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Delete this review?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/reviews/admin/${reviewId}?adminUserId=${adminId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                alert('Review deleted successfully');
                fetchReviews();
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    const filteredReviews = filterFlagged ? reviews.filter(r => r.is_flagged) : reviews;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}>
            <div className="w-full max-w-4xl max-h-96 rounded-lg overflow-hidden flex flex-col" style={{background: 'rgba(11,14,22,0.96)', border: '1px solid rgba(244,211,32,0.18)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)'}}>
                {/* Header */}
                <div className="flex items-center justify-between p-6" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                    <h2 className="text-2xl font-light" style={{color: '#f4f4f4'}}>Manage Reviews</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition"
                        style={{color: '#afafba'}}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="px-6 py-4 flex items-center gap-4" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                    <label className="flex items-center gap-2" style={{color: '#f4f4f4'}}>
                        <input
                            type="checkbox"
                            checked={filterFlagged}
                            onChange={(e) => setFilterFlagged(e.target.checked)}
                        />
                        <span className="text-sm font-light">Show Flagged Only</span>
                    </label>
                    <span className="text-xs" style={{color: '#afafba'}}>
                        Total: {reviews.length} | Flagged: {reviews.filter(r => r.is_flagged).length}
                    </span>
                </div>

                {/* Reviews List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-6 text-center" style={{color: '#afafba'}}>Loading reviews...</div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="p-6 text-center" style={{color: '#afafba'}}>
                            {filterFlagged ? 'No flagged reviews' : 'No reviews found'}
                        </div>
                    ) : (
                        <div>
                            {filteredReviews.map(review => (
                                <div key={review.review_id} className="p-4" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px', backgroundColor: 'rgba(29,31,43,0.3)'}}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-semibold" style={{color: '#f4f4f4'}}>{review.movie_title}</h4>
                                            <p className="text-sm" style={{color: '#afafba'}}>By {review.username || 'Unknown'} • {review.rating}/5</p>
                                            <p className="text-sm mt-1" style={{color: '#d9d9e3'}}>{review.review_text}</p>
                                            
                                            {review.is_flagged && (
                                                <div className="mt-2 p-2 rounded" style={{backgroundColor: 'rgba(255,90,90,0.1)', border: '1px solid rgba(255,90,90,0.2)'}}>
                                                    <p className="text-xs font-semibold" style={{color: '#ffb4b4'}}>FLAGGED</p>
                                                    <p className="text-xs" style={{color: '#ffb4b4'}}>Reason: {review.flag_reason}</p>
                                                    <p className="text-xs" style={{color: '#afafba'}}>By {review.flagged_by_admin} on {new Date(review.flagged_date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            {review.is_flagged ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUnflagReview(review.review_id)}
                                                        className="p-2 rounded transition text-sm font-light"
                                                        style={{color: '#c5f4b5', backgroundColor: 'rgba(197,244,181,0.1)'}}
                                                        title="Unflag"
                                                    >
                                                        Unflag
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.review_id)}
                                                        className="p-2 rounded transition"
                                                        style={{color: '#ffb4b4', backgroundColor: 'rgba(255,90,90,0.1)'}}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedReview(review.review_id)}
                                                    className="p-2 rounded transition"
                                                    style={{color: '#f4d320', backgroundColor: 'rgba(244,211,32,0.1)'}}
                                                    title="Flag"
                                                >
                                                    <Flag size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {selectedReview === review.review_id && (
                                        <div className="mt-3 p-3 rounded" style={{backgroundColor: 'rgba(29,31,43,0.5)', border: '1px solid #3b3c45'}}>
                                            <input
                                                type="text"
                                                placeholder="Reason for flagging..."
                                                value={flagReason}
                                                onChange={(e) => setFlagReason(e.target.value)}
                                                className="w-full px-3 py-2 rounded mb-2 text-sm"
                                                style={{backgroundColor: '#1d1f2b', color: '#f4f4f4', border: '1px solid #3b3c45'}}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleFlagReview(review.review_id)}
                                                    className="flex-1 py-1 rounded text-sm transition font-light"
                                                    style={{backgroundColor: '#f4d320', color: '#111'}}
                                                >
                                                    Flag Review
                                                </button>
                                                <button
                                                    onClick={() => setSelectedReview(null)}
                                                    className="flex-1 py-1 rounded text-sm transition font-light"
                                                    style={{backgroundColor: 'rgba(255,90,90,0.15)', color: '#ffb4b4', border: '1px solid rgba(255,90,90,0.25)'}}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
