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

  // ── UPDATE USER ───────────────────────────────
  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await userApi.update(id, data);

      set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, ...data } : u
        ),
        user: state.user?.id === id ? { ...state.user, ...data } : state.user,
        isLoading: false,
      }));

      return res;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },

  // ── DELETE USER (SOFT DELETE) ─────────────────
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await userApi.delete(id);

      set((state) => ({
        isLoading: false,
      }));

      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return false;
    }
  },

  // ── GET USER BY ID ─────────────────────────────
  getUserById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await userApi.getById(id);
      set({ user: res, isLoading: false });
      return res;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      return null;
    }
  },
}));