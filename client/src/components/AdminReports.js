import React, { useEffect, useState } from 'react';

export default function AdminReports({ adminUser, onClose }) {
    const [topMovies, setTopMovies] = useState([]);
    const [flaggedSummary, setFlaggedSummary] = useState({ totalFlagged: 0, flaggedLastWeek: 0, recentFlagged: [] });
    const [signupTrends, setSignupTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const adminId = adminUser?.user_id ?? adminUser?.id;

    useEffect(() => {
        if (!adminId) return;

        let isMounted = true;

        const loadReports = async () => {
            try {
                setLoading(true);
                setError('');

                const [moviesRes, flaggedRes, trendsRes] = await Promise.all([
                    fetch(`http://localhost:3001/api/admin/reports/top-movies?adminUserId=${adminId}`),
                    fetch(`http://localhost:3001/api/admin/reports/flagged-reviews?adminUserId=${adminId}`),
                    fetch(`http://localhost:3001/api/admin/reports/signup-trends?adminUserId=${adminId}`)
                ]);

                if (!isMounted) return;

                if (!moviesRes.ok || !flaggedRes.ok || !trendsRes.ok) {
                    setError('Failed to load reports');
                    setLoading(false);
                    return;
                }

                const moviesData = await moviesRes.json();
                const flaggedData = await flaggedRes.json();
                const trendsData = await trendsRes.json();

                if (isMounted) {
                    setTopMovies(moviesData.movies || []);
                    setFlaggedSummary(flaggedData.summary || {});
                    setSignupTrends(trendsData.trends || []);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to load reports');
                    setLoading(false);
                }
            }
        };

        loadReports();

        return () => {
            isMounted = false;
        };
    }, [adminId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto" style={{backgroundColor: 'rgba(3, 5, 10, 0.72)'}}>
            <div className="w-full max-w-6xl" style={{backgroundColor: '#1d1f2b', borderColor: '#3b3c45', borderWidth: '1px'}}>
                {/* Header */}
                <div className="sticky top-0 flex items-center justify-between px-6 py-4" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px', backgroundColor: '#1d1f2b'}}>
                    <h2 className="text-2xl font-light" style={{color: '#f4f4f4'}}>Reports & Analytics</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl"
                        style={{color: '#afafba'}}
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto px-6 py-6">
                    {loading && (
                        <div className="text-center py-12" style={{color: '#afafba'}}>
                            <p>Loading reports...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded" style={{backgroundColor: 'rgba(255, 90, 90, 0.1)', borderColor: 'rgba(255, 90, 90, 0.25)', borderWidth: '1px', color: '#ffb4b4'}}>
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="space-y-8">
                            {/* Top Movies */}
                            <section>
                                <h3 className="text-xl font-light mb-4" style={{color: '#f4d320'}}>Top Rated Movies</h3>
                                <div className="space-y-2">
                                    {topMovies.length > 0 ? (
                                        topMovies.map((movie, idx) => (
                                            <div key={movie.movie_id} className="flex justify-between p-3 rounded" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                                <div className="flex-1">
                                                    <p className="font-light" style={{color: '#f4f4f4'}}>{idx + 1}. {movie.title} ({movie.release_year})</p>
                                                    <p className="text-xs" style={{color: '#afafba'}}>⭐ {movie.avg_rating}/5 • {movie.total_reviews} reviews</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{color: '#afafba'}}>No movies with reviews yet</p>
                                    )}
                                </div>
                            </section>

                            {/* Flagged Reviews */}
                            <section>
                                <h3 className="text-xl font-light mb-4" style={{color: '#f4d320'}}>Flagged Reviews Summary</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="p-4 rounded" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                        <p className="text-xs" style={{color: '#595574'}}>Total Flagged</p>
                                        <p className="text-2xl font-light" style={{color: '#f4d320'}}>{flaggedSummary.totalFlagged || 0}</p>
                                    </div>
                                    <div className="p-4 rounded" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                        <p className="text-xs" style={{color: '#595574'}}>Last 7 Days</p>
                                        <p className="text-2xl font-light" style={{color: '#f4d320'}}>{flaggedSummary.flaggedLastWeek || 0}</p>
                                    </div>
                                </div>
                                {flaggedSummary.recentFlagged && flaggedSummary.recentFlagged.length > 0 && (
                                    <div>
                                        <p className="text-sm mb-2" style={{color: '#afafba'}}>Recent Flagged Items:</p>
                                        <div className="space-y-2">
                                            {flaggedSummary.recentFlagged.map((review, idx) => (
                                                <div key={idx} className="p-3 rounded text-sm" style={{backgroundColor: 'rgba(255, 90, 90, 0.05)', borderColor: 'rgba(255, 90, 90, 0.15)', borderWidth: '1px'}}>
                                                    <p style={{color: '#f4f4f4'}}><strong>{review.title}</strong> by {review.name || 'Anonymous'}</p>
                                                    <p style={{color: '#afafba'}}>Reason: {review.flag_reason || 'No reason provided'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Signup Trends */}
                            <section>
                                <h3 className="text-xl font-light mb-4" style={{color: '#f4d320'}}>User Signups (Last 6 Months)</h3>
                                <div className="space-y-2">
                                    {signupTrends.length > 0 ? (
                                        signupTrends.map((trend, idx) => {
                                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            const monthStr = `${monthNames[trend.month - 1] || '?'} ${trend.year}`;
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                                    <p style={{color: '#f4f4f4'}}>{monthStr}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-24 h-2 rounded" style={{backgroundColor: '#595574'}}>
                                                            <div className="h-full rounded" style={{backgroundColor: '#f4d320', width: `${(trend.signup_count / Math.max(...signupTrends.map(t => t.signup_count), 1)) * 100}%`}}></div>
                                                        </div>
                                                        <p className="font-light" style={{color: '#f4d320', minWidth: '30px', textAlign: 'right'}}>{trend.signup_count}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p style={{color: '#afafba'}}>No signup data available</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded font-medium transition"
                        style={{backgroundColor: '#3b3c45', color: '#c7c7cc'}}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
