import React, { useState } from 'react';

export default function ListPickerModal({ open, collections = [], onCancel, onConfirm }) {
  const [selectedId, setSelectedId] = useState(null);
  const [newName, setNewName] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (selectedId) {
      const c = collections.find((x) => x.collection_id === selectedId);
      onConfirm({ type: 'existing', collection: c });
    } else if (newName && newName.trim()) {
      onConfirm({ type: 'create', name: newName.trim() });
    } else {
      // nothing selected
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <div style={{ background: '#1f2028', padding: 20, borderRadius: 8, width: 520, color: '#f4f4f4', boxShadow: '0 6px 24px rgba(0,0,0,0.6)' }}>
        <h3 style={{ marginTop: 0, color: '#ffd56d' }}>Add to List</h3>
        <div style={{ marginBottom: 8, color: '#e6e6e6' }}>Choose an existing list or enter a new list name.</div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#afafba', marginBottom: 6 }}>Existing lists</label>
            <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #333', borderRadius: 6, padding: 8 }}>
              {collections.length === 0 ? <div style={{ color: '#888' }}>No lists</div> : (
                collections.map((c) => (
                  <div key={c.collection_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px' }}>
                    <input type="radio" name="list" checked={selectedId === c.collection_id} onChange={() => setSelectedId(c.collection_id)} />
                    <div style={{ color: '#f4f4f4' }}>{c.collection_name} <span style={{ color: '#8f8f8f' }}>({c.movie_count})</span></div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ width: 1, background: '#2b2b35' }} />

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#afafba', marginBottom: 6 }}>New list</label>
            <input value={newName} onChange={(e) => { setNewName(e.target.value); setSelectedId(null); }} placeholder="New list name" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #333', background: '#0f1116', color: '#f4f4f4' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, background: '#6b2f2f', color: '#fff' }}>Cancel</button>
          <button onClick={handleConfirm} style={{ padding: '8px 12px', borderRadius: 6, background: '#f4d320', color: '#262626', fontWeight: 600 }}>Add</button>
        </div>
      </div>
    </div>
  );
}
