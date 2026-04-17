import { useState, useRef, useEffect } from 'react';
import {
  X, Save, Info, Plus, HelpCircle,
  Image as ImageIcon, Video, FileArchive,
} from 'lucide-react';
import { authStore }    from '../../store/authStore.js';
import { requestStore } from '../../store/requestStore.js';
import { departStore } from '../../store/departmentStore.js';

import { toast }        from '../../shared/toast';

const QUALITY_OPTIONS = [
  { value: 'qc_max',  label: 'QC MAX',       diem: 17 },
  { value: 'qc_cao',  label: 'QC Cao',        diem: 14 },
  { value: 'qc_tb',   label: 'QC Trung bình', diem: 11 },
  { value: 'qc_thap', label: 'QC Thấp',       diem: 8  },
];

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Khẩn cấp' },
  { value: 'high',   label: 'Cao' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'low',    label: 'Thấp' },
];

const PRODUCT_TYPES = [
  { value: 'image',    label: 'Hình ảnh',   icon: <ImageIcon   size={13} /> },
  { value: 'video',    label: 'Video',      icon: <Video       size={13} /> },
  { value: 'resource', label: 'Tài nguyên', icon: <FileArchive size={13} /> },
];

function FieldRow({ label, required, children }) {
  return (
    <div className="field-row" style={{
      display: 'grid',
      gridTemplateColumns: '150px 1fr',
      gap: '6px 20px',
      padding: '13px 0',
      borderBottom: '1px solid var(--border)',
      alignItems: 'flex-start',
    }}>
      <div style={{ paddingTop: 3, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}>
      <HelpCircle size={13} color="var(--text-muted)" style={{ cursor: 'pointer' }}
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && (
        <span style={{
          position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', border: '1px solid var(--border)', borderRadius: 6,
          padding: '6px 10px', fontSize: 11, color: '#cbd5e1',
          whiteSpace: 'nowrap', zIndex: 100, boxShadow: 'var(--shadow-md)',
        }}>{text}</span>
      )}
    </span>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <span onClick={onChange} style={{
      width: 16, height: 16, borderRadius: 3, flexShrink: 0,
      background: checked ? '#3b82f6' : 'transparent',
      border: `2px solid ${checked ? '#3b82f6' : 'var(--text-muted)'}`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', transition: 'all 0.15s',
    }}>
      {checked && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
    </span>
  );
}

export default function CreateRequestModal({ open, onClose, onCreated }) {
  const { user }          = authStore();
  const { createRequest } = requestStore();   // bỏ isLoading, error, clearError không dùng
  const { getAlldepartments } = departStore();
  

  const fileInputRef = useRef();

  const [saving,      setSaving]      = useState(false);
  const [errors,      setErrors]      = useState({});
  const [qualityOpen, setQualityOpen] = useState(false);
  const [dragOver,    setDragOver]    = useState(false);
  const [images,      setImages]      = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [depRes, roleRes] = await Promise.all([
         getAlldepartments(),
         //getAllRoles()
      ]);

      setDepartments(depRes.data.data);
      //setRoles(roleRes.data.data);
    };

    fetchData();
  }, []);
  const [form, setForm] = useState({
    code: '', productTypes: [], videoQuality: '',
    priority: '', deadline: '', quantity: 1,
    splitByImage: false, notes: '', department: '',
  });

  const generateCode = () => {
    const now  = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `REQ-${date}-${time}-${rand}`;
  };

  useEffect(() => {
    if (open) {
      setForm({ code: generateCode(), productTypes: [], videoQuality: '', priority: '', deadline: '', quantity: 1, splitByImage: false, notes: '' });
      setImages([]); setErrors({}); setSaving(false);
    }
  }, [open]);

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

  const allSelected = PRODUCT_TYPES.every(t => form.productTypes.includes(t.value));
  const hasVideo    = form.productTypes.includes('video');

  const handleFiles = (files) => {
    const newImgs = Array.from(files).map(f => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(f),
      name: f.name,
      file: f,
    }));
    setImages(prev => [...prev, ...newImgs]);
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim())              e.code         = 'Vui lòng nhập mã';
    if (form.productTypes.length === 0) e.productTypes = 'Chọn ít nhất 1 loại';
    if (!form.priority)                 e.priority     = 'Vui lòng chọn mức ưu tiên';
    if (!form.deadline)                 e.deadline     = 'Vui lòng chọn thời hạn';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;   // không cần setSaving trước validate

    setSaving(true);
    try {
      const data = {
        ...form,
        createdBy: user.name,
        status:    'pending',
        title:     `Yêu cầu ${form.code}`,
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      images.forEach(img => formData.append('images', img.file));

      const newReq = await createRequest(formData);

      if (!newReq.success) {
        toast.error(newReq.message || 'Tạo yêu cầu thất bại');
      }

      toast.success('Tạo đơn hàng thành công!');
      onClose();
      onCreated?.(newReq)
    }  finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }} />

      <div className="create-modal" style={{
        position: 'fixed', zIndex: 301,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 640,
        maxHeight: '90dvh',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        animation: 'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
      }}>
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
              Thêm Mới Đơn Hàng
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Người tạo: <span style={{ color: 'var(--accent)' }}>{user?.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-input)', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-dim)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 24px' }}>
          <form id="create-request-form" onSubmit={handleSubmit}>

            <FieldRow label="Mã" required>
              <div>
                <input className="form-input" style={{ maxWidth: 240 }} value={form.code} onChange={e => set('code', e.target.value)} disabled />
                {errors.code && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {errors.code}</div>}
              </div>
            </FieldRow>

            <FieldRow label="Sản phẩm yêu cầu" required>
              <div>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', userSelect: 'none' }}>
                    <Checkbox checked={allSelected} onChange={() => toggleType('all')} />
                    Tất cả
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

            {hasVideo && (
              <FieldRow label="Video">
                <div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--info-dim)', border: '1px solid rgba(59,130,246,0.25)',
                    borderRadius: 8, padding: '8px 12px', marginBottom: 10,
                    fontSize: 12, color: 'var(--info)',
                  }}>
                    <Info size={13} style={{ flexShrink: 0 }} />
                    Không bắt buộc chọn &quot;Chất lượng&quot;
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Chất lượng</div>
                  <div style={{ position: 'relative', maxWidth: 380 }}>
                    <div
                      onClick={() => setQualityOpen(!qualityOpen)}
                      style={{
                        background: 'var(--bg-input)', border: `1px solid ${qualityOpen ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: qualityOpen ? '8px 8px 0 0' : 8,
                        padding: '9px 14px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: 13, color: form.videoQuality ? 'var(--text-primary)' : 'var(--text-muted)',
                        boxShadow: qualityOpen ? '0 0 0 3px var(--accent-dim)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{QUALITY_OPTIONS.find(q => q.value === form.videoQuality)?.label || 'QC Cao'}</span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: qualityOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', opacity: 0.5 }}>
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {qualityOpen && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                        background: 'var(--bg-card)', border: '1px solid var(--accent)',
                        borderTop: 'none', borderRadius: '0 0 8px 8px',
                        overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
                      }}>
                        {QUALITY_OPTIONS.map((q, i) => (
                          <div
                            key={q.value}
                            onClick={() => { set('videoQuality', q.value); setQualityOpen(false); }}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '11px 14px', cursor: 'pointer',
                              borderBottom: i < QUALITY_OPTIONS.length - 1 ? '1px solid var(--border)' : 'none',
                              background: form.videoQuality === q.value ? 'var(--accent-dim)' : 'transparent',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => { if (form.videoQuality !== q.value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            onMouseLeave={e => { if (form.videoQuality !== q.value) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span style={{ fontSize: 13, fontWeight: form.videoQuality === q.value ? 700 : 400, color: form.videoQuality === q.value ? 'var(--accent)' : 'var(--text-primary)' }}>
                              {q.label}
                            </span>
                            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                              Điểm: <strong style={{ color: 'var(--text-secondary)' }}>{q.diem}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </FieldRow>
            )}

            <FieldRow label="Mức độ ưu tiên" required>
              <div>
                <select className="form-select" style={{ maxWidth: 240 }} value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="">-- Chọn --</option>
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {errors.priority && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {errors.priority}</div>}
              </div>
            </FieldRow>

            <FieldRow label="Phòng ban" required>
              <div>
                <select
                  className="form-select"
                  style={{ maxWidth: 240 }}
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                >
                  <option value="">-- Chọn phòng ban --</option>
                  {departments.map(d => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>

                {errors.department && (
                  <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>
                    ⚠ {errors.department}
                  </div>
                )}
              </div>
            </FieldRow>

            <FieldRow label="Thời hạn" required>
              <div>
                <input className="form-input" type="date" style={{ maxWidth: 260 }} value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                {errors.deadline && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {errors.deadline}</div>}
              </div>
            </FieldRow>

            <FieldRow label="Số lượng đơn tạo" required>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {['-', null, '+'].map((btn, i) => btn === null ? (
                  <input
                    key="inp"
                    className="form-input"
                    type="number" min="1"
                    style={{ width: 72, textAlign: 'center' }}
                    value={form.quantity}
                    onChange={e => set('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                ) : (
                  <button
                    key={btn} type="button"
                    onClick={() => set('quantity', btn === '-' ? Math.max(1, form.quantity - 1) : form.quantity + 1)}
                    style={{
                      width: 30, height: 30, borderRadius: 6,
                      border: '1px solid var(--border)', background: 'var(--bg-input)',
                      color: 'var(--text-primary)', cursor: 'pointer', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  >{btn}</button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Hình minh họa">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {images.map(img => (
                  <div key={img.id} style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button" onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))}
                      style={{
                        position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(0,0,0,0.75)', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                      }}
                    ><X size={10} /></button>
                  </div>
                ))}
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 72, height: 72, borderRadius: 8, flexShrink: 0,
                    border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                    background: dragOver ? 'var(--accent-dim)' : 'var(--bg-input)',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 4, color: dragOver ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
                >
                  <Plus size={20} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>Tải lên</span>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)} />
                </div>
              </div>
            </FieldRow>

            <FieldRow label="Lựa chọn thêm">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                <Checkbox checked={form.splitByImage} onChange={() => set('splitByImage', !form.splitByImage)} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Mỗi hình minh họa sẽ tạo ra 1 đơn hàng riêng
                </span>
                <Tooltip text="Mỗi ảnh upload sẽ tạo thành 1 đơn hàng độc lập" />
              </label>
            </FieldRow>

            <FieldRow label="Ghi chú">
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Ghi chú hoặc yêu cầu đặc biệt..."
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                style={{ minHeight: 72 }}
              />
            </FieldRow>

          </form>
        </div>

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          flexShrink: 0, background: 'var(--bg-card)',
        }}>
          <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
          <button
            type="submit"
            form="create-request-form"
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: 148, justifyContent: 'center' }}
          >
            {saving ? (
              <><span style={{ width: 14, height: 14, marginRight: 8, border: '2px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />Đang tạo...</>
            ) : (
              <><Save size={15} /> Tạo Đơn Hàng</>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes modalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @media (max-width: 640px) {
          .create-modal {
            top: auto !important; bottom: 0 !important; left: 0 !important;
            transform: none !important; width: 100% !important; max-width: 100% !important;
            max-height: 92dvh !important; border-radius: 20px 20px 0 0 !important;
            animation: slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) !important;
          }
          @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          .field-row { grid-template-columns: 1fr !important; gap: 4px !important; }
          .field-row > div:first-child { padding-top: 0 !important; padding-bottom: 2px; }
        }
        @media (max-width: 768px) and (min-width: 641px) {
          .create-modal { width: calc(100% - 48px) !important; }
        }
      `}</style>
    </>
  );
}