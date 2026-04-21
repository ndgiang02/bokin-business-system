import { useState, useEffect } from 'react';
import { X, Search, UserCheck, Users, Check } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/roleUtils.js';
import { userStore }     from '../../store/userStore.js';
import { requestApi } from '../../api/requestApi.js';
import { toast } from '../../shared/toast/useToast.js';
import { requestStore } from '../../store/requestStore.js';


export default function AssignModal({ request, open, onClose, onAssigned }) {
  const [users,    setUsers]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { getUsersDepartment } = userStore();
  const { assignRequest } = requestStore();

  useEffect(() => {
    if (!open) return;
    getUsersDepartment(user?.departmentId).then(r => { setUsers(r);});
  }, [open, request]); 

  if (!open || !request) return null;

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await assignRequest(request.id, selected[0]);
      toast.success('Gán nhân viên thành công');
      onAssigned?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Gán nhân viên thất bại');
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
        maxHeight: '80dvh',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.22s ease-out',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--info-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={18} color="var(--info)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>Gán Nhân Viên</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{request.code} · Chọn nhân viên sản xuất</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" style={{ paddingLeft: 32, fontSize: 13 }} placeholder="Tìm nhân viên..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Selected count */}
        {selected.length > 0 && (
          <div style={{ padding: '8px 20px', background: 'var(--accent-dim)', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>
            <UserCheck size={12} style={{ marginRight: 6, display: 'inline' }} />
            Đã chọn {selected.length} nhân viên
          </div>
        )}

        {/* User list */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Không tìm thấy nhân viên</div>
          ) : (
            filtered.map(u => {
              const isSelected = selected.includes(u.id);
              const roleColor  = ROLE_COLORS[u.role] || '#94a3b8';
              return (
                <div
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-dim)' : 'transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${roleColor}20`, border: `2px solid ${roleColor}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                    color: roleColor,
                  }}>
                    {u.avatar || u.name?.charAt(0)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {ROLE_LABELS[u.role] || u.role}
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ flex: 2, justifyContent: 'center' }}
          >
            {saving
              ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block', marginRight: 8 }} />Đang lưu...</>
              : <><UserCheck size={14} /> Xác Nhận Gán ({selected.length})</>
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}