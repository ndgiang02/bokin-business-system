// ===== ROLE DEFINITIONS =====
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TRUONG_PHONG_KINH_DOANH: 'truong_phong_kinh_doanh',
  TRUONG_PHONG_SX: 'truong_phong_sx',
  NHAN_VIEN_KINH_DOANH: 'nhan_vien_kinh_doanh',
  NHAN_VIEN_SAN_XUAT: 'nhan_vien_san_xuat',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  truong_phong_kinh_doanh: 'Trưởng Phòng Kinh Doanh',
  truong_phong_sx: 'Trưởng Phòng Sản Xuất',
  nhan_vien_kinh_doanh: 'Nhân Viên Kinh Doanh',
  nhan_vien_san_xuat: 'Nhân Viên Sản Xuất',
};

export const ROLE_COLORS = {
  super_admin: '#f59e0b',
  truong_phong_kinh_doanh: '#3b82f6',
  truong_phong_sx: '#10b981',
  nhan_vien_kinh_doanh: '#8b5cf6',
  nhan_vien_san_xuat: '#06b6d4',
};

export const ROLE_BADGE_COLORS = {
  super_admin: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  truong_phong_kinh_doanh: { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
  truong_phong_sx: { bg: '#ecfdf5', text: '#065f46', border: '#6ee7b7' },
  nhan_vien_kinh_doanh: { bg: '#f5f3ff', text: '#4c1d95', border: '#c4b5fd' },
  nhan_vien_san_xuat: { bg: '#ecfeff', text: '#164e63', border: '#67e8f9' },
};

// ===== PERMISSION MATRIX =====
export const PERMISSIONS = {
  // Dashboard
  view_dashboard: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_KINH_DOANH, ROLES.TRUONG_PHONG_SX, ROLES.NHAN_VIEN_KINH_DOANH, ROLES.NHAN_VIEN_SAN_XUAT],

  // Yêu cầu (Requests)
  view_requests: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_KINH_DOANH, ROLES.NHAN_VIEN_KINH_DOANH, ROLES.NHAN_VIEN_SAN_XUAT, ROLES.TRUONG_PHONG_SX],
  create_request: [ROLES.NHAN_VIEN_KINH_DOANH, ROLES.TRUONG_PHONG_KINH_DOANH],

  // Phê duyệt (Approvals)
  view_approvals: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_KINH_DOANH, ROLES.TRUONG_PHONG_SX],

  // Công việc (Tasks)
  view_tasks: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_SX, ROLES.NHAN_VIEN_SAN_XUAT, ROLES.TRUONG_PHONG_KINH_DOANH],
  manage_tasks: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_SX],

  // Thành viên (Members)
  view_members: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_KINH_DOANH, ROLES.TRUONG_PHONG_SX],
  manage_members: [ROLES.SUPER_ADMIN],

  // Báo cáo (Reports)
  view_reports: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_KINH_DOANH, ROLES.TRUONG_PHONG_SX],

  // Cài đặt (Settings)
  view_settings: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG_SX, ROLES.NHAN_VIEN_SAN_XUAT, ROLES.TRUONG_PHONG_KINH_DOANH],
};

export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  return PERMISSIONS[permission]?.includes(role) ?? false;
};

export const hasAnyPermission = (role, permissions) => {
  return permissions.some(p => hasPermission(role, p));
};

// ===== MENU ITEMS by permission =====
export const getMenuItems = (role) => {
  const allItems = [
    {
      key: 'dashboard',
      label: 'Tổng Quan',
      icon: 'LayoutDashboard',
      path: '/dashboard',
      permission: 'view_dashboard',
      group: null,
    },
    {
      key: 'requests',
      label: 'Yêu Cầu',
      icon: 'FileText',
      path: '/requests',
      permission: 'view_requests',
      group: 'Kinh Doanh',
    },
  
    /*
    {
      key: 'tasks',
      label: 'Công Việc',
      icon: 'Kanban',
      path: '/tasks',
      permission: 'view_tasks',
      group: 'Sản Xuất',
    },
    */
    {
      key: 'members',
      label: 'Thành Viên',
      icon: 'Users',
      path: '/members',
      permission: 'view_members',
      group: 'Quản Lý',
    },
    /*
    {
      key: 'reports',
      label: 'Báo Cáo',
      icon: 'BarChart3',
      path: '/reports',
      permission: 'view_reports',
      group: 'Phân Tích',
    },
    */
    {
      key: 'settings',
      label: 'Cài Đặt',
      icon: 'Settings',
      path: '/settings',
      permission: 'view_settings',
      group: 'Hệ Thống',
    },
  ];

  return allItems.filter(item => hasPermission(role, item.permission));
};