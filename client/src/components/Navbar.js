import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout, activeBrowseSection, onBrowseSectionChange }) {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleNavigation = (path) => {
        setShowUserMenu(false);
        navigate(path);
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-sm" style={{backgroundColor: 'rgba(29, 31, 43, 0.7)', borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                <h1 
                    className="text-2xl font-light tracking-tight cursor-pointer" 
                    onClick={() => handleNavigation('/')}
                    style={{color: '#f4f4f4'}}
                >
                    MovieHive
                </h1>

                <div className="flex items-center gap-8">
                    {/* Browse Sections - only show on Dashboard */}
                    {onBrowseSectionChange && (
                        <div className="hidden md:flex gap-8 text-sm font-light" style={{color: '#c7c7cc'}}>
                            <button 
                                onClick={() => onBrowseSectionChange('discover')} 
                                className="transition hover:text-white"
                                style={{color: activeBrowseSection === 'discover' ? '#f4d320' : '#c7c7cc'}}
                            >
                                Discover
                            </button>
                            <button 
                                onClick={() => onBrowseSectionChange('trending')} 
                                className="transition hover:text-white"
                                style={{color: activeBrowseSection === 'trending' ? '#f4d320' : '#c7c7cc'}}
                            >
                                Trending
                            </button>
                            <button 
                                onClick={() => onBrowseSectionChange('upcoming')} 
                                className="transition hover:text-white"
                                style={{color: activeBrowseSection === 'upcoming' ? '#f4d320' : '#c7c7cc'}}
                            >
                                Upcoming
                            </button>
                            <button 
                                onClick={() => onBrowseSectionChange('top-rated')} 
                                className="transition hover:text-white"
                                style={{color: activeBrowseSection === 'top-rated' ? '#f4d320' : '#c7c7cc'}}
                            >
                                Top Rated
                            </button>
                        </div>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-10 h-10 rounded-full font-medium text-sm transition flex items-center justify-center"
                            style={{backgroundColor: 'rgba(244, 211, 32, 0.1)', borderColor: '#f4d320', borderWidth: '1px', color: '#f4d320'}}
                        >
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-3 w-48 rounded-sm shadow-xl overflow-hidden" style={{backgroundColor: '#1d1f2b', borderColor: '#3b3c45', borderWidth: '1px'}}>
                                <div className="px-4 py-3" style={{borderBottomColor: '#3b3c45', borderBottomWidth: '1px'}}>
                                    <p className="font-light text-sm" style={{color: '#f4f4f4'}}>{user?.name || 'User'}</p>
                                    <p className="text-xs" style={{color: '#afafba'}}>{user?.email || 'email@example.com'}</p>
                                </div>
                                
                                {/* New: My Watchlist, My Lists, Friends in dropdown */}
                                <button 
                                    onClick={() => handleNavigation('/watchlist')} 
                                    className="w-full text-left block px-4 py-2 text-sm transition font-light" 
                                    style={{color: '#c7c7cc'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    My Watchlist
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/lists')} 
                                    className="w-full text-left block px-4 py-2 text-sm transition font-light" 
                                    style={{color: '#c7c7cc'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    My Lists
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/friends')} 
                                    className="w-full text-left block px-4 py-2 text-sm transition font-light" 
                                    style={{color: '#c7c7cc'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Friends
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/forum')} 
                                    className="w-full text-left block px-4 py-2 text-sm transition font-light" 
                                    style={{color: '#c7c7cc'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Forum
                                </button>
                                
                                <div style={{borderTopColor: '#3b3c45', borderTopWidth: '1px'}}></div>
                                
                                <button 
                                    onClick={() => handleNavigation('/profile')} 
                                    className="w-full text-left block px-4 py-2 text-sm transition font-light" 
                                    style={{color: '#c7c7cc'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Profile
                                </button>
                                <button 
                                    onClick={() => handleNavigation('/settings')} 
                                    className="w-full text-left block px-4 py-2 text-sm transition font-light" 
                                    style={{color: '#c7c7cc'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Settings
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        onLogout();
                                    }} 
                                    className="w-full text-left px-4 py-2 text-sm transition border-t font-light" 
                                    style={{color: '#c7c7cc', borderTopColor: '#3b3c45'}} 
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#262626'} 
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                >
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
