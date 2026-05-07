import { useEffect, useState, useRef } from 'react';
import { FileText, CheckSquare, Kanban, Users, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { authStore }                  from '../../store/authStore.js';
import { hasPermission, ROLE_LABELS } from '../../utils/roleUtils.js';
import { StatCard }                   from '../../components/ui/Card.jsx';
import { useDashboardStore }          from '../../store/dashboardStore.js';
import dayjs from 'dayjs';
import '../../css/dashboard.css';

const STATUS_LABELS = {
  pending:    'Chờ duyệt',
  processing: 'Đang xử lý',
  done:       'Đã xử lý',
  cancelled:  'Từ chối',
  assigned:   'Chờ phân công',
  revision:   'Làm lại',
  approved:   'Đã duyệt',
  rejected:   'Đã từ chối',
};

const STATUS_PIE_MAP = {
  pending:    { name: 'Chờ Duyệt',  color: '#f59e0b' },
  processing: { name: 'Đang Xử Lý', color: '#3b82f6'},
  done:       { name: 'Hoàn Thành', color: '#10b981'},
  revision:   { name: 'Làm Lại',    color: '#f97316' },
  approved:   { name: 'Đã Duyệt',   color: '#6366f1'},
  rejected:   { name: 'Từ Chối',    color: '#ef4444'},
  cancelled:  { name: 'Đã Huỷ',    color: '#6b7280'},
  assigned:  { name: 'Chờ Phân Công', color: '#2563eb'},
};

function toPieData(rawStats = []) {
  const merged = {};
  rawStats.forEach(({ status, count }) => {
    const map = STATUS_PIE_MAP[status] || { name: status, color: '#94a3b8' };
    if (merged[map.name]) {
      merged[map.name].value += count;
    } else {
      merged[map.name] = { name: map.name, value: count, color: map.color };
    }
  });
  return Object.values(merged);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8, marginBottom: 2 }}>
          <span>{p.name}:</span><strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

function Skeleton({ width = '100%', height = 20, radius = 6 }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-input) 50%, var(--bg-secondary) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}


export default function DashboardPage() {
  const { user } = authStore();
  const navigate = useNavigate();
  const role     = user?.role;
  const now = new Date();
  const defaultFrom = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  const defaultTo   = now.toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate]     = useState(defaultTo);

  //Store 
  const {
    stats, chart, activities, userTasks,
    loading, error,
    fetchAll, fetchUserTask
  } = useDashboardStore();

  useEffect(() => {
    const from = dayjs(fromDate).format('YYYYMMDD');
    const to   = dayjs(toDate).format('YYYYMMDD');
    fetchAll(from, to);
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const from = dayjs(fromDate).format('YYYYMMDD');
    const to   = dayjs(toDate).format('YYYYMMDD');
    fetchUserTask(from, to);
  }, [fromDate, toDate]);

  //Stat cards
  const statCards = [
    hasPermission(role, 'view_requests') && {
      icon: <FileText size={20} />, label: 'Yêu Cầu',
      value:     loading.stats ? '...' : String(stats?.requests?.total   ?? 0),
      change:    loading.stats ? ''    : `+${stats?.requests?.change     ?? 0} tuần này`,
      color: 'amber', changeDir: 'up',
    },
    hasPermission(role, 'view_approvals') && {
      icon: <CheckSquare size={20} />, label: 'Chờ Phân Công',
      value:     loading.stats ? '...' : String(stats?.approvals?.total  ?? 0),
      change:    loading.stats ? ''    : `+${stats?.approvals?.change    ?? 0} hôm nay`,
      color: 'blue', changeDir: 'up',
    },
    hasPermission(role, 'view_tasks') && {
      icon: <Kanban size={20} />, label: 'Công Việc',
      value:     loading.stats ? '...' : String(stats?.tasks?.total      ?? 0),
      change:    loading.stats ? ''    : `${stats?.tasks?.done           ?? 0} hoàn thành`,
      color: 'green', changeDir: 'up',
    },
    hasPermission(role, 'view_members') && {
      icon: <Users size={20} />, label: 'Thành Viên',
      value:     loading.stats ? '...' : String(stats?.members?.total    ?? 0),
      change:    loading.stats ? ''    : `+${stats?.members?.change      ?? 0} tháng này`,
      color: 'purple', changeDir: 'up',
    },
    {
      icon: <Clock size={20} />, label: 'Quá Hạn',
      value:     loading.stats ? '...' : String(stats?.overdue?.total    ?? 0),
      color: 'red', changeDir: 'down',
    },
  ].filter(Boolean);


  return (
    <div className="dashboard-grid animate-fade-in">

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--danger-dim)', border: '1px solid rgba(220,38,38,0.3)',
          fontSize: 13, color: 'var(--danger)',
        }}>
          <AlertCircle size={16} />
          Không thể tải dữ liệu: {error}
          <button
            onClick={fetchAll}
            style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">
            Chào buổi {new Date().getHours() < 12 ? 'sáng' : new Date().getHours() < 18 ? 'chiều' : 'tối'},{' '}
            <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ').pop()}</span> 👋
          </h1>
          <p className="page-subtitle">
            {ROLE_LABELS[role]} · {user?.department} · {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        {statCards.map((s, i) => <StatCard key={i} {...s} delay={i * 60} />)}
      </div>

      {/* Charts */}
      {hasPermission(role, 'view_reports') && (
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-title">Thống Kê Hoạt Động</div>
            <div className="chart-sub">6 tháng gần nhất</div>
            {loading.chart ? <Skeleton height={220} radius={8} /> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="gYC" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPD" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="yeuCau"   name="Yêu Cầu"  stroke="#d97706" fill="url(#gYC)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pheDuyet" name="Phê Duyệt" stroke="#2563eb" fill="url(#gPD)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <div className="chart-title">Trạng Thái Yêu Cầu</div>
            <div className="chart-sub">Phân bổ hiện tại</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={toPieData(stats?.statusStats)} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {toPieData(stats?.statusStats).map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, paddingRight: 4 }}>

        {/* Recent requests */}

       {/*{isPrivileged && (*/}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div className="chart-title">Thống Kê Xử Lý</div>
                <div className="chart-sub">Người tạo & số phiếu hoàn thành</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="input-date"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="input-date"
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {['#', 'Nhân Viên', 'Tổng phiếu được gia', 'Hoàn Thành', 'Tỉ Lệ'].map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left',
                        fontSize: 10, fontWeight: 700,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.8px',
                        fontFamily: 'var(--font-mono)',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-secondary)',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading.userTask ? (
                    <tr><td colSpan={5} style={{ padding: 24 }}>
                      <Skeleton height={32} radius={6} />
                    </td></tr>
                  ) : !userTasks?.length ? (
                    <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      Chưa có dữ liệu
                    </td></tr>
                  ) : (
                    userTasks.map((h, i) => {
                      const pct = h.assigned > 0 ? Math.round((h.done / h.assigned) * 100) : 0;
                      return (
                        <tr key={h.user_id}
                          style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* # */}
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              width: 22, height: 22, borderRadius: '50%',
                              background: i === 0 ? 'var(--accent)' : 'var(--bg-input)',
                              color: i === 0 ? '#fff' : 'var(--text-muted)',
                              fontSize: 10, fontWeight: 700,
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            }}>{i + 1}</span>
                          </td>

                          {/* Tên */}
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {h.user_name}
                          </td>

                          {/* Tổng */}
                          <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', textAlign: 'center' }}>
                            {h.assigned}
                          </td>

                          {/* Hoàn thành */}
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
                              {h.done}
                            </span>
                          </td>

                          {/* Tỉ lệ */}
                          <td style={{ padding: '10px 12px', minWidth: 80 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ flex: 1, height: 4, background: 'var(--bg-input)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                  height: '100%', width: `${pct}%`,
                                  background: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)',
                                  borderRadius: 2, transition: 'width 0.6s ease',
                                }} />
                              </div>
                              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        {/* )}*/}

        {/* Activity feed */}
        <div className="chart-card">
          <div className="chart-title">Hoạt Động</div>
          <div className="chart-sub">Nhật ký hệ thống</div>

          <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {loading.activities ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3,4].map(i => <Skeleton key={i} height={36} radius={6} />)}
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>Chưa có hoạt động</div>
            ) : (
              activities.map((a, i) => {
                const diff = Date.now() - new Date(a.created_at);
                const m    = Math.floor(diff / 60000);
                const ago  = m < 1 ? 'vừa xong' : m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.floor(m/60)} giờ trước` : `${Math.floor(m/1440)} ngày trước`;

                return (
                  <div key={a.id || i} className="activity-item" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="activity-dot" style={{ background: 'var(--accent)', boxShadow: `0 0 6px var(--accent-glow)` }} />
                    <div>
                      <div className="activity-text">
                        <strong>{a.user_name}</strong> {a.action}{' '}
                        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{a.target}</span>
                      </div>
                      <div className="activity-time">{ago}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @media (max-width: 768px) { .charts-row { grid-template-columns: 1fr !important; } }
        @media (max-width: 900px) { .dashboard-bottom { grid-template-columns: 1fr !important; } }
        .input-date {
          border: 1px solid var(--border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}