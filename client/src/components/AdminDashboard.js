import React, { useState } from 'react';
import AddMovieForm from './AddMovieForm';
import AdminUserManagement from './AdminUserManagement';
import AdminMovieManagement from './AdminMovieManagement';
import AdminReviewManagement from './AdminReviewManagement';

export default function AdminDashboard({user, onLogout}) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showAddMovieForm, setShowAddMovieForm] = useState(false);
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [showMovieManagement, setShowMovieManagement] = useState(false);
    const [showReviewManagement, setShowReviewManagement] = useState(false);

    return (
        <div className="min-h-screen text-white" style={{background: 'linear-gradient(135deg, #1f2132 0%, #595574 100%)', fontFamily: "'Poppins', sans-serif"}}>
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.7)', borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-light tracking-tight">MovieHive <span style={{color: '#f4d320', fontSize: '0.7em'}}>ADMIN</span></h1>

                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex gap-8 text-sm font-light" style={{color: '#c7c7cc'}}>
                            <button className="transition hover:text-white">Dashboard</button>
                            <button className="transition hover:text-white">Users</button>
                            <button className="transition hover:text-white">Reports</button>
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

            {/* Admin Stats */}
            <section className="max-w-7xl mx-auto px-8 py-12" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>System Overview</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Total Users</p>
                        <p className="text-3xl font-light" style={{color: '#f4d320'}}>127</p>
                        <p className="text-xs mt-2" style={{color: '#afafba'}}>+5 this week</p>
                    </div>
                    <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Total Movies</p>
                        <p className="text-3xl font-light" style={{color: '#f4d320'}}>342</p>
                        <p className="text-xs mt-2" style={{color: '#afafba'}}>+12 this week</p>
                    </div>
                    <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Total Reviews</p>
                        <p className="text-3xl font-light" style={{color: '#f4d320'}}>856</p>
                        <p className="text-xs mt-2" style={{color: '#afafba'}}>+43 this week</p>
                    </div>
                    <div className="p-6 rounded-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}}>
                        <p className="text-xs uppercase tracking-widest mb-2" style={{color: '#595574'}}>Avg Rating</p>
                        <p className="text-3xl font-light" style={{color: '#f4d320'}}>8.2</p>
                        <p className="text-xs mt-2" style={{color: '#afafba'}}>Out of 10.0</p>
                    </div>
                </div>
            </section>

            {/* Admin Actions */}
            <section className="max-w-7xl mx-auto px-8 py-12" style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}>
                <h3 className="text-2xl font-light mb-8 tracking-tight" style={{color: '#f4f4f4'}}>Admin Actions</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button onClick={() => setShowUserManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                        <h4 className="font-light mb-2" style={{color: '#f4f4f4'}}>Manage Users</h4>
                        <p className="text-sm" style={{color: '#afafba'}}>View, edit, or remove user accounts and permissions</p>
                    </button>
                    <button onClick={() => setShowAddMovieForm(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                        <h4 className="font-light mb-2" style={{color: '#f4f4f4'}}>Add Movie</h4>
                        <p className="text-sm" style={{color: '#afafba'}}>Add new movies to the database with genres and details</p>
                    </button>
                    <button onClick={() => setShowMovieManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                        <h4 className="font-light mb-2" style={{color: '#f4f4f4'}}>Edit/Delete Movies</h4>
                        <p className="text-sm" style={{color: '#afafba'}}>Update or remove existing movies and their details</p>
                    </button>
                    <button onClick={() => setShowReviewManagement(true)} className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                        <h4 className="font-light mb-2" style={{color: '#f4f4f4'}}>Manage Reviews</h4>
                        <p className="text-sm" style={{color: '#afafba'}}>Flag, unflag, or delete inappropriate reviews</p>
                    </button>
                    <button className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                        <h4 className="font-light mb-2" style={{color: '#f4f4f4'}}>View Reports</h4>
                        <p className="text-sm" style={{color: '#afafba'}}>Analyze user activity, reviews, and system performance metrics</p>
                    </button>
                    <button className="p-6 rounded-sm transition text-left" style={{backgroundColor: 'rgba(29, 31, 43, 0.5)', borderColor: '#3b3c45', borderWidth: '1px'}} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f4d320'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#3b3c45'}>
                        <h4 className="font-light mb-2" style={{color: '#f4f4f4'}}>System Settings</h4>
                        <p className="text-sm" style={{color: '#afafba'}}>Configure system-wide settings and database maintenance tasks</p>
                    </button>
                </div>
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
                        // Optional: refresh movie list or show success message
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
        </div>
    );
}
