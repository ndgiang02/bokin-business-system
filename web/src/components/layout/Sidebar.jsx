import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FilePlus, CheckSquare, Kanban,
  Users, UserPlus, BarChart3, Settings, LogOut, CalendarDays, ChevronLeft,
  ChevronRight, X
} from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { getMenuItems, ROLE_LABELS } from '../../utils/roleUtils.js';
import '../../css/sidebar.css';

const ICONS = {
  LayoutDashboard, FileText, FilePlus, CheckSquare, Kanban,
  Users, UserPlus, BarChart3, Settings, LogOut, CalendarDays
};

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = authStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = getMenuItems(user?.role);

  const groups = {};
  menuItems.forEach(item => {
    const g = item.group || '__root__';
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });

  const handleNav = (path) => {
    navigate(path);
    onMobileClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onMobileClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">BK</div>
          <div className="logo-text">
            <div className="logo-name">BoKin</div>
            <div className="logo-sub">Business Suite</div>
          </div>

          <button
            className="sidebar-mobile-close"
            type="button"
            onClick={onMobileClose}
            aria-label="Đóng menu"
          >
            <X size={16} />
          </button>
        </div>

        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.avatar || user?.name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Người dùng'}</div>
            <div className="user-role">{ROLE_LABELS[user?.role] || user?.role || 'Tài khoản'}</div>
          </div>
          <div className="user-dot" />
        </div>

        <nav className="sidebar-nav">
          {groups['__root__']?.map(item => {
            const Icon = ICONS[item.icon];
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.key}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
                title={collapsed ? item.label : ''}
              >
                {Icon && <Icon className="nav-icon" size={18} />}
                <span className="nav-label">{item.label}</span>
              </div>
            );
          })}

          {['Kinh Doanh', 'Quan Ly', 'San Xuat', 'Phan Tich', 'He Thong'].map((groupName, idx) => {
            const realName = ['Kinh Doanh', 'Quản Lý', 'Sản Xuất', 'Phân Tích', 'Hệ Thống'][idx];
            if (!groups[realName]) return null;
            return (
              <div key={groupName} className="nav-group">
                <div className="nav-group-label">{realName}</div>
                {groups[realName].map(item => {
                  const Icon = ICONS[item.icon];
                  const isActive = location.pathname === item.path;
                  return (
                    <div
                      key={item.key}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleNav(item.path)}
                      title={collapsed ? item.label : ''}
                    >
                      {Icon && <Icon className="nav-icon" size={18} />}
                      <span className="nav-label">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} title={collapsed ? 'Đăng xuất' : ''}>
            <LogOut size={18} />
            <span className="nav-label">Đăng Xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
