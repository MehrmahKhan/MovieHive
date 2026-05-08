import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './ForumPage.css';

export default function ForumPage({ currentUser }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(currentUser || null);
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [replies, setReplies] = useState([]);
    const [threadsLoading, setThreadsLoading] = useState(false);
    const [threadLoading, setThreadLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadBody, setNewThreadBody] = useState('');
    const [replyBody, setReplyBody] = useState('');

    useEffect(() => {
        if (!currentUser) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                navigate('/');
            }
        } else {
            setUser(currentUser);
        }
    }, [currentUser, navigate]);

    const loadCategories = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/forum/categories');
            const data = await response.json();
            if (data.success) {
                const loaded = data.categories || [];
                setCategories(loaded);
                setSelectedCategoryId((prev) => prev || loaded[0]?.category_id || null);
            } else {
                setError(data.message || 'Failed to load forum categories');
            }
        } catch (err) {
            console.error('Error loading forum categories:', err);
            setError('Network error while loading forum');
        }
    }, []);

    const loadThreads = useCallback(async (categoryId) => {
        if (!categoryId) {
            setThreads([]);
            return;
        }

        setThreadsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/forum/threads?categoryId=${categoryId}`);
            const data = await response.json();
            if (data.success) {
                setThreads(data.threads || []);
                setSelectedThread((prev) => {
                    if (!prev) return data.threads?.[0] || null;
                    return data.threads.some((thread) => thread.thread_id === prev.thread_id) ? prev : (data.threads?.[0] || null);
                });
            } else {
                setThreads([]);
                setError(data.message || 'Failed to load forum threads');
            }
        } catch (err) {
            console.error('Error loading forum threads:', err);
            setError('Network error while loading threads');
        } finally {
            setThreadsLoading(false);
        }
    }, []);

    const loadSelectedThread = useCallback(async (threadId) => {
        if (!threadId) {
            setSelectedThread(null);
            setReplies([]);
            return;
        }

        setThreadLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/forum/threads/${threadId}`);
            const data = await response.json();
            if (data.success) {
                setSelectedThread(data.thread);
                setReplies(data.replies || []);
                setError('');
            } else {
                setError(data.message || 'Failed to load thread');
            }
        } catch (err) {
            console.error('Error loading forum thread:', err);
            setError('Network error while loading thread');
        } finally {
            setThreadLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        if (selectedCategoryId) {
            loadThreads(selectedCategoryId);
        }
    }, [selectedCategoryId, loadThreads]);

    useEffect(() => {
        if (selectedThread?.thread_id) {
            loadSelectedThread(selectedThread.thread_id);
        }
    }, [selectedThread?.thread_id, loadSelectedThread]);

    const selectedCategory = useMemo(
        () => categories.find((category) => category.category_id === selectedCategoryId) || null,
        [categories, selectedCategoryId]
    );

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleCreateThread = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!user?.id || !selectedCategoryId || !newThreadTitle.trim() || !newThreadBody.trim()) {
            setError('Category, title, and post body are required');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/forum/threads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    categoryId: selectedCategoryId,
                    title: newThreadTitle,
                    body: newThreadBody
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewThreadTitle('');
                setNewThreadBody('');
                setMessage('Thread created');
                await loadThreads(selectedCategoryId);
                setSelectedThread(data.thread);
            } else {
                setError(data.message || 'Failed to create thread');
            }
        } catch (err) {
            console.error('Create thread error:', err);
            setError('Network error while creating thread');
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!user?.id || !selectedThread?.thread_id || !replyBody.trim()) {
            setError('Reply text is required');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3001/api/forum/threads/${selectedThread.thread_id}/replies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, body: replyBody })
            });

            const data = await response.json();
            if (data.success) {
                setReplyBody('');
                setMessage('Reply posted');
                await loadSelectedThread(selectedThread.thread_id);
                await loadThreads(selectedCategoryId);
            } else {
                setError(data.message || 'Failed to post reply');
            }
        } catch (err) {
            console.error('Reply error:', err);
            setError('Network error while posting reply');
        }
    };

    if (!user) {
        return <div className="forum-page"><p>Loading...</p></div>;
    }

    return (
        <>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="forum-page">
                <div className="forum-shell">
                    <header className="forum-hero">
                        <div>
                            <p className="forum-kicker">Community Space</p>
                            <h1>Discussion Forum</h1>
                            <p>Ask questions, share takes, and talk movies with other MovieHive users.</p>
                        </div>
                    </header>

                    {error ? <div className="forum-banner error">{error}</div> : null}
                    {message ? <div className="forum-banner success">{message}</div> : null}

                    <div className="forum-grid">
                        <aside className="forum-sidebar">
                            <h2>Categories</h2>
                            <div className="category-list">
                                {categories.map((category) => (
                                    <button
                                        key={category.category_id}
                                        className={`category-card ${selectedCategoryId === category.category_id ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedThread(null);
                                            setReplies([]);
                                            setSelectedCategoryId(category.category_id);
                                        }}
                                    >
                                        <strong>{category.category_name}</strong>
                                        <span>{category.thread_count || 0} threads</span>
                                        <small>{category.description}</small>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <main className="forum-main">
                            <section className="forum-panel">
                                <div className="panel-header">
                                    <div>
                                        <h2>{selectedCategory?.category_name || 'Threads'}</h2>
                                        <p>{selectedCategory?.description || 'Select a category to browse discussions.'}</p>
                                    </div>
                                </div>

                                <form className="thread-form" onSubmit={handleCreateThread}>
                                    <h3>Start a Thread</h3>
                                    <input
                                        value={newThreadTitle}
                                        onChange={(e) => setNewThreadTitle(e.target.value)}
                                        placeholder="Thread title"
                                    />
                                    <textarea
                                        value={newThreadBody}
                                        onChange={(e) => setNewThreadBody(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        rows={4}
                                    />
                                    <button type="submit">Post Thread</button>
                                </form>

                                <div className="thread-list">
                                    {threadsLoading ? <div className="empty-state">Loading threads...</div> : null}
                                    {!threadsLoading && threads.length === 0 ? (
                                        <div className="empty-state">No threads yet in this category.</div>
                                    ) : null}

                                    {threads.map((thread) => (
                                        <button
                                            key={thread.thread_id}
                                            className={`thread-card ${selectedThread?.thread_id === thread.thread_id ? 'active' : ''}`}
                                            onClick={() => setSelectedThread(thread)}
                                        >
                                            <div className="thread-meta">
                                                <span>{thread.author_name}</span>
                                                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h4>{thread.title}</h4>
                                            <p>{thread.body}</p>
                                            <div className="thread-footer">
                                                <span>{thread.category_name}</span>
                                                <span>{thread.reply_count || 0} replies</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="forum-panel detail-panel">
                                {!selectedThread ? (
                                    <div className="empty-detail">Select a thread to read and reply.</div>
                                ) : threadLoading ? (
                                    <div className="empty-detail">Loading thread...</div>
                                ) : (
                                    <>
                                        <div className="detail-header">
                                            <p>{selectedThread.category_name}</p>
                                            <h2>{selectedThread.title}</h2>
                                            <div className="thread-meta">
                                                <span>By {selectedThread.author_name}</span>
                                                <span>{new Date(selectedThread.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <article className="thread-body">
                                            {selectedThread.body}
                                        </article>

                                        <section className="replies-section">
                                            <h3>Replies ({replies.length})</h3>
                                            <div className="replies-list">
                                                {replies.length === 0 ? (
                                                    <div className="empty-state">No replies yet. Be the first to respond.</div>
                                                ) : replies.map((reply) => (
                                                    <div key={reply.reply_id} className="reply-card">
                                                        <div className="thread-meta">
                                                            <span>{reply.author_name}</span>
                                                            <span>{new Date(reply.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p>{reply.body}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        <form className="reply-form" onSubmit={handleReply}>
                                            <h3>Write a Reply</h3>
                                            <textarea
                                                value={replyBody}
                                                onChange={(e) => setReplyBody(e.target.value)}
                                                placeholder="Add your response..."
                                                rows={4}
                                            />
                                            <button type="submit">Reply</button>
                                        </form>
                                    </>
                                )}
                            </section>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}