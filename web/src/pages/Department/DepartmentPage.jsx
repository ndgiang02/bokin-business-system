import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Users, FileText, X, Save } from 'lucide-react';
import { depApi } from "../../api/departmentApi";


// ── Modal tạo / sửa phòng ban ─────────────────────────────
function DepartmentModal({ dept, open, onClose, onSaved }) {
  const isEdit = !!dept;
  const [saving, setSaving] = useState(false);
  const [form,   setForm]   = useState({ name: '', code: '' });
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: dept?.name || '', code: dept?.code || '' });
      setError('');
    }
  }, [open, dept]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Vui lòng nhập tên phòng ban'); return; }
    setSaving(true); setError('');
    try {
      if (isEdit) {
        await depApi.updateDepartment(dept.id, form);
      } else {
        await depApi.createDepartment(form);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease' }} />
      <div style={{
        position: 'fixed', zIndex: 301,
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: 440,
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
        animation: 'modalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
            {isEdit ? 'Chỉnh Sửa Phòng Ban' : 'Thêm Phòng Ban'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label">Tên Phòng Ban *</label>
            <input
              className="form-input"
              placeholder="VD: Phòng Kinh Doanh"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mã Phòng Ban</label>
            <input
              className="form-input"
              placeholder="VD: KD, SX, MKT..."
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              maxLength={20}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Mã ngắn, viết hoa, không dấu. Dùng để phân biệt phòng ban.
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: 'var(--danger)', padding: '8px 12px', background: 'var(--danger-dim)', borderRadius: 6, marginBottom: 12 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 120, justifyContent: 'center' }}>
              {saving
                ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                : <><Save size={14} /> {isEdit ? 'Lưu' : 'Tạo'}</>
              }
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { opacity: 0; transform: translate(-50%,-46%) scale(0.95); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editDept,    setEditDept]    = useState(null);

  const fetchDepartments = () => {
    setLoading(true);
    depApi.getAlldepartments()
      .then(res => setDepartments(res.data?.data || res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleEdit = (dept) => { setEditDept(dept); setShowModal(true); };
  const handleAdd  = ()     => { setEditDept(null); setShowModal(true); };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Xóa phòng ban "${dept.name}"?`)) return;
    try {
      await depApi.deleteDepartment(dept.id);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Phòng Ban</h1>
          <p className="page-subtitle">Quản lý cơ cấu tổ chức · {departments.length} phòng ban</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} /> Thêm Phòng Ban
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
      ) : departments.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <Building2 size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Chưa có phòng ban nào</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleAdd}>
            <Plus size={15} /> Tạo phòng ban đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {departments.map((dept, i) => (
            <div key={dept.id} className="card" style={{
              animation: `fadeInUp 0.35s ease ${i * 60}ms both`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Top */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'var(--accent-dim)', border: '1px solid rgba(37,99,235,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={20} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    {dept.name}
                  </div>
                  {dept.code && (
                    <span style={{
                      display: 'inline-block', marginTop: 3,
                      background: 'var(--accent-dim)', color: 'var(--accent)',
                      border: '1px solid rgba(37,99,235,0.2)',
                      borderRadius: 4, padding: '1px 7px',
                      fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
                    }}>
                      {dept.code}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{dept.userCount || 0}</strong> thành viên</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <FileText size={14} color="var(--text-muted)" />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{dept._count?.fromRequests || 0}</strong> yêu cầu</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }}
                  onClick={() => handleEdit(dept)}
                >
                  <Edit2 size={13} /> Chỉnh sửa
                </button>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => handleDelete(dept)}
                  title="Xóa phòng ban"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <DepartmentModal
        dept={editDept}
        open={showModal}
        onClose={() => { setShowModal(false); setEditDept(null); }}
        onSaved={fetchDepartments}
      />
    </div>
  );
}