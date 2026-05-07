import React, { useEffect, useState } from 'react';

export default function ShareModal({
  open,
  title = 'Share List',
  message,
  defaultEmail = '',
  onConfirm,
  onCancel,
  confirmLabel = 'Share',
  cancelLabel = 'Cancel'
}) {
  const [email, setEmail] = useState(defaultEmail);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail || '');
    }
  }, [open, defaultEmail]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(String(email).trim());
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <form onSubmit={handleSubmit} style={{ background: '#1f2028', padding: 20, borderRadius: 8, width: 440, color: '#f4f4f4', boxShadow: '0 6px 24px rgba(0,0,0,0.6)' }}>
        {title ? <h3 style={{ marginTop: 0, color: '#ffd56d' }}>{title}</h3> : null}
        {message ? <div style={{ margin: '12px 0', color: '#e6e6e6' }}>{message}</div> : null}
        <label style={{ display: 'block', marginBottom: 8, color: '#afafba' }}>Collaborator email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          autoFocus
          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, marginBottom: 16, background: '#ececec', color: '#262626' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, background: '#6b2f2f', color: '#fff' }}>{cancelLabel}</button>
          <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, background: '#f4d320', color: '#262626', fontWeight: 600 }}>{confirmLabel}</button>
        </div>
      </form>
    </div>
  );
}
