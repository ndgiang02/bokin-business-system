import { useState, useRef, useEffect } from 'react';
import {
  X, Save, Info, Plus, HelpCircle, CheckCircle,
  Image as ImageIcon, Video, FileArchive, Music,
  FileText, File, Loader2, AlertCircle, Trash2
} from 'lucide-react';
import { authStore }     from '../../store/authStore.js';
import { requestStore } from '../../store/requestStore.js';

// ── Constants ─────────────────────────────────────────────
const QUALITY_OPTIONS = [
  { value: 'qc_max',  label: 'QC MAX',        diem: 17 },
  { value: 'qc_cao',  label: 'QC Cao',         diem: 14 },
  { value: 'qc_tb',   label: 'QC Trung bình',  diem: 11 },
  { value: 'qc_thap', label: 'QC Thấp',        diem: 8  },
];

const PRIORITY_OPTIONS = [
  { value: '',       label: '-- Chọn mức ưu tiên --' },
  { value: 'urgent', label: 'Khẩn cấp' },
  { value: 'high',   label: 'Cao' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'low',    label: 'Thấp' },
];

const PRODUCT_TYPES = [
  { value: 'image',    label: 'Hình ảnh',   icon: <ImageIcon  size={13} /> },
  { value: 'video',    label: 'Video',      icon: <Video      size={13} /> },
  { value: 'resource', label: 'Tài nguyên', icon: <FileArchive size={13} /> },
];

// ── File type helpers ─────────────────────────────────────
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
  if (mimeType.startsWith('image/'))  return <ImageIcon  size={18} color="#2563eb" />;
  if (mimeType.startsWith('video/'))  return <Video      size={18} color="#7c3aed" />;
  if (mimeType.startsWith('audio/'))  return <Music      size={18} color="#0891b2" />;
  if (mimeType.includes('pdf'))       return <FileText   size={18} color="#dc2626" />;
  if (mimeType.includes('word') || mimeType.includes('doc')) return <FileText size={18} color="#2563eb" />;
  if (mimeType.includes('excel') || mimeType.includes('sheet')) return <FileText size={18} color="#059669" />;
  return <File size={18} color="#94a3b8" />;
}

function formatBytes(b) {
  if (b < 1024)        return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024*1024)).toFixed(1)} MB`;
}

// ── Sub-components ────────────────────────────────────────
function Checkbox({ checked, onChange }) {
  return (
    <span onClick={onChange} style={{
      width: 16, height: 16, borderRadius: 3, flexShrink: 0,
      background: checked ? '#3b82f6' : 'transparent',
      border: `2px solid ${checked ? '#3b82f6' : 'var(--text-muted)'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {checked && <span style={{ color: '#fff', fontSize: 10 }}>✓</span>}
    </span>
  );
}

