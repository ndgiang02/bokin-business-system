import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { ROLE_LABELS } from '../../utils/roleUtils.js';
import '../../css/header.css';

const PAGE_TITLES = {
  '/dashboard':        ['Tổng Quan',       'Dashboard'],
  '/requests':         ['Yêu Cầu',         'Requests'],
  '/requests/create':  ['Tạo Yêu Cầu',     'Requests'],
  '/approvals':        ['Phê Duyệt',        'Approvals'],
  '/tasks':            ['Công Việc',         'Tasks'],
  '/members':          ['Thành Viên',        'Members'],
  '/members/create':   ['Thêm Thành Viên',   'Members'],
  '/reports':          ['Báo Cáo',           'Reports'],
  '/settings':         ['Cài Đặt',           'Settings'],
};

export default function Header({ onMenuToggle }) {
  const { user } = useAuthStore();
  const path = window.location.pathname;
  const [currentPage, parentPage] = PAGE_TITLES[path] || ['Trang Chủ', ''];

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <header className="header">
      {/* Hamburger — chỉ hiện trên mobile */}
      <button className="header-hamburger" onClick={onMenuToggle} aria-label="Mở menu">
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="header-breadcrumb">
        {parentPage && (
          <>
            <span className="breadcrumb-item">{parentPage}</span>
            <span className="breadcrumb-sep">/</span>
          </>
        )}
        <span className="breadcrumb-current">{currentPage}</span>
      </div>

      {/* Actions */}
      <div className="header-actions">
        <span className="header-date">{today}</span>

        <div className="header-role-badge">
          <div className="role-dot" />
          {ROLE_LABELS[user?.role]}
        </div>

        <button className="header-icon-btn" title="Tìm kiếm">
          <Search size={16} />
        </button>

        <button className="header-icon-btn" title="Thông báo" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span className="notif-badge">3</span>
        </button>
      </div>
    </header>
  );
}