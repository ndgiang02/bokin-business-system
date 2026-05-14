import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Search, Eye, Trash2, RefreshCw, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateRequestModal from './CreateRequestModal.jsx';
import { authStore } from '../../store/authStore.js';
import { userStore } from '../../store/userStore.js';
import { requestStore } from '../../store/requestStore.js';
import { hasPermission, ROLES } from '../../utils/roleUtils.js';
import RequestDetail from './RequestDetail';

const STATUS_MAP = {
  pending:    { label: 'Chờ Duyệt',    class: 'badge-pending' },
  assigned:   { label: 'Chờ Phân Công', class: 'badge-assigned' },
  done:       { label: 'Đã xử lý',      class: 'badge-approved' },
  cancelled:  { label: 'Từ Chối',       class: 'badge-rejected' },
  processing: { label: 'Đang Xử Lý',   class: 'badge-in_progress' },
};
const PRIORITY_MAP = {
  urgent: { label: 'Khẩn cấp',   class: 'badge-urgent' },
  high:   { label: 'Cao',        class: 'badge-high' },
  medium: { label: 'Trung bình', class: 'badge-medium' },
  low:    { label: 'Thấp',       class: 'badge-low' },
};

const PAGE_SIZE = 20;

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
  const [users, setUsers]         = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  const { user }          = authStore();
  const { getAllRequets }  = requestStore();
  const { getAllUser }     = userStore();

  const navigate  = useNavigate();
  const canCreate = hasPermission(user?.role, 'create_request');
  const canManageTasks = hasPermission(user?.role, 'manage_tasks');


  // ── Fetch list ──────────────────────────────────────────
  const fetchRequests = () => {
    const filters = {
      status:   statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      search:   search || undefined,
      department: user?.role === ROLES.SUPER_ADMIN ? undefined : user?.department_id,
      user_id: user?.role === ROLES.NHAN_VIEN ? user?.id : undefined,    
    };
    const requestPagination = { page: currentPage, limit: PAGE_SIZE };

    setLoading(true);
    getAllRequets(filters, requestPagination)
      .then(res => {
        const responseData = res?.data?.data || {};
        const data = responseData.items || [];
        setRequests(data);
        setPagination({
          total: responseData.total || 0,
          page: responseData.page || currentPage,
          limit: responseData.limit || PAGE_SIZE,
          totalPages: Math.max(responseData.totalPages || 1, 1),
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getAllUser().then(r => { setUsers(r); });
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [search, statusFilter, priorityFilter, currentPage]);

  const paginationPages = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    const end = Math.min(totalPages, Math.max(5, currentPage + 2));
    const start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, pagination.totalPages]);

  const userMap = useMemo(
    () => Object.fromEntries(users?.map(u => [u.id, u.name])),
    [users],
  );

  useEffect(() => {
    let res = [...requests];
    if (sortBy === 'newest')  res.sort((a, b) => b.id - a.id);
    if (sortBy === 'amount')  res.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'deadline') res.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setFiltered(res);
  }, [sortBy, requests]);

  // ── Stat cards ──────────────────────────────────────────
  const statCards = [
    { label: 'Tất cả',        count: requests.length,                                       color: 'var(--text-secondary)', key: 'all' },
    { label: 'Chờ phân công', count: requests.filter(r => r.status === 'pending').length,    color: 'var(--warning)',        key: 'pending' },
    { label: 'Đang xử lý',   count: requests.filter(r => r.status === 'processing').length, color: 'var(--info)',           key: 'processing' },
    { label: 'Đã xử lý',     count: requests.filter(r => r.status === 'done').length,       color: 'var(--success)',        key: 'done' },
    { label: 'Hủy',          count: requests.filter(r => r.status === 'cancelled').length,  color: 'var(--danger)',         key: 'cancelled' },
  ];

  // ── Đóng detail và refresh list ─────────────────────────
  const handleCloseDetail = () => {
    setSelected(null);
    fetchRequests();
  };

  return (
    <div className="animate-fade-in">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Yêu Cầu</h1>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FilePlus size={16} /> Tạo Yêu Cầu
          </button>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {statCards.map(s => (
          <div
            key={s.key}
            onClick={() => { setCurrentPage(1); setStatus(statusFilter === s.key ? 'all' : s.key); }}
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
            onChange={e => { setCurrentPage(1); setSearch(e.target.value); }}
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
          <button className="btn btn-outline" onClick={() => { setCurrentPage(1); setSearch(''); setStatus('all'); setPriority('all'); }}>
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
                <button key={s} onClick={() => { setCurrentPage(1); setStatus(s); }} style={{
                  fontFamily: 'var(--font-display)',
                  padding: '4px 12px', borderRadius: 6, border: '1px solid',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: statusFilter === s ? 'var(--accent)' : 'var(--border)',
                  background: statusFilter === s ? 'var(--accent-dim)' : 'transparent',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {s === 'all' ? 'Tất cả' : STATUS_MAP[s]?.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Ưu tiên</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => { setCurrentPage(1); setPriority(p); }} style={{
                  fontFamily: 'var(--font-display)',
                  padding: '4px 12px', borderRadius: 6, border: '1px solid',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: priorityFilter === p ? 'var(--accent)' : 'var(--border)',
                  background: priorityFilter === p ? 'var(--accent-dim)' : 'transparent',
                  color: priorityFilter === p ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {p === 'all' ? 'Tất cả' : PRIORITY_MAP[p]?.label}
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
            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> / {pagination.total} yêu cầu
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
                  {['Mã YC', 'Ngày Tạo', 'Ưu Tiên', 'Trạng Thái', 'Hạn bàn giao', 'Người Tạo', 'Người thực hiện', 'Bộ phận tiếp nhận', ''].map(col => (
                    <th key={col} style={{
                      padding: '10px 16px', textAlign: 'left', fontSize: 10,
                      fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: '1px', borderBottom: '1px solid var(--border)',
                      fontFamily: 'var(--font-display)', whiteSpace: 'nowrap',
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
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{r.code}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span className={`badge ${PRIORITY_MAP[r.priority]?.class}`}>{PRIORITY_MAP[r.priority]?.label}</span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span className={`badge ${STATUS_MAP[r.status]?.class}`}>{STATUS_MAP[r.status]?.label}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.deadline).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.created_by_name}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{userMap[r.assigned_to] || '—'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.to_department_name || '—'}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          title="Xem chi tiết"
                          onClick={() => setSelected(r.id)}
                        >
                          <Eye size={13} />
                        </button>
                        {canManageTasks && (
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            title="Xóa"
                            onClick={() => setRequests(prev => prev.filter(x => x.id !== r.id))}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 12, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Trang <strong style={{ color: 'var(--text-primary)' }}>{pagination.page}</strong> / {pagination.totalPages}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage <= 1 || loading}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              {paginationPages.map(page => (
                <button
                  key={page}
                  className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}
                  disabled={loading}
                  onClick={() => setCurrentPage(page)}
                  style={{ minWidth: 34, justifyContent: 'center' }}
                >
                  {page}
                </button>
              ))}
              <button
                className="btn btn-outline btn-sm"
                disabled={currentPage >= pagination.totalPages || loading}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      <CreateRequestModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={() => { fetchRequests(); }}
      />

      {selected && (
        <RequestDetail
          selected={selected}
          onClose={handleCloseDetail}
          PRIORITY_MAP={PRIORITY_MAP}
          STATUS_MAP={STATUS_MAP}
        />
      )}
    </div>
  );
}