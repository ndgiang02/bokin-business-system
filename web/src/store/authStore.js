import { create } from 'zustand';
import { authApi } from "../api/authApi";

const MOCK_USERS = [
  {
    id: 1,
    name: 'Nguyễn Văn Admin',
    email: 'admin@company.com',
    password: '123456',
    role: 'super_admin',
    avatar: 'NA',
    department: 'Ban Giám Đốc',
    phone: '0901 234 567',
    joinDate: '2020-01-15',
  },
  {
    id: 2,
    name: 'Trần Thị Lan',
    email: 'lan.tran@company.com',
    password: '123456',
    role: 'truong_phong_kinh_doanh',
    avatar: 'TL',
    department: 'Phòng Kinh Doanh',
    phone: '0912 345 678',
    joinDate: '2021-03-20',
  },
  {
    id: 3,
    name: 'Lê Minh Tuấn',
    email: 'tuan.le@company.com',
    password: '123456',
    role: 'truong_phong_sx',
    avatar: 'LT',
    department: 'Phòng Sản Xuất',
    phone: '0923 456 789',
    joinDate: '2021-06-10',
  },
  {
    id: 4,
    name: 'Phạm Quốc Hùng',
    email: 'hung.pham@company.com',
    password: '123456',
    role: 'nhan_vien_kinh_doanh',
    avatar: 'PH',
    department: 'Phòng Kinh Doanh',
    phone: '0934 567 890',
    joinDate: '2022-09-01',
  },
  {
    id: 5,
    name: 'Hoàng Thị Mai',
    email: 'mai.hoang@company.com',
    password: '123456',
    role: 'nhan_vien_san_xuat',
    avatar: 'HM',
    department: 'Phòng Sản Xuất',
    phone: '0945 678 901',
    joinDate: '2023-02-15',
  },
];

export { MOCK_USERS };

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    await new Promise(r => setTimeout(r, 800));

    const res = await authApi.login(email, password);
    if(!res.data.success)
    {
      set({ error: res.message, isLoading: false });
      return false;
    }

    const { token, user } = res.data.data;
    const authData = { user, token };
    set({ user: authData.user, isAuthenticated: true, isLoading: false });
    localStorage.setItem("auth_user", JSON.stringify(authData));
    return true;
  },

  logout: () => {
    localStorage.removeItem('auth_user');
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        set({ user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
  },

  clearError: () => set({ error: null }),
}));