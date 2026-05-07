import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ChatWindow.css';

const ChatWindow = ({ currentUser }) => {
    const { friendId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(currentUser || null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [friendName, setFriendName] = useState('');
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

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

    // Get friend name from location state or fetch it
    useEffect(() => {
        const state = window.history.state?.usr;
        if (state?.friendName) {
            setFriendName(state.friendName);
        }
    }, []);

    // Fetch messages and setup polling
    useEffect(() => {
        if (user && friendId) {
            const fetchMessages = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/messages/${user.id}?friendId=${friendId}`);
                    const data = await response.json();
                    if (data.success) {
                        setMessages(data.messages || []);
                        setError('');
                    }
                } catch (err) {
                    console.error('Error fetching messages:', err);
                }
            };

            fetchMessages();
            // Poll for new messages every 2 seconds
            pollIntervalRef.current = setInterval(() => {
                fetchMessages();
            }, 2000);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [user, friendId]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        if (!user || !user.id) {
            setError('User not logged in');
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch('http://localhost:3001/api/messages/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: user.id,
                    recipientId: parseInt(friendId),
                    content: messageText
                })
            });

            const data = await response.json();
            setIsSending(false);

            if (data.success) {
                setMessageText('');
                // Immediately fetch after sending
                const fetchResponse = await fetch(`http://localhost:3001/api/messages/${user.id}?friendId=${friendId}`);
                const fetchData = await fetchResponse.json();
                if (fetchData.success) {
                    setMessages(fetchData.messages || []);
                }
            } else {
                setError(data.message || 'Failed to send message');
            }
        } catch (err) {
            setIsSending(false);
            setError('Error sending message');
            console.error(err);
        }
    };

    const handleGoBack = () => {
        navigate('/friends');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) {
        return <div className="chat-window"><p>Loading...</p></div>;
    }

    return (
        <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="chat-window">
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    <button className="back-button" onClick={handleGoBack}>Back</button>
                    <h2>{friendName || 'Chat'}</h2>
                    <div className="header-spacer"></div>
                </div>

                {/* Error Message */}
                {error && <div className="message error-message">{error}</div>}

                {/* Messages Area */}
                <div className="messages-area">
                    {messages.length === 0 ? (
                        <div className="empty-chat">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.message_id}
                                className={`message-bubble ${msg.sender_id === user.id ? 'sent' : 'received'}`}
                            >
                                <div className="message-content">{msg.content}</div>
                                <div className="message-time">{formatTime(msg.sent_at)}</div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="message-form">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        disabled={isSending}
                    />
                    <button type="submit" disabled={isSending || !messageText.trim()}>
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </div>
        </>
    );
};

export default ChatWindow;