function FieldRow({ label, required, children }) {
  return (
    <div className="field-row" style={{
      display: 'grid', gridTemplateColumns: '150px 1fr',
      gap: '6px 20px', padding: '13px 0',
      borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
    }}>
      <div style={{ paddingTop: 3, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function FileItem({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', borderRadius: 8,
      background: 'var(--bg-input)', border: '1px solid var(--border)',
      transition: 'all 0.15s',
    }}>
      {/* Preview hoặc icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isImage
          ? <img src={file.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : getFileIcon(file.type)
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatBytes(file.size)}</div>
      </div>
      <button type="button" onClick={() => onRemove(file.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2, borderRadius: 4 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────
export default function CreateRequestModal({ open, onClose, onCreated }) {
  const { user }      = authStore();
  const { createRequest } = requestStore();
  const fileInputRef  = useRef();

  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [errors,      setErrors]      = useState({});
  const [qualityOpen, setQualityOpen] = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [files,       setFiles]       = useState([]);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [uploadError, setUploadError] = useState('');

  const generateCode = () => {
    const now  = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `REQ-${date}-${time}-${rand}`;
  };

  const [form, setForm] = useState({
    code: '', productTypes: [], videoQuality: '',
    priority: '', deadline: '', quantity: 1,
    splitByImage: false, notes: '',
  });

  useEffect(() => {
    if (open) {
      setForm({ code: generateCode(), productTypes: [], videoQuality: '', priority: '', deadline: '', quantity: 1, splitByImage: false, notes: '' });
      setFiles([]); setErrors({}); setSaved(false); setSaving(false);
      setUploadPct(0); setUploadError('');
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const toggleType = (val) => {
    if (val === 'all') {
      const allSel = PRODUCT_TYPES.every(t => form.productTypes.includes(t.value));
      set('productTypes', allSel ? [] : PRODUCT_TYPES.map(t => t.value));
      return;
    }
    const cur = form.productTypes;
    set('productTypes', cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };

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
    setUploadError('');
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim())               e.code         = 'Vui lòng nhập mã';
    if (form.productTypes.length === 0)  e.productTypes = 'Chọn ít nhất 1 loại';
    if (!form.priority)                  e.priority     = 'Vui lòng chọn mức ưu tiên';
    if (!form.deadline)                  e.deadline     = 'Vui lòng chọn thời hạn';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // validate form
  if (!validate()) return;

  setSaving(true);
  setUploadError('');
  setUploadPct(0);

  try {
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === 'productTypes') {
        fd.append(key, value.join(',')); // array  string
      } else {
        fd.append(key, value ?? '');
      }
    });

    // createdBy
    fd.append('createdById', user?.id || 1);
    fd.append('createdByName', user?.name || 'Nhân viên');

    // append files
    if (files.length > 0) {
      files.forEach(({ file }) => {
        fd.append('files', file);
      });
    }

    // call API (có progress)
    const data = await createRequest(fd, (pct) => {
      setUploadPct(pct);
    });

    // success
    setSaved(true);
    onCreated?.(data);

    // auto close modal
    setTimeout(() => {
      onClose();
    }, 1200);

  } catch (err) {
    // handle error chuẩn
    const message =
      err?.response?.data?.error ||
      err?.message ||
      'Upload thất bại';

    setUploadError(message);
  } finally {
    setSaving(false);
  }
};

 

  const allSelected = PRODUCT_TYPES.every(t => form.productTypes.includes(t.value));
  const hasVideo    = form.productTypes.includes('video');

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }} />

      <div className="create-modal" style={{
        position: 'fixed', zIndex: 301,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: 800, maxHeight: '90dvh',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 16, display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
        animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>Thêm Mới Yêu Cầu</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Người tạo: <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-dim)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          ><X size={16} /></button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 22px' }}>
          {saved ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 14 }}>
              <div style={{ width: 60, height: 60, background: 'var(--success-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={30} color="var(--success)" />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>Tạo yêu cầu thành công!</div>
            </div>
          ) : (
            <form id="create-request-form" onSubmit={handleSubmit}>

              {/* Mã */}
              <FieldRow label="Mã" required>
                <div>
                  <input className="form-input" style={{ maxWidth: 180 }} placeholder="VD: A488" value={form.code} onChange={e => set('code', e.target.value)} />
                  {errors.code && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {errors.code}</div>}
                </div>
              </FieldRow>

              {/* Sản phẩm */}
              <FieldRow label="Sản phẩm yêu cầu" required>
                <div>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', userSelect: 'none' }}>
                      <Checkbox checked={allSelected} onChange={() => toggleType('all')} /> Tất cả
                    </label>
                    {PRODUCT_TYPES.map(pt => (
                      <label key={pt.value} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', userSelect: 'none' }}>
                        <Checkbox checked={form.productTypes.includes(pt.value)} onChange={() => toggleType(pt.value)} />
                        {pt.icon} {pt.label}
                      </label>
                    ))}
                  </div>
                  {errors.productTypes && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5 }}>⚠ {errors.productTypes}</div>}
                </div>
              </FieldRow>

              {/* Video quality */}
              {hasVideo && (
                <FieldRow label="Video">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--info-dim)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: 'var(--info)' }}>
                      <Info size={13} style={{ flexShrink: 0 }} /> Không bắt buộc chọn "Chất lượng"
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Chất lượng</div>
                    <div style={{ position: 'relative', maxWidth: 360 }}>
                      <div onClick={() => setQualityOpen(!qualityOpen)} style={{ background: 'var(--bg-input)', border: `1px solid ${qualityOpen ? 'var(--accent)' : 'var(--border)'}`, borderRadius: qualityOpen ? '8px 8px 0 0' : 8, padding: '9px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: form.videoQuality ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        <span>{QUALITY_OPTIONS.find(q => q.value === form.videoQuality)?.label || 'QC Cao'}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: qualityOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }}>
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {qualityOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg-card)', border: '1px solid var(--accent)', borderTop: 'none', borderRadius: '0 0 8px 8px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
                          {QUALITY_OPTIONS.map((q, i) => (
                            <div key={q.value} onClick={() => { set('videoQuality', q.value); setQualityOpen(false); }}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', cursor: 'pointer', borderBottom: i < QUALITY_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none', background: form.videoQuality === q.value ? 'var(--accent-dim)' : 'transparent' }}
                              onMouseEnter={e => { if (form.videoQuality !== q.value) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                              onMouseLeave={e => { if (form.videoQuality !== q.value) e.currentTarget.style.background = 'transparent'; }}
                            >
                              <span style={{ fontSize: 13, fontWeight: form.videoQuality === q.value ? 700 : 400, color: form.videoQuality === q.value ? 'var(--accent)' : 'var(--text-primary)' }}>{q.label}</span>
                              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Điểm: <strong>{q.diem}</strong></span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </FieldRow>
              )}

              {/* Ưu tiên */}
              <FieldRow label="Mức độ ưu tiên" required>
                <div>
                  <select className="form-select" style={{ maxWidth: 240 }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                    {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  {errors.priority && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {errors.priority}</div>}
                </div>
              </FieldRow>

              {/* Thời hạn */}
              <FieldRow label="Thời hạn" required>
                <div>
                  <input className="form-input" type="datetime-local" style={{ maxWidth: 260 }} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                  {errors.deadline && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {errors.deadline}</div>}
                </div>
              </FieldRow>

              {/* Số lượng */}
              <FieldRow label="Số lượng đơn" required>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {['-', null, '+'].map((btn, i) => btn === null ? (
                    <input key="inp" className="form-input" type="number" min="1" style={{ width: 72, textAlign: 'center' }} value={form.quantity} onChange={e => set('quantity', Math.max(1, parseInt(e.target.value) || 1))} />
                  ) : (
                    <button key={btn} type="button" onClick={() => set('quantity', btn === '-' ? Math.max(1, form.quantity - 1) : form.quantity + 1)}
                      style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    >{btn}</button>
                  ))}
                </div>
              </FieldRow>

              {/* File đính kèm */}
              <FieldRow label="File đính kèm">
                <div>
                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 10, padding: '20px 16px', cursor: 'pointer',
                      background: dragOver ? 'var(--accent-dim)' : 'var(--bg-input)',
                      transition: 'all 0.2s', textAlign: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                    onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-input)'; } }}
                  >
                    <Plus size={20} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                      Kéo thả hoặc click để chọn file
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Ảnh, Video (mp4), Audio (wav/mp3), PDF, Word, Excel
                    </div>
                    <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_TYPES} style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {files.map(f => <FileItem key={f.id} file={f} onRemove={removeFile} />)}
                    </div>
                  )}
                </div>
              </FieldRow>

              {/* Lựa chọn thêm */}
              <FieldRow label="Lựa chọn thêm">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <Checkbox checked={form.splitByImage} onChange={() => set('splitByImage', !form.splitByImage)} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mỗi hình minh họa tạo ra 1 đơn riêng</span>
                </label>
              </FieldRow>

              {/* Ghi chú */}
              <FieldRow label="Ghi chú">
                <textarea className="form-textarea" rows={3} placeholder="Ghi chú hoặc yêu cầu đặc biệt..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ minHeight: 72 }} />
              </FieldRow>

              {/* Upload error */}
              {uploadError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', padding: '10px 14px', background: 'var(--danger-dim)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--danger)' }}>
                  <AlertCircle size={14} /> {uploadError}
                </div>
              )}

            </form>
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 22px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            {/* Progress bar */}
            {saving && uploadPct > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Đang upload...</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{uploadPct}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadPct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
              <button type="submit" form="create-request-form" className="btn btn-primary" disabled={saving} style={{ minWidth: 148, justifyContent: 'center' }}>
                {saving
                  ? <><Loader2 size={14} style={{ marginRight: 8, animation: 'spin 0.8s linear infinite' }} />Đang tạo...</>
                  : <><Save size={15} /> Tạo yêu cầu</>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @media (max-width: 640px) {
          .create-modal { top: auto !important; bottom: 0 !important; left: 0 !important; transform: none !important; width: 100% !important; max-width: 100% !important; max-height: 92dvh !important; border-radius: 20px 20px 0 0 !important; }
          .field-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        }
      `}</style>
    </>
  );
}