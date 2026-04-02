import { create } from 'zustand';
import { userApi } from "../api/userApi";


export const userStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,

  getAllUser: async() => {
    set({ isLoading: true, error: null });
    const res = await userApi.getAll();
    return res;
  },

  getUsersDepartment: async (departmentId) => {
    set({ isLoading: true, error: null });
    try {
        const res = await userApi.getUsersDepartment(departmentId);
        set({ isLoading: false });
        return res;
    } catch (error) {
        set({ isLoading: false, error: error.message });
        console.error("getUsersDepartment error:", err?.response?.status, err?.message, err);
        return null;
    }
  },
}));