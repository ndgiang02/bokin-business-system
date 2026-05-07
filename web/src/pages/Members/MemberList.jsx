import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Trash2, Edit, Shield, Phone, Mail, Building2, Calendar, ChevronDown } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { userStore } from '../../store/userStore.js';
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from '../../utils/roleUtils.js';
import { toast } from '../../shared/toast/useToast.js';
import { CreateMember } from './CreateMember.jsx';

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [loading, setLoading] = useState(true);
  const { user } = authStore();
  const { getAllUser, deleteUser } = userStore();
  const navigate = useNavigate();
  const canManage = hasPermission(user?.role, 'manage_members');

  useEffect(() => {
    getAllUser().then(d => { setMembers(d); setFiltered(d); setLoading(false); });
  }, []);

  useEffect(() => {
    let res = members;
    if (search) res = res.filter(m =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department?.toLowerCase().includes(search.toLowerCase())
    );
    if (roleFilter !== 'all') res = res.filter(m => m.role === roleFilter);
    setFiltered(res);
  }, [search, roleFilter, members]);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa thành viên này?')) {
      return;
    }

  const success = await deleteUser(id);

  if (success) {
    setMembers(prev => prev.filter(m => m.id !== id));
  } else {
    toast.error("Xóa thất bại");
  }
  };

  const roles = [...new Set(members.map(m => m.role))];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Thành Viên</h1>
          <p className="page-subtitle">Quản lý tài khoản và phân quyền hệ thống • {members.length} thành viên</p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/members/create')}
          >
            <UserPlus size={16} /> Thêm Thành Viên
          </button>
        )}
      </div>

      {/* Role stats bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div
          onClick={() => setRoleFilter('all')}
          style={{
            padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
            fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            background: roleFilter === 'all' ? 'var(--accent)' : 'var(--bg-card)',
            color: roleFilter === 'all' ? '#000' : 'var(--text-muted)',
            border: `1px solid ${roleFilter === 'all' ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          Tất cả
          <span style={{
            background: roleFilter === 'all' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.07)',
            borderRadius: 20, padding: '0 7px', fontSize: 11, fontFamily: 'var(--font-display)',
          }}>{members.length}</span>
        </div>
        {roles.map(r => (
          <div
            key={r}
            onClick={() => setRoleFilter(roleFilter === r ? 'all' : r)}
            style={{
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
              fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              background: roleFilter === r ? `${ROLE_COLORS[r]}22` : 'var(--bg-card)',
              color: roleFilter === r ? ROLE_COLORS[r] : 'var(--text-muted)',
              border: `1px solid ${roleFilter === r ? ROLE_COLORS[r] + '66' : 'var(--border)'}`,
            }}
          >
            <Shield size={11} />
            {ROLE_LABELS[r]}
            <span style={{
              background: `${ROLE_COLORS[r]}22`, color: ROLE_COLORS[r],
              borderRadius: 20, padding: '0 7px', fontSize: 11, fontFamily: 'var(--font-display)',
            }}>{members.filter(m => m.role === r).length}</span>
          </div>
        ))}
      </div>

      {/* Search + view toggle */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Tìm theo tên, email, phòng ban..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
          {['grid', 'table'].map(m => (
            <button key={m} onClick={() => setViewMode(m)} style={{
              padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 500, transition: 'all 0.15s',
              background: viewMode === m ? 'var(--accent)' : 'transparent',
              color: viewMode === m ? '#000' : 'var(--text-muted)',
            }}>
              {m === 'grid' ? '⊞ Lưới' : '☰ Bảng'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⟳</div>Đang tải...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
          Không tìm thấy thành viên nào
        </div>
      ) : viewMode === 'grid' ? (
        /* === GRID VIEW === */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {filtered.map((member, i) => (
            <div
              key={member.id}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 14, overflow: 'hidden',
                transition: 'all 0.2s', cursor: 'default',
                animation: `fadeInUp 0.35s ease ${i * 50}ms both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = ROLE_COLORS[member.role];
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px ${ROLE_COLORS[member.role]}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Color top bar */}
              <div style={{ height: 4, background: ROLE_COLORS[member.role], opacity: 0.7 }} />

              <div style={{ padding: '18px 20px' }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, flexShrink: 0,
                    background: `${ROLE_COLORS[member.role]}20`,
                    border: `2px solid ${ROLE_COLORS[member.role]}50`,
                    borderRadius: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                    color: ROLE_COLORS[member.role],
                  }}>
                    {member.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {member.name}
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: `${ROLE_COLORS[member.role]}15`,
                      color: ROLE_COLORS[member.role],
                      border: `1px solid ${ROLE_COLORS[member.role]}30`,
                      borderRadius: 20, padding: '2px 9px',
                      fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-display)',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      <Shield size={9} />
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  {/* Online dot */}
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: i % 3 === 0 ? '#94a3b8' : 'var(--success)',
                    boxShadow: i % 3 === 0 ? 'none' : '0 0 8px var(--success)',
                    flexShrink: 0,
                  }} title={i % 3 === 0 ? 'Offline' : 'Online'} />
                </div>

                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                  {[
                    { icon: <Mail size={12} />, val: member.email },
                    { icon: <Phone size={12} />, val: member.phone },
                    { icon: <Building2 size={12} />, val: member.department },
                    { icon: <Calendar size={12} />, val: `Gia nhập: ${new Date(member.created_at).toLocaleDateString('vi-VN')}` },
                  ].map((row, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{row.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {canManage && (
                  <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => navigate(`/members/edit/${member.id}`)}>
                      <Edit size={12} /> Sửa
                    </button>
                    {member.id !== 1 && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 5 }}
                        onClick={() => handleDelete(member.id)}
                      >
                        <Trash2 size={12} /> Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* === TABLE VIEW === */
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Thành Viên', 'Vai Trò', 'Phòng Ban', 'Email', 'Điện Thoại', 'Gia Nhập', canManage ? 'Thao Tác' : ''].filter(Boolean).map(col => (
                    <th key={col} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px',
                      borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-display)',
                      whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, i) => (
                  <tr
                    key={member.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                          background: `${ROLE_COLORS[member.role]}20`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 12,
                          color: ROLE_COLORS[member.role],
                        }}>{member.avatar}</div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: `${ROLE_COLORS[member.role]}15`, color: ROLE_COLORS[member.role],
                        border: `1px solid ${ROLE_COLORS[member.role]}30`,
                        borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700,
                        fontFamily: 'var(--font-display)', display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}>
                        <Shield size={9} />{ROLE_LABELS[member.role]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{member.department}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: 12 }}>{member.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: 12 }}>{member.phone}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: 12 }}>{new Date(member.created_at).toLocaleDateString('vi-VN')}</td>
                    {canManage && (
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm btn-icon" title="Sửa"><Edit size={13} /></button>
                          {member.id !== 1 && (
                            <button className="btn btn-danger btn-sm btn-icon" title="Xóa" onClick={() => handleDelete(member.id)}><Trash2 size={13} /></button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {members.length} thành viên
          </div>
        </div>
      )}
    </div>
  );
}