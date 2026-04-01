import { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { createRevision } from '../../api/requestApi.js';

export default function RevisionModal({ request, open, onClose, onRevised }) {
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  if (!open || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) { setError('Vui lòng nhập lý do'); return; }
    setSaving(true); setError('');
    try {
      await createRevision(request.id, comment);
      onRevised?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />

      <div style={{
        position: 'fixed', zIndex: 401,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: 480,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--warning-dim)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--warning-dim)', border: '1px solid rgba(217,119,6,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={18} color="var(--warning)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              Yêu Cầu Làm Lại
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {request.code} — {request.title}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Nhập lý do chưa hài lòng. Yêu cầu sẽ được chuyển về trạng thái <strong>Đang xử lý</strong> để làm lại.
          </div>

          <textarea
            className="form-textarea"
            rows={4}
            placeholder="VD: Màu sắc chưa đúng theo yêu cầu, cần chỉnh lại phần..."
            value={comment}
            onChange={e => { setComment(e.target.value); setError(''); }}
            style={{ minHeight: 100 }}
            autoFocus
          />

          {error && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>⚠ {error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" disabled={saving} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: 'var(--warning)', color: '#fff',
              fontWeight: 600, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}>
              {saving
                ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> Đang gửi...</>
                : <><Send size={14} /> Gửi Yêu Cầu Làm Lại</>
              }
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -46%) scale(0.95); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}