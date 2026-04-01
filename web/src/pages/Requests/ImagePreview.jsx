import {  Download } from 'lucide-react';


export default function ImagePreview({ url, name, onClose }) {
  if (!url) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <img
        src={url} alt={name}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '80vh',
          borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          display: 'block',
        }}
      />
      <div style={{ display: 'flex', gap: 10 }} onClick={e => e.stopPropagation()}>
        <a
          href={url} download={name}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8,
            background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
        
        <Download size={14} /> Tải về
        </a>
        <button
          onClick={onClose}
          style={{
            padding: '8px 18px', borderRadius: 8,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}