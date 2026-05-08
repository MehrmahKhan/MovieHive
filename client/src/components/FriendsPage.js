import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './FriendsPage.css';

const FriendsPage = ({ currentUser }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(currentUser || null);
    const [friends, setFriends] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [searchUsername, setSearchUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'pending', 'search'

    // Redirect if not logged in and restore user from localStorage
    useEffect(() => {
        if (!currentUser) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } else {
                navigate('/');
            }
        } else {
            setUser(currentUser);
        }
    }, [currentUser, navigate]);

    // Fetch friends list
    useEffect(() => {
        if (user) {
            const fetchFriendsList = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/friends/${user.id}/list`);
                    const data = await response.json();
                    if (data.success) {
                        setFriends(data.friends || []);
                    }
                } catch (err) {
                    console.error('Error fetching friends:', err);
                }
            };

            const fetchPendingRequests = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/friends/${user.id}/requests`);
                    const data = await response.json();
                    if (data.success) {
                        setPendingRequests(data.requests || []);
                    }
                } catch (err) {
                    console.error('Error fetching pending requests:', err);
                }
            };

            fetchFriendsList();
            fetchPendingRequests();
        }
    }, [user]);

    const handleSendFriendRequest = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        console.log('Send friend request clicked. User state:', user);

        if (!searchUsername.trim()) {
            setError('Please enter a username');
            return;
        }

        if (!user || !user.id) {
            console.error('Validation failed: user =', user, 'user.id =', user ? user.id : 'N/A');
            setError('User not logged in');
            return;
        }

        console.log('Sending friend request. userId:', user.id, 'username:', searchUsername);

        setLoading(true);
        try {
            const requestBody = {
                userId: user.id,
                username: searchUsername.trim()
            };
            console.log('Request body:', requestBody);
            
            const response = await fetch('http://localhost:3001/api/friends/request/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                setSuccess(`Friend request sent to ${searchUsername}`);
                setSearchUsername('');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to send friend request');
            }
        } catch (err) {
            setLoading(false);
            setError('Error sending friend request');
            console.error(err);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        const fetchFriendsList = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/friends/${user.id}/list`);
                const data = await response.json();
                if (data.success) {
                    setFriends(data.friends || []);
                }
            } catch (err) {
                console.error('Error fetching friends:', err);
            }
        };

        const fetchPendingRequests = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/friends/${user.id}/requests`);
                const data = await response.json();
                if (data.success) {
                    setPendingRequests(data.requests || []);
                }
            } catch (err) {
                console.error('Error fetching pending requests:', err);
            }
        };

        try {
            const response = await fetch(`http://localhost:3001/api/friends/request/${requestId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Friend request accepted');
                fetchPendingRequests();
                fetchFriendsList();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to accept request');
            }
        } catch (err) {
            setError('Error accepting request');
            console.error(err);
        }
    };

    const handleOpenChat = (friendId, friendName) => {
        navigate(`/chat/${friendId}`, { state: { friendName } });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) {
        return <div className="friends-page"><p>Loading...</p></div>;
    }

    return (
        <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="friends-page moviehive-page">
            <div className="friends-container moviehive-shell">
                <div className="friends-header">
                    <h1>Friends & Chat</h1>
                    <p>Manage your friends and chat with them</p>
                </div>

                {error && <div className="message error-message">{error}</div>}
                {success && <div className="message success-message">{success}</div>}

                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        Friends ({friends.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Requests ({pendingRequests.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                        onClick={() => setActiveTab('search')}
                    >
                        Find Friends
                    </button>
                </div>

                <div className="tab-content">
                    {/* Friends Tab */}
                    {activeTab === 'friends' && (
                        <div className="friends-list">
                            {friends.length === 0 ? (
                                <p className="empty-state">No friends yet. Send friend requests to get started!</p>
                            ) : (
                                friends.map(friend => (
                                    <div key={friend.friend_id} className="friend-card">
                                        <div className="friend-info">
                                            <h3>{friend.friend_name}</h3>
                                            <p className="friend-since">Friends since {new Date(friend.since).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            className="chat-button"
                                            onClick={() => handleOpenChat(friend.friend_id, friend.friend_name)}
                                        >
                                            Chat
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Pending Requests Tab */}
                    {activeTab === 'pending' && (
                        <div className="pending-requests">
                            {pendingRequests.length === 0 ? (
                                <p className="empty-state">No pending friend requests</p>
                            ) : (
                                pendingRequests.map(request => (
                                    <div key={request.request_id} className="request-card">
                                        <div className="request-info">
                                            <h3>{request.from_user_name}</h3>
                                            <p className="request-time">Sent {new Date(request.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            className="accept-button"
                                            onClick={() => handleAcceptRequest(request.request_id)}
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div className="search-section">
                            <form onSubmit={handleSendFriendRequest} className="search-form">
                                <div className="form-group">
                                    <label>Enter username to add friend</label>
                                    <input
                                        type="text"
                                        value={searchUsername}
                                        onChange={(e) => setSearchUsername(e.target.value)}
                                        placeholder="Enter friend's username"
                                        disabled={loading}
                                    />
                                </div>
                                <button type="submit" className="send-button" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Friend Request'}
                                </button>
                            </form>
                            <p className="search-hint">Search for friends by their exact username to send them a friend request.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default FriendsPage;
