import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Search, Eye, Trash2, RefreshCw, SlidersHorizontal } from 'lucide-react';
import CreateRequestModal from './CreateRequest.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { hasPermission } from '../../utils/roleUtils.js';
import { requestApi } from '../../api/requestApi.js';

const STATUS_MAP = {
  pending:     { label: 'Chờ Duyệt',    class: 'badge-pending' },
  approved:    { label: 'Đã Duyệt',     class: 'badge-approved' },
  rejected:    { label: 'Từ Chối',       class: 'badge-rejected' },
  in_progress: { label: 'Đang Xử Lý',   class: 'badge-in_progress' },
};
const PRIORITY_MAP = {
  high:   { label: 'Cao',        class: 'badge-high' },
  medium: { label: 'Trung bình', class: 'badge-medium' },
  low:    { label: 'Thấp',       class: 'badge-low' },
};

function formatMoney(v) {
  if (!v) return '—';
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  return `${(v / 1_000_000).toFixed(0)}M`;
}

export default function RequestList() {
  const [requests, setRequests]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [priorityFilter, setPriority] = useState('all');
  const [sortBy, setSortBy]       = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null); // detail modal
  const [showModal, setShowModal] = useState(false); // create modal

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const canCreate = hasPermission(user?.role, 'create_request');

  useEffect(() => {
    requestApi.getAll().then(d => { setRequests(d); setFiltered(d); setLoading(false); });
  }, []);

  useEffect(() => {
    let res = [...requests];
    if (search) res = res.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all')   res = res.filter(r => r.status   === statusFilter);
    if (priorityFilter !== 'all') res = res.filter(r => r.priority === priorityFilter);
    if (sortBy === 'newest')   res.sort((a, b) => b.id - a.id);
    if (sortBy === 'amount')   res.sort((a, b) => b.amount - a.amount);
    if (sortBy === 'deadline') res.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setFiltered(res);
  }, [search, statusFilter, priorityFilter, sortBy, requests]);

  const statCards = [
    { label: 'Tất cả',       count: requests.length,                                   color: 'var(--text-secondary)', key: 'all' },
    { label: 'Chờ duyệt',    count: requests.filter(r => r.status === 'pending').length,     color: 'var(--warning)',       key: 'pending' },
    { label: 'Đang xử lý',   count: requests.filter(r => r.status === 'in_progress').length, color: 'var(--info)',          key: 'in_progress' },
    { label: 'Đã duyệt',     count: requests.filter(r => r.status === 'approved').length,    color: 'var(--success)',       key: 'approved' },
    { label: 'Từ chối',       count: requests.filter(r => r.status === 'rejected').length,   color: 'var(--danger)',        key: 'rejected' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Yêu Cầu</h1>
          <p className="page-subtitle">Quản lý và theo dõi yêu cầu từ khách hàng</p>
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
            placeholder="Tìm mã YC, tên, khách hàng..."
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
          <option value="amount">Giá trị cao nhất</option>
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
              {['all', 'pending', 'in_progress', 'approved', 'rejected'].map(s => (
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
                  {['Mã YC', 'Tiêu Đề', 'Khách Hàng', 'Giá Trị', 'Ưu Tiên', 'Trạng Thái', 'Deadline', 'Người Tạo', ''].map(col => (
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
                    <td style={{ padding: '13px 16px', maxWidth: 240 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                      {r.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.notes}</div>}
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.client}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)', fontWeight: 600 }}>{formatMoney(r.amount)}</span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span className={`badge ${PRIORITY_MAP[r.priority]?.class}`}>{PRIORITY_MAP[r.priority]?.label}</span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span className={`badge ${STATUS_MAP[r.status]?.class}`}>{STATUS_MAP[r.status]?.label}</span>
                    </td>
                    <td style={{ padding: '13px 16px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.deadline}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{r.createdBy}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          className="btn btn-outline btn-sm btn-icon"
                          title="Xem chi tiết"
                          onClick={() => setSelected(r)}
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
        onCreated={(newReq) => {
          setRequests(prev => [{ ...newReq, title: `Đơn ${newReq.code}`, client: '—', status: 'pending' }, ...prev]);
        }}
      />

      {/* Detail modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, animation: 'fadeInUp 0.25s ease' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>{selected.code}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{selected.title}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Khách hàng', value: selected.client },
                { label: 'Người tạo', value: selected.createdBy },
                { label: 'Giá trị', value: formatMoney(selected.amount) },
                { label: 'Số lượng', value: selected.quantity },
                { label: 'Ưu tiên', value: <span className={`badge ${PRIORITY_MAP[selected.priority]?.class}`}>{PRIORITY_MAP[selected.priority]?.label}</span> },
                { label: 'Trạng thái', value: <span className={`badge ${STATUS_MAP[selected.status]?.class}`}>{STATUS_MAP[selected.status]?.label}</span> },
                { label: 'Deadline', value: selected.deadline },
                { label: 'Ngày tạo', value: selected.createdAt },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}
            </div>
            {selected.notes && (
              <div style={{ marginTop: 12, background: 'var(--bg-input)', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Ghi chú</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.notes}</div>
              </div>
            )}
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}