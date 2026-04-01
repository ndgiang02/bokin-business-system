import { useEffect, useState } from 'react';
import {
  FileText, CheckSquare, Kanban, Users,
  TrendingUp, Clock, AlertCircle, ArrowRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { hasPermission, ROLE_LABELS } from '../../utils/roleUtils.js';
import { StatCard } from '../../components/ui/Card.jsx';
import '../../css/dashboard.css';

const CHART_DATA = [
  { month: 'T10', yeuCau: 12, pheDuyet: 10, hoanthanh: 8 },
  { month: 'T11', yeuCau: 18, pheDuyet: 15, hoanthanh: 14 },
  { month: 'T12', yeuCau: 22, pheDuyet: 19, hoanthanh: 17 },
  { month: 'T1', yeuCau: 15, pheDuyet: 13, hoanthanh: 12 },
  { month: 'T2', yeuCau: 25, pheDuyet: 21, hoanthanh: 19 },
  { month: 'T3', yeuCau: 20, pheDuyet: 16, hoanthanh: 14 },
];

const PIE_DATA = [
  { name: 'Hoàn thành', value: 45, color: '#10b981' },
  { name: 'Đang xử lý', value: 30, color: '#3b82f6' },
  { name: 'Chờ duyệt', value: 15, color: '#f59e0b' },
  { name: 'Từ chối', value: 10, color: '#ef4444' },
];

const ACTIVITIES = [
  { text: <><strong>Phạm Quốc Hùng</strong> tạo yêu cầu YC-2024-005</>, time: '5 phút trước', color: '#3b82f6' },
  { text: <><strong>Trần Thị Lan</strong> phê duyệt YC-2024-002</>, time: '1 giờ trước', color: '#10b981' },
  { text: <><strong>Lê Minh Tuấn</strong> cập nhật tiến độ CV-003 (70%)</>, time: '2 giờ trước', color: '#f59e0b' },
  { text: <><strong>Hoàng Thị Mai</strong> hoàn thành CV-004</>, time: '3 giờ trước', color: '#10b981' },
  { text: <><strong>Hệ thống</strong> tự động gửi nhắc nhở deadline CV-002</>, time: '5 giờ trước', color: '#8b5cf6' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 12,
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)' }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color, display: 'flex', gap: 8, marginBottom: 2 }}>
            <span>{p.name}:</span><strong>{p.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role;

  const stats = [
    hasPermission(role, 'view_requests') && {
      icon: <FileText size={20} />, label: 'Yêu Cầu', value: '28',
      color: 'amber', change: '+5 tuần này', changeDir: 'up',
    },
    hasPermission(role, 'view_approvals') && {
      icon: <CheckSquare size={20} />, label: 'Chờ Phê Duyệt', value: '7',
      color: 'blue', change: '+2 hôm nay', changeDir: 'up',
    },
    hasPermission(role, 'view_tasks') && {
      icon: <Kanban size={20} />, label: 'Công Việc', value: '15',
      color: 'green', change: '3 hoàn thành', changeDir: 'up',
    },
    hasPermission(role, 'view_members') && {
      icon: <Users size={20} />, label: 'Thành Viên', value: '8',
      color: 'purple', change: '+1 tháng này', changeDir: 'up',
    },
    {
      icon: <TrendingUp size={20} />, label: 'Doanh Thu (M)', value: '4.3B',
      color: 'cyan', change: '+12% so tháng trước', changeDir: 'up',
    },
    {
      icon: <Clock size={20} />, label: 'Quá Hạn', value: '2',
      color: 'red', change: '-1 so tuần trước', changeDir: 'down',
    },
  ].filter(Boolean);

  const quickActions = [
    hasPermission(role, 'create_request') && { label: 'Tạo Yêu Cầu', icon: <FileText size={16} />, path: '/requests/create' },
    hasPermission(role, 'view_approvals') && { label: 'Xem Phê Duyệt', icon: <CheckSquare size={16} />, path: '/approvals' },
    hasPermission(role, 'view_tasks') && { label: 'Bảng Công Việc', icon: <Kanban size={16} />, path: '/tasks' },
    hasPermission(role, 'manage_members') && { label: 'Thêm Thành Viên', icon: <Users size={16} />, path: '/members/create' },
  ].filter(Boolean);

  return (
    <div className="dashboard-grid animate-fade-in">
      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">
            Chào buổi {new Date().getHours() < 12 ? 'sáng' : new Date().getHours() < 18 ? 'chiều' : 'tối'}, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ').pop()}</span> 👋
          </h1>
          <p className="page-subtitle">
            {ROLE_LABELS[role]} · {user?.department} · Hôm nay {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
        {quickActions.length > 0 && (
          <button className="btn btn-primary" onClick={() => navigate(quickActions[0].path)}>
            {quickActions[0].icon}
            {quickActions[0].label}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-row">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} delay={i * 60} />
        ))}
      </div>

      {/* Quick actions */}
      {quickActions.length > 1 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            // Thao tác nhanh
          </div>
          <div className="quick-actions">
            {quickActions.map((qa, i) => (
              <button key={i} className="quick-action-btn" onClick={() => navigate(qa.path)}>
                <div className="qa-icon">{qa.icon}</div>
                <div className="qa-label">{qa.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {hasPermission(role, 'view_reports') && (
        <div className="charts-row">
          {/* Area chart */}
          <div className="chart-card">
            <div className="chart-title">Thống Kê Hoạt Động</div>
            <div className="chart-sub">6 tháng gần nhất</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="gYC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPD" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="yeuCau" name="Yêu Cầu" stroke="#f59e0b" fill="url(#gYC)" strokeWidth={2} />
                <Area type="monotone" dataKey="pheDuyet" name="Phê Duyệt" stroke="#3b82f6" fill="url(#gPD)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="chart-card">
            <div className="chart-title">Trạng Thái Yêu Cầu</div>
            <div className="chart-sub">Phân bổ hiện tại</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Recent requests or tasks based on role */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>
                {hasPermission(role, 'view_requests') ? 'Yêu Cầu Mới Nhất' : 'Công Việc Hôm Nay'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Cập nhật gần nhất</div>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate(hasPermission(role, 'view_requests') ? '/requests' : '/tasks')}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Xem tất cả <ArrowRight size={12} />
            </button>
          </div>

          {[
            { code: 'YC-2024-005', title: 'Dây chuyền đóng gói tự động', client: 'Unilever Vietnam', status: 'pending', amount: '2.5B' },
            { code: 'YC-2024-003', title: 'Robot hàn tự động RW200', client: 'Vingroup Manufacturing', status: 'in_progress', amount: '1.2B' },
            { code: 'YC-2024-002', title: 'Linh kiện thay thế dây chuyền A', client: 'Tập đoàn XNK VN', status: 'approved', amount: '320M' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--bg-input)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileText size={16} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.code} · {item.client}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span className={`badge badge-${item.status}`}>
                  {item.status === 'pending' ? 'Chờ' : item.status === 'in_progress' ? 'Đang xử lý' : 'Đã duyệt'}
                </span>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{item.amount}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Hoạt Động</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Nhật ký hệ thống</div>
          {ACTIVITIES.map((a, i) => (
            <div key={i} className="activity-item" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="activity-dot" style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
              <div>
                <div className="activity-text">{a.text}</div>
                <div className="activity-time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}