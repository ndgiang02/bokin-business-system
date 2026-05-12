import { Bell, Search, Menu, Sparkles } from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { ROLE_LABELS } from '../../utils/roleUtils.js';
import '../../css/header.css';

const PAGE_TITLES = {
  '/dashboard':        ['Tổng Quan',       'Dashboard'],
  '/requests':         ['Yêu Cầu',         'Requests'],
  '/approvals':        ['Phê Duyệt',        'Approvals'],
  '/tasks':            ['Công Việc',         'Tasks'],
  '/members':          ['Thành Viên',        'Members'],
  '/reports':          ['Báo Cáo',           'Reports'],
  '/settings':         ['Cài Đặt',           'Settings'],
};

export default function Header({ onMenuToggle }) {
  const { user } = authStore();
  const path = window.location.pathname;
  const [currentPage, parentPage] = PAGE_TITLES[path] || ['Trang Chủ', ''];

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <header className="header">
      <button className="header-hamburger" onClick={onMenuToggle} aria-label="Mở menu">
        <Menu size={18} />
      </button>

      <div className="header-title-block">
        <div className="header-breadcrumb">
          {parentPage && (
            <>
              <span className="breadcrumb-item">{parentPage}</span>
              <span className="breadcrumb-sep">/</span>
            </>
          )}
          <span className="breadcrumb-current">{currentPage}</span>
        </div>
        <div className="header-greeting">
          <Sparkles size={14} />
          Xin chào, {user?.name || 'bạn'}
        </div>
      </div>

      <div className="header-actions">
        <button className="header-search" title="Tìm kiếm">
          <Search size={16} />
          <span>Tìm kiếm nhanh...</span>
        </button>

        <span className="header-date">{today}</span>

        <span className="header-role-badge">
          <span className="role-dot" />
          {ROLE_LABELS[user?.role] || user?.role || 'User'}
        </span>

        <button className="header-icon-btn" title="Thông báo">
          <Bell size={16} />
          <span className="notif-badge">3</span>
        </button>
      </div>
    </header>
  );
}
