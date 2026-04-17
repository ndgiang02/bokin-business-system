import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Search, Eye, Trash2, RefreshCw, SlidersHorizontal } from 'lucide-react';
import CreateRequestModal from './CreatRquestModal.jsx';
import { authStore } from '../../store/authStore.js';
import { userStore } from '../../store/userStore.js';
import { requestStore } from '../../store/requestStore.js';
import { hasPermission } from '../../utils/roleUtils.js';
import RequestDetail from './RequestDetail';

const STATUS_MAP = {
  pending:     { label: 'Chờ Duyệt',    class: 'badge-pending' },
  assigned:    { label: 'Chờ Phân Công',    class: 'badge-assigned' },
  done:    { label: 'Đã xử lý',     class: 'badge-approved' },
  cancelled:    { label: 'Từ Chối',       class: 'badge-rejected' },
  processing: { label: 'Đang Xử Lý',   class: 'badge-in_progress' },
};
const PRIORITY_MAP = {
  high:   { label: 'Cao',        class: 'badge-high' },
  medium: { label: 'Trung bình', class: 'badge-medium' },
  low:    { label: 'Thấp',       class: 'badge-low' },
};


export default function RequestList() {
    
  const [requests, setRequests]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [priorityFilter, setPriority] = useState('all');
  const [sortBy, setSortBy]       = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  
  const { user } = authStore();
  const { getAllRequets } = requestStore();
  const { getAllUser } = userStore();

  const navigate = useNavigate();
  const canCreate = hasPermission(user?.role, 'create_request');


  const fetchRequests = () => {
    const filters = {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      search: search || undefined,
    };

    const pagination = { page: 1, limit: 20 };

    setLoading(true);

    getAllRequets(filters, pagination)
      .then(res => {
        const data = res?.data?.data?.items || [];
        setRequests(data);
      })
      .finally(() => setLoading(false));
  };


  useEffect(() => {
    getAllUser().then(r => { setUsers(r);});
  }, []);  

  useEffect(() => {
   fetchRequests();
  }, [search, statusFilter, priorityFilter]);

  const userMap = useMemo(() => {
    return Object.fromEntries(users?.map(u => [u.id, u.name]));
  }, [users]);

  useEffect(() => {
    let res = [...requests];

    if (sortBy === 'newest') res.sort((a, b) => b.id - a.id);
    if (sortBy === 'amount') res.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'deadline') res.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    setFiltered(res);
  }, [sortBy, requests]);

  const statCards = [
    { label: 'Tất cả',       count: requests.length,                                   color: 'var(--text-secondary)', key: 'all' },
    { label: 'Chờ phân công',    count: requests.filter(r => r.status === 'pending').length,     color: 'var(--warning)',       key: 'pending' },
    { label: 'Đang xử lý',   count: requests.filter(r => r.status === 'processing').length, color: 'var(--info)',          key: 'processing' },
    { label: 'Đã xử lý',     count: requests.filter(r => r.status === 'done').length,    color: 'var(--success)',       key: 'done' },
    { label: 'Hủy',       count: requests.filter(r => r.status === 'cancelled').length,   color: 'var(--danger)',        key: 'cancelled' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Yêu Cầu</h1>
          {/*<p className="page-subtitle">Quản lý và theo dõi yêu cầu từ khách hàng</p>*/}
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FilePlus size={16} /> Tạo Yêu Cầu
          </button>
        )}
      </div>

      {/* Stat cards — clickable filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCards.map(s => (
          <div
            key={s.key}
            onClick={() => setStatus(statusFilter === s.key ? 'all' : s.key)}
            style={{
              background: statusFilter === s.key ? `${s.color}18` : 'var(--bg-card)',
              border: `1px solid ${statusFilter === s.key ? s.color + '60' : 'var(--border)'}`,
              borderRadius: 10, padding: '10px 16px',
              cursor: 'pointer', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.count}
            </span>
            <span style={{ fontSize: 12, color: statusFilter === s.key ? s.color : 'var(--text-muted)', fontWeight: 500 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Tìm mã Yêu cầu"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-outline"
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: showFilters ? 'var(--accent)' : undefined, borderColor: showFilters ? 'var(--accent)' : undefined }}
        >
          <SlidersHorizontal size={14} /> Bộ lọc
          {(statusFilter !== 'all' || priorityFilter !== 'all') && (
            <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
          )}
        </button>
        <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="deadline">Deadline gần nhất</option>
        </select>
        {(search || statusFilter !== 'all' || priorityFilter !== 'all') && (
          <button className="btn btn-outline" onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); }}>
            <RefreshCw size={13} /> Reset
          </button>
        )}
      </div>

      {/* Expandable extra filters */}
      {showFilters && (
        <div style={{
          display: 'flex', gap: 12, padding: '14px 16px', marginBottom: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, flexWrap: 'wrap', animation: 'fadeInUp 0.2s ease',
        }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Trạng thái</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'pending', 'processing', 'done', 'cancelled'].map(s => (
                <button key={s} onClick={() => setStatus(s)} style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                  background: statusFilter === s ? 'var(--accent-dim)' : 'transparent',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {s === 'all' ? 'Tất cả' : STATUS_MAP[s].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Ưu tiên</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setPriority(p)} style={{
                  padding: '4px 12px', borderRadius: 6, border: '1px solid',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: priorityFilter === p ? 'var(--accent)' : 'var(--border)',
                  background: priorityFilter === p ? 'var(--accent-dim)' : 'transparent',
                  color: priorityFilter === p ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {p === 'all' ? 'Tất cả' : PRIORITY_MAP[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> yêu cầu
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
            Không có yêu cầu nào phù hợp
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Mã YC', 'Ngày Tạo', 'Ưu Tiên', 'Trạng Thái', 'Hạn bàn giao', 'Người Tạo','Người thực hiện', 'Bộ phận tiếp nhận'].map(col => (
                    <th key={col} style={{
                      padding: '10px 16px', textAlign: 'left', fontSize: 10,
                      fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '1px', borderBottom: '1px solid var(--border)',
                      fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s', animation: `fadeInUp 0.3s ease ${i * 40}ms both` }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>{r.code}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span className={`badge ${PRIORITY_MAP[r.priority]?.class}`}>{PRIORITY_MAP[r.priority]?.label}</span>
                    </td>
                      <td style={{ padding: '13px 16px' }}>
                      <span className={`badge ${STATUS_MAP[r.status]?.class}`}>{STATUS_MAP[r.status]?.label}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(r.deadline).toLocaleDateString('vi-VN')}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.created_by_name}</td>
                    {/*{userMap[r.assigned_to] || '—'}*/}
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>  {userMap[r.assigned_to] || '—'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>  {r.department_assigned_name || '—'}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          title="Xem chi tiết"
                          onClick={() => setSelected(r.id)}
                        ><Eye size={13} /></button>
                        {canCreate && (
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            title="Xóa"
                            onClick={() => setRequests(prev => prev.filter(x => x.id !== r.id))}
                          ><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { fetchRequests()   }}
      />

      {/* Detail modal */}
       {selected && (
        <RequestDetail
          selected={selected}
          onClose={() => {setSelected(null); fetchRequests();}}
          PRIORITY_MAP={PRIORITY_MAP}
          STATUS_MAP={STATUS_MAP}
        />
      )}
    
    
    </div>
  );
}