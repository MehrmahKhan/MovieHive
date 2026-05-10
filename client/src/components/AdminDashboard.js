import React, { useEffect, useState } from 'react';
import AddMovieForm from './AddMovieForm';
import AdminUserManagement from './AdminUserManagement';
import AdminMovieManagement from './AdminMovieManagement';
import AdminReviewManagement from './AdminReviewManagement';
import AdminReports from './AdminReports';
import AdminForumManagement from './AdminForumManagement';

export default function AdminDashboard({user, onLogout}) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAddMovieForm, setShowAddMovieForm] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [showMovieManagement, setShowMovieManagement] = useState(false);
    const [showReviewManagement, setShowReviewManagement] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [showForumManagement, setShowForumManagement] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [overview, setOverview] = useState({
        totalUsers: 0,
        totalMovies: 0,
        totalReviews: 0,
        avgRating: '0.0'
    });

    useEffect(() => {
        const adminId = user?.user_id ?? user?.id;

        if (!adminId) {
            return;
        }

        let isMounted = true;

        const loadOverview = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/admin/summary?adminUserId=${adminId}`);
                const data = await response.json();

                if (!isMounted || !data.success) {
                    return;
                }

                setOverview({
                    totalUsers: data.summary?.totalUsers ?? 0,
                    totalMovies: data.summary?.totalMovies ?? 0,
                    totalReviews: data.summary?.totalReviews ?? 0,
                    avgRating: data.summary?.avgRating ?? '0.0'
                });
            } catch (error) {
                if (isMounted) {
                    console.error('Failed to load system overview:', error);
                }
            }
        };

        loadOverview();

        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.user_id]);

    return (
        <div className="min-h-screen text-white" style={{background: 'linear-gradient(135deg, #1f2132 0%, #595574 100%)', fontFamily: "'Poppins', sans-serif"}}>
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.7)', borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-light tracking-tight">MovieHive <span style={{color: '#f4d320', fontSize: '0.7em'}}>ADMIN</span></h1>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex gap-1 text-sm font-light">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'content', label: 'Content' },
                                { id: 'community', label: 'Community' },
                                { id: 'analytics', label: 'Analytics' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="px-4 py-2 rounded-sm transition"
                                    style={{
                                        backgroundColor: activeTab === tab.id ? 'rgba(244, 211, 32, 0.15)' : 'transparent',
                                        color: activeTab === tab.id ? '#f4d320' : '#c7c7cc',
                                        borderColor: activeTab === tab.id ? '#f4d320' : 'transparent',
                                        borderWidth: '1px'
                                    }}
                                    onMouseEnter={(e) => !activeTab.includes(tab.id) && (e.currentTarget.style.color = '#f4f4f4')}
                                    onMouseLeave={(e) => !activeTab.includes(tab.id) && (e.currentTarget.style.color = '#c7c7cc')}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-10 h-10 rounded-full font-medium text-sm transition flex items-center justify-center"
                                style={{backgroundColor: 'rgba(244, 211, 32, 0.1)', borderColor: '#f4d320', borderWidth: '1px', color: '#f4d320'}}
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-3 w-48 rounded-sm shadow-xl overflow-hidden" style={{backgroundColor: '#1d1f2b', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                    <div className="px-4 py-3" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                                        <p className="font-light text-sm" style={{color: '#f4f4f4'}}>{user?.name || 'Admin'}</p>
                                        <p className="text-xs" style={{color: '#afafba'}}>Admin User</p>
                                    </div>
                                    <button
                                        onClick={() => setShowUserManagement(true)}
                                        className="w-full text-left block px-4 py-2 text-sm transition font-light"
                                        style={{color: '#c7c7cc'}}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        Admin Settings
                                    </button>
                                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm transition border-t font-light" style={{color: '#c7c7cc', borderTopColor: '#3b3c45'}} onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-8 py-16">
                <div>
                    <h2 className="text-5xl font-light leading-tight mb-4 tracking-tight" style={{color: '#f4d320'}}>Admin Dashboard</h2>
                    <p className="font-light" style={{color: '#afafba'}}>Manage users, content, and system configurations</p>
                </div>
            </section>

            {/* Admin Actions - Tab Based */}
            <section className="max-w-7xl mx-auto px-8 py-12" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                {activeTab === 'overview' && (
                    <div>
                        <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>System Overview</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Total Users</p>
                                <p className="text-3xl font-light" style={{color: '#f4d320'}}>{overview.totalUsers}</p>
                                <p className="text-xs mt-2" style={{color: '#afafba'}}>Registered accounts</p>
                            </div>
                            <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Total Movies</p>
                                <p className="text-3xl font-light" style={{color: '#f4d320'}}>{overview.totalMovies}</p>
                                <p className="text-xs mt-2" style={{color: '#afafba'}}>Movies in the catalogue</p>
                            </div>
                            <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Total Reviews</p>
                                <p className="text-3xl font-light" style={{color: '#f4d320'}}>{overview.totalReviews}</p>
                                <p className="text-xs mt-2" style={{color: '#afafba'}}>Reviews submitted by users</p>
                            </div>
                            <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Avg Rating</p>
                                <p className="text-3xl font-light" style={{color: '#f4d320'}}>{overview.avgRating}</p>
                                <p className="text-xs mt-2" style={{color: '#afafba'}}>Out of 5.0</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div>
                        <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>Content Management</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                            <button onClick={() => setShowAddMovieForm(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                                <h4 className="font-light mb-2 text-lg" style={{color: '#f4d320'}}>Add New Movie</h4>
                                <p className="text-sm" style={{color: '#afafba'}}>Add new movies to the database with genres, descriptions, and release dates</p>
                            </button>
                            <button onClick={() => setShowMovieManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                                <h4 className="font-light mb-2 text-lg" style={{color: '#f4d320'}}>Edit/Delete Movies</h4>
                                <p className="text-sm" style={{color: '#afafba'}}>Update movie details or remove titles from the catalogue</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'community' && (
                    <div>
                        <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>Community Management</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button onClick={() => setShowUserManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                                <h4 className="font-light mb-2 text-lg" style={{color: '#f4d320'}}>Manage Users</h4>
                                <p className="text-sm" style={{color: '#afafba'}}>View, edit, suspend or remove user accounts and set permissions</p>
                            </button>
                            <button onClick={() => setShowReviewManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                                <h4 className="font-light mb-2 text-lg" style={{color: '#f4d320'}}>Manage Reviews</h4>
                                <p className="text-sm" style={{color: '#afafba'}}>Flag, unflag, or delete inappropriate reviews and comments</p>
                            </button>
                            <button onClick={() => setShowForumManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                                <h4 className="font-light mb-2 text-lg" style={{color: '#f4d320'}}>Manage Forums</h4>
                                <p className="text-sm" style={{color: '#afafba'}}>Manage categories, moderate threads and handle reports</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>Analytics & Reports</h3>
                        <div className="grid sm:grid-cols-1 gap-6">
                            <button onClick={() => setShowReports(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                                <h4 className="font-light mb-2 text-lg" style={{color: '#f4d320'}}>View Reports</h4>
                                <p className="text-sm" style={{color: '#afafba'}}>Analyze top-rated movies, flagged reviews, and user signup trends to understand platform activity</p>
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-12 mt-12" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                <div className="text-center text-xs font-light" style={{color: '#595574'}}>
                    <p>MovieHive 2026 - Database Project - FAST NU - Admin Panel</p>
                </div>
            </footer>

            {/* Add Movie Form Modal */}
            {showAddMovieForm && (
                <AddMovieForm
                    onMovieAdded={() => {
                        // 
                    }}
                    onClose={() => setShowAddMovieForm(false)}
                />
            )}

            {showUserManagement && (
                <AdminUserManagement
                    adminUser={user}
                    onClose={() => setShowUserManagement(false)}
                />
            )}

            {showMovieManagement && (
                <AdminMovieManagement
                    adminUser={user}
                    onClose={() => setShowMovieManagement(false)}
                />
            )}

            {showReviewManagement && (
                <AdminReviewManagement
                    adminUser={user}
                    onClose={() => setShowReviewManagement(false)}
                />
            )}

            {showForumManagement && (
                <AdminForumManagement
                    adminUser={user}
                    onClose={() => setShowForumManagement(false)}
                />
            )}

            {showReports && (
                <AdminReports
                    adminUser={user}
                    onClose={() => setShowReports(false)}
                />
            )}
        </div>
    );
}
