// ===== ROLE DEFINITIONS =====
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  TRUONG_PHONG: 'truong_phong',
  NHAN_VIEN: 'nhan_vien',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  truong_phong: 'Trưởng Phòng',
  nhan_vien: 'Nhân Viên',
};

export const ROLE_COLORS = {
  super_admin: '#f59e0b',
  truong_phong: '#3b82f6',
  nhan_vien: '#06b6d4',
};

export const ROLE_BADGE_COLORS = {
  super_admin: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  truong_phong: { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
  nhan_vien: { bg: '#ecfeff', text: '#164e63', border: '#67e8f9' },
};

// ===== PERMISSION MATRIX =====
export const PERMISSIONS = {
  // Dashboard
  view_dashboard: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG, ROLES.NHAN_VIEN],


  // Yêu cầu (Requests)
  view_requests: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG, ROLES.NHAN_VIEN],
  create_request: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG, ROLES.NHAN_VIEN],

  // Phê duyệt (Approvals)
  view_approvals: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG,ROLES.NHAN_VIEN],

  // Công việc (Tasks)
  view_tasks: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG, ROLES.NHAN_VIEN],
  manage_tasks: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG],

  // Thành viên (Members)
  view_members: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG],
  manage_members: [ROLES.SUPER_ADMIN],
  edit_member: [ROLES.SUPER_ADMIN],

  // Báo cáo (Reports)
  view_reports: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG],

  // Cài đặt (Settings)
  view_settings: [ROLES.SUPER_ADMIN, ROLES.TRUONG_PHONG, ROLES.NHAN_VIEN],
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

    {
      key: 'department',
      label: 'Phòng Ban',
      icon: 'Kanban',
      path: '/department',
      permission: 'view_members',
      group: 'Quản Lý',
    },
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