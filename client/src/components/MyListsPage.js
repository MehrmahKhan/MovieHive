import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from './BackButton';
import Navbar from './Navbar';
import ConfirmModal from './ConfirmModal';
import ShareModal from './ShareModal';

export default function MyListsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [message, setMessage] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, collectionId: null });
    const [shareModal, setShareModal] = useState({ open: false, collection: null });
    const [collaborators, setCollaborators] = useState([]);

    const loadCollections = useCallback(async (userId) => {
        const res = await fetch(`http://localhost:3001/api/collections/user/${userId}`);
        const data = await res.json();
        if (data.success) {
            setCollections(data.collections || []);
            if (data.collections && data.collections.length > 0) {
                setSelectedCollection((prev) => prev || data.collections[0]);
            }
        }
    }, []);

    const loadCollectionMovies = useCallback(async (collectionId, userId) => {
        const res = await fetch(`http://localhost:3001/api/collections/${collectionId}/movies?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
            setMovies(data.movies || []);
        } else {
            setMovies([]);
            setMessage(data.message || 'Failed to load list movies');
        }
    }, []);

    const loadCollaborators = useCallback(async (collectionId, userId) => {
        if (!collectionId || !userId) {
            setCollaborators([]);
            return;
        }

        const res = await fetch(`http://localhost:3001/api/collections/${collectionId}/collaborators?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
            setCollaborators(data.collaborators || []);
        } else {
            setCollaborators([]);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const stored = localStorage.getItem('user');
                if (!stored) {
                    navigate('/');
                    return;
                }
                const parsed = JSON.parse(stored);
                setUser(parsed);
                await loadCollections(parsed.id);
            } catch (_err) {
                setMessage('Failed to load your lists');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [navigate, loadCollections]);

    useEffect(() => {
        const run = async () => {
            if (!selectedCollection || !user?.id) return;
            await loadCollectionMovies(selectedCollection.collection_id, user.id);
            if (selectedCollection.is_owner) {
                await loadCollaborators(selectedCollection.collection_id, user.id);
            } else {
                setCollaborators([]);
            }
        };
        run();
    }, [selectedCollection, user, loadCollectionMovies, loadCollaborators]);

    const createCollection = async (e) => {
        e.preventDefault();
        if (!user?.id || !newCollectionName.trim()) return;
        setMessage('');

        const res = await fetch('http://localhost:3001/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, collectionName: newCollectionName.trim() })
        });
        const data = await res.json();
        if (data.success) {
            setNewCollectionName('');
            await loadCollections(user.id);
            setMessage('List created');
        } else {
            setMessage(data.message || 'Failed to create list');
        }
    };

    const confirmDeleteCollection = async (collectionId) => {
        if (!user?.id) return;
        const res = await fetch(`http://localhost:3001/api/collections/${collectionId}?userId=${user.id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            if (selectedCollection && selectedCollection.collection_id === collectionId) {
                setSelectedCollection(null);
                setMovies([]);
            }
            await loadCollections(user.id);
            setMessage('List deleted');
        } else {
            setMessage(data.message || 'Failed to delete list');
        }
    };

    const deleteCollection = (collectionId) => {
        setDeleteModal({ open: true, collectionId });
    };

    const handleCancelDelete = () => setDeleteModal({ open: false, collectionId: null });
    const handleConfirmDelete = async () => {
        const id = deleteModal.collectionId;
        setDeleteModal({ open: false, collectionId: null });
        if (id) await confirmDeleteCollection(id);
    };

    const removeMovie = async (collectionId, movieId) => {
        if (!user?.id) return;
        const res = await fetch(`http://localhost:3001/api/collections/${collectionId}/movies/${movieId}?userId=${user.id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            setMovies((prev) => prev.filter((m) => m.movie_id !== movieId));
        } else {
            setMessage(data.message || 'Failed to remove movie');
        }
    };

    const openShareModal = (collection) => {
        setShareModal({ open: true, collection });
    };

    const handleCancelShare = () => setShareModal({ open: false, collection: null });

    const handleConfirmShare = async (email) => {
        const collection = shareModal.collection;
        setShareModal({ open: false, collection: null });
        if (!user?.id || !collection?.collection_id || !email) {
            setMessage('Valid email is required');
            return;
        }

        const res = await fetch(`http://localhost:3001/api/collections/${collection.collection_id}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, email })
        });
        const data = await res.json();
        if (data.success) {
            setMessage(`Shared with ${data.collaborator?.email || email}`);
            await loadCollaborators(collection.collection_id, user.id);
        } else {
            setMessage(data.message || 'Failed to share list');
        }
    };

    const removeCollaborator = async (shareId) => {
        if (!user?.id || !selectedCollection?.collection_id || !shareId) return;
        const res = await fetch(`http://localhost:3001/api/collections/${selectedCollection.collection_id}/shares/${shareId}?userId=${user.id}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            setCollaborators((prev) => prev.filter((item) => item.share_id !== shareId));
        } else {
            setMessage(data.message || 'Failed to remove collaborator');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return <div style={{ padding: 24, color: '#f4f4f4' }}>Loading your lists...</div>;
    }

    if (!user) {
        return <div style={{ padding: 24, color: '#f4f4f4' }}>Loading...</div>;
    }

    return (
        <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #1f2132 0%, #595574 100%)' }}>
            <div style={{ padding: 20 }}>
                <BackButton label={'Back to Movies'} sticky={false} />
            </div>

            <div className="max-w-7xl mx-auto px-8 py-4">
                <h1 className="text-3xl font-light mb-4" style={{ color: '#f4d320' }}>My Lists</h1>

                <form onSubmit={createCollection} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <input
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Create new list (e.g. Weekend Picks)"
                        style={{ flex: 1, padding: '10px 12px', borderRadius: 6, background: '#ececec', color: '#262626' }}
                    />
                    <button type="submit" style={{ padding: '10px 14px', borderRadius: 6, background: '#f4d320', color: '#262626', fontWeight: 600 }}>
                        Create
                    </button>
                </form>

                {message ? <div style={{ color: '#ffd56d', marginBottom: 14 }}>{message}</div> : null}

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
                    <div style={{ background: 'rgba(29,31,43,0.6)', border: '1px solid #3b3c45', borderRadius: 8, padding: 12 }}>
                        <h3 style={{ marginBottom: 10, color: '#f4f4f4' }}>Your and Shared Lists</h3>
                        {collections.length === 0 ? (
                            <div style={{ color: '#afafba' }}>No lists yet.</div>
                        ) : (
                            collections.map((c) => (
                                <div key={c.collection_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 6px', borderRadius: 6, background: selectedCollection?.collection_id === c.collection_id ? 'rgba(244,211,32,0.12)' : 'transparent' }}>
                                    <button onClick={() => setSelectedCollection(c)} style={{ textAlign: 'left', color: '#f4f4f4', flex: 1 }}>
                                        {c.collection_name} <span style={{ color: '#afafba' }}>({c.movie_count})</span>
                                        <div style={{ color: '#afafba', fontSize: 12 }}>
                                            {c.is_owner ? 'Owner' : `Shared by ${c.owner_name || 'another user'}`}
                                        </div>
                                    </button>
                                    {c.is_owner ? <button onClick={() => deleteCollection(c.collection_id)} style={{ color: '#ffb4b4' }}>x</button> : null}
                                </div>
                            ))
                        )}
                    </div>

                    <div style={{ background: 'rgba(29,31,43,0.6)', border: '1px solid #3b3c45', borderRadius: 8, padding: 12 }}>
                        <h3 style={{ marginBottom: 10, color: '#f4f4f4' }}>
                            {selectedCollection ? selectedCollection.collection_name : 'Select a list'}
                        </h3>
                        {selectedCollection?.is_owner ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <button onClick={() => openShareModal(selectedCollection)} style={{ padding: '6px 10px', borderRadius: 6, background: '#f4d320', color: '#262626', fontWeight: 600 }}>
                                    Share List
                                </button>
                                <span style={{ color: '#afafba', fontSize: 13 }}>
                                    {collaborators.length === 0 ? 'No collaborators yet' : `${collaborators.length} collaborator(s)`}
                                </span>
                            </div>
                        ) : null}
                        {selectedCollection?.is_owner && collaborators.length > 0 ? (
                            <div style={{ marginBottom: 14, border: '1px solid #3b3c45', borderRadius: 6, padding: 8 }}>
                                {collaborators.map((col) => (
                                    <div key={col.share_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                                        <div style={{ color: '#e6e6e6', fontSize: 13 }}>{col.name} ({col.email})</div>
                                        <button onClick={() => removeCollaborator(col.share_id)} style={{ color: '#ffb4b4', fontSize: 13 }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {selectedCollection ? (
                            movies.length === 0 ? (
                                <div style={{ color: '#afafba' }}>No movies in this list yet.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {movies.map((m) => (
                                        <div key={m.movie_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #3b3c45', borderRadius: 6, padding: 10 }}>
                                            <button onClick={() => navigate(`/movie/${m.movie_id}`, { state: { from: 'lists' } })} style={{ color: '#f4f4f4', textAlign: 'left' }}>
                                                <strong>{m.title}</strong>
                                                <div style={{ color: '#afafba', fontSize: 13 }}>{m.release_year} · {m.duration_minutes} min</div>
                                            </button>
                                                <button onClick={() => removeMovie(selectedCollection.collection_id, m.movie_id)} style={{ color: '#ffb4b4' }}>Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div style={{ color: '#afafba' }}>Choose a list from the left.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <ConfirmModal
            open={deleteModal.open}
            title={'Delete List'}
            message={'Are you sure you want to delete this list? This action cannot be undone.'}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            confirmLabel={'Delete'}
            cancelLabel={'Cancel'}
        />
        <ShareModal
            open={shareModal.open}
            title={'Share This List'}
            message={'Enter the email of a registered user to give collaborator access.'}
            onConfirm={handleConfirmShare}
            onCancel={handleCancelShare}
            confirmLabel={'Share'}
            cancelLabel={'Cancel'}
        />
        </>
    );
}
