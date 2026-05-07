import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'OK', cancelLabel = 'Cancel' }) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <div style={{ background: '#1f2028', padding: 20, borderRadius: 8, width: 420, color: '#f4f4f4', boxShadow: '0 6px 24px rgba(0,0,0,0.6)' }}>
        {title ? <h3 style={{ marginTop: 0, color: '#ffd56d' }}>{title}</h3> : null}
        <div style={{ margin: '12px 0', color: '#e6e6e6' }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, background: '#6b2f2f', color: '#fff' }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ padding: '8px 12px', borderRadius: 6, background: '#f4d320', color: '#262626', fontWeight: 600 }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
