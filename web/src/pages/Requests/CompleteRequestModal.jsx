import { useState, useRef } from 'react';
import {
  X, CheckCircle, Loader2, Plus,
  Image as ImageIcon, Video, Music,
  FileText, File, AlertCircle
} from 'lucide-react';

const ACCEPTED_TYPES = [
  'image/jpeg','image/png','image/webp','image/gif',
  'video/mp4','video/quicktime',
  'audio/wav','audio/mpeg','audio/mp3',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',');

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/'))  return <ImageIcon size={18} color="#2563eb" />;
  if (mimeType?.startsWith('video/'))  return <Video     size={18} color="#7c3aed" />;
  if (mimeType?.startsWith('audio/'))  return <Music     size={18} color="#0891b2" />;
  if (mimeType?.includes('pdf'))       return <FileText  size={18} color="#dc2626" />;
  if (mimeType?.includes('word') || mimeType?.includes('doc')) return <FileText size={18} color="#2563eb" />;
  if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return <FileText size={18} color="#059669" />;
  return <File size={18} color="#94a3b8" />;
}

function formatBytes(b) {
  if (!b) return '';
  if (b < 1024)         return `${b} B`;
  if (b < 1024 * 1024)  return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FileItem({ file, onRemove }) {
  const isImage = file.type?.startsWith('image/');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: 'var(--bg-input)', border: '1px solid var(--border)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 6, overflow: 'hidden',
        flexShrink: 0, background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isImage
          ? <img src={file.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : getFileIcon(file.type)
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatBytes(file.size)}</div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(file.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={14} />
      </button>
    </div>
  );
}

/**
 * Props:
 *   request    – object yêu cầu hiện tại
 *   open       – boolean
 *   onClose    – () => void
 *   onCompleted – (formData: FormData) => Promise<void>   ← nhận FormData, trả về Promise
 */
export default function CompleteRequestModal({ request, open, onClose, onCompleted }) {
  const fileInputRef = useRef();

  const [notes,     setNotes]     = useState('');
  const [files,     setFiles]     = useState([]);
  const [dragOver,  setDragOver]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error,     setError]     = useState('');

  if (!open || !request) return null;

  // ── helpers ──────────────────────────────────────────────
  const addFiles = (newFiles) => {
    const items = Array.from(newFiles).map(f => ({
      id:      crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      file:    f,
      name:    f.name,
      size:    f.size,
      type:    f.type,
      preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...items]);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const handleClose = () => {
    // revoke tất cả preview URL trước khi đóng
    files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
    setNotes('');
    setError('');
    setUploadPct(0);
    onClose();
  };

  // ── submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setUploadPct(0);

    try {
      const fd = new FormData();
      fd.append('status', 'done');
      fd.append('notes',  notes.trim());
      files.forEach(({ file }) => fd.append('files', file));

      // onCompleted nhận FormData + callback tiến trình (tuỳ chọn)
      await onCompleted(fd, (pct) => setUploadPct(pct));

      handleClose();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  // ── drag-and-drop ─────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  // ── render ────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card, #1e1e2e)',
            border: '1px solid var(--border, #2d2d3d)',
            borderRadius: 16, padding: 0,
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            animation: 'modalIn 0.22s ease',
            display: 'flex', flexDirection: 'column',
            maxHeight: '90vh', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px 14px',
            borderBottom: '1px solid var(--border, #2d2d3d)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(16,185,129,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle size={17} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
                  Hoàn thành yêu cầu
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', fontFamily: 'var(--font-mono)' }}>
                  {request.code}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              style={{
                width: 30, height: 30, borderRadius: 7,
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Notes */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 6 }}>
                Ghi chú kết quả
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Mô tả công việc đã thực hiện, kết quả đạt được..."
                rows={4}
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg-input, #161622)',
                  color: 'var(--text-primary)', fontSize: 13,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {/* File upload area */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 6 }}>
                Tệp đính kèm <span style={{ fontWeight: 400, textTransform: 'none' }}>(tuỳ chọn)</span>
              </label>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? '#6366f1' : 'var(--border)'}`,
                  borderRadius: 10, padding: '20px 16px',
                  textAlign: 'center', cursor: 'pointer',
                  background: dragOver ? 'rgba(99,102,241,0.06)' : 'var(--bg-input)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { if (!dragOver) e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onMouseLeave={e => { if (!dragOver) e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <Plus size={20} color="var(--text-muted)" style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Kéo thả hoặc <span style={{ color: '#6366f1', fontWeight: 600 }}>chọn tệp</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, opacity: 0.7 }}>
                  Ảnh, video, audio, PDF, Word, Excel
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_TYPES}
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {files.map(f => (
                  <FileItem key={f.id} file={f} onRemove={removeFile} />
                ))}
              </div>
            )}

            {/* Upload progress */}
            {saving && uploadPct > 0 && uploadPct < 100 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Đang tải lên...</span>
                  <span>{uploadPct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadPct}%`, background: '#10b981', borderRadius: 4, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', borderRadius: 8,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                fontSize: 12, color: '#ef4444',
              }}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            {/* Footer actions */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  border: '1px solid var(--border)', background: 'transparent',
                  color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
                }}
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 2, padding: '10px 0', borderRadius: 10,
                  border: 'none', background: saving ? '#059669' : '#10b981',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#059669'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#10b981'; }}
              >
                {saving
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</>
                  : <><CheckCircle size={14} /> Xác nhận hoàn thành</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}