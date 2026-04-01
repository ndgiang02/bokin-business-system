import { create } from 'zustand';
import { roleApi } from "../api/roleApi.js";


export const roleStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  getAllRoles: async () => {
    set({ isLoading: true, error: null });
    const res = await roleApi.getAllRoles();
    return res;
  },

}));
