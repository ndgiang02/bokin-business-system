import { create } from 'zustand';
import { depApi } from "../api/departmentApi";


export const departStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  getAlldepartments: async () => {
    set({ isLoading: true, error: null });
    const res = await depApi.getAlldepartments();
    return res;
  },

}));
