import React, { useEffect, useState, useCallback } from 'react';

export default function AdminForumManagement({ adminUser, onClose }) {
  const adminId = adminUser?.user_id ?? adminUser?.id ?? null;
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3001/api/forum/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setSelectedCategoryId((prev) => prev || (data.categories?.[0]?.category_id ?? null));
      } else {
        setError(data.message || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Network error while loading categories');
    }
  }, []);

  const loadThreads = useCallback(async (categoryId) => {
    if (!categoryId) {
      setThreads([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/forum/threads?categoryId=${categoryId}`);
      const data = await res.json();
      if (data.success) {
        setThreads(data.threads || []);
      } else {
        setError(data.message || 'Failed to load threads');
      }
    } catch (err) {
      console.error('Error loading threads:', err);
      setError('Network error while loading threads');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadThreadDetails = useCallback(async (threadId) => {
    if (!threadId) {
      setSelectedThread(null);
      setReplies([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/forum/threads/${threadId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedThread(data.thread || null);
        setReplies(data.replies || []);
      } else {
        setError(data.message || 'Failed to load thread');
      }
    } catch (err) {
      console.error('Error loading thread details:', err);
      setError('Network error while loading thread');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategoryId) loadThreads(selectedCategoryId);
  }, [selectedCategoryId, loadThreads]);

  const handleDeleteThread = async (threadId) => {
    if (!adminId) return setError('Admin identification missing');
    if (!window.confirm('Delete this thread and all replies?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/forums/threads/${threadId}?adminUserId=${adminId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Thread deleted');
        setSelectedThread(null);
        setReplies([]);
        await loadThreads(selectedCategoryId);
      } else {
        setError(data.message || 'Failed to delete thread');
      }
    } catch (err) {
      console.error('Error deleting thread:', err);
      setError('Network error while deleting thread');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!adminId) return setError('Admin identification missing');
    if (!window.confirm('Delete this reply?')) return;
    try {
      const res = await fetch(`http://localhost:3001/api/admin/forums/replies/${replyId}?adminUserId=${adminId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Reply deleted');
        if (selectedThread?.thread_id) await loadThreadDetails(selectedThread.thread_id);
        await loadThreads(selectedCategoryId);
      } else {
        setError(data.message || 'Failed to delete reply');
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
      setError('Network error while deleting reply');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-60" onClick={onClose} />
      <div className="relative max-w-4xl w-full p-6 rounded-lg" style={{background: '#1d1f2b', border: '1px solid #3b3c45'}}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{color: '#f4d320', fontWeight: 800}}>Forums Administration</h3>
          <button onClick={onClose} style={{color: '#c7c7cc'}}>Close</button>
        </div>

        <div style={{display: 'flex', gap: 12}}>
          <div style={{width: 320}}>
            <h4 style={{color: '#f4d320'}}>Categories</h4>
            <div style={{marginTop: 8}}>
              {categories.map((c) => (
                <button key={c.category_id} onClick={() => { setSelectedCategoryId(c.category_id); setSelectedThread(null); setReplies([]); }} className={`w-full text-left mb-2 p-3 rounded ${selectedCategoryId === c.category_id ? 'border' : ''}`} style={{background: 'rgba(255,255,255,0.02)', border: selectedCategoryId === c.category_id ? '1px solid #f4d320' : '1px solid transparent'}}>
                  <strong style={{color: '#f4f4f4'}}>{c.category_name}</strong>
                  <div style={{color: '#afafba', fontSize: 12}}>{c.thread_count || 0} threads</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h4 style={{color: '#f4d320'}}>Threads</h4>
              <div style={{color: '#9fb'}}> {loading ? 'Loading...' : ''}</div>
            </div>

            <div style={{marginTop: 8, display: 'flex', gap: 12}}>
              <div style={{flex: 1, maxHeight: 360, overflowY: 'auto'}}>
                {threads.map((t) => (
                  <div key={t.thread_id} className="p-3 mb-2" style={{background: selectedThread?.thread_id === t.thread_id ? 'rgba(244,211,32,0.06)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.02)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <div onClick={() => loadThreadDetails(t.thread_id)} style={{cursor: 'pointer'}}>
                        <strong style={{color: '#f4f4f4'}}>{t.title}</strong>
                        <div style={{color: '#afafba', fontSize: 12}}>{t.author_name} · {new Date(t.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <button onClick={() => handleDeleteThread(t.thread_id)} style={{color: '#ff6b6b', background: 'transparent', border: 'none'}}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{flex: 1, maxHeight: 360, overflowY: 'auto'}}>
                <h5 style={{color: '#f4d320'}}>Thread Detail</h5>
                {selectedThread ? (
                  <div>
                    <div style={{padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.02)'}}>
                      <h4 style={{color: '#f4f4f4'}}>{selectedThread.title}</h4>
                      <p style={{color: '#afafba'}}>{selectedThread.body}</p>
                      <div style={{marginTop: 8}}>
                        <button onClick={() => handleDeleteThread(selectedThread.thread_id)} style={{color: '#ff6b6b', background: 'transparent', border: 'none'}}>Delete Thread</button>
                      </div>
                    </div>

                    <div style={{marginTop: 12}}>
                      <h5 style={{color: '#f4d320'}}>Replies</h5>
                      {replies.map((r) => (
                        <div key={r.reply_id} style={{padding: 10, marginTop: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.02)'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div>
                              <strong style={{color: '#f4f4f4'}}>{r.author_name}</strong>
                              <div style={{color: '#afafba', fontSize: 12}}>{new Date(r.created_at).toLocaleString()}</div>
                            </div>
                            <div>
                              <button onClick={() => handleDeleteReply(r.reply_id)} style={{color: '#ff6b6b', background: 'transparent', border: 'none'}}>Delete</button>
                            </div>
                          </div>
                          <p style={{color: '#ddd', marginTop: 8}}>{r.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#afafba'}}>Select a thread to view details and replies.</div>
                )}
              </div>
            </div>

            {message && <div style={{marginTop: 12, color: '#9ff0af'}}>{message}</div>}
            {error && <div style={{marginTop: 12, color: '#ffb3ba'}}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
