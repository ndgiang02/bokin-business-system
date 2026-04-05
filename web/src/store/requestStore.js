import { create } from 'zustand';
import { requestApi } from '../api/requestApi';

export const requestStore = create((set, get) => ({
  requests: [],
  isLoading: false,
  error: null,

 createRequest: async (formData, onProgress) => {
  set({ isSaving: true, uploadPct: 0, error: null });

  try {
    const res = await requestApi.createRequest(formData, (pct) => {
      set({ uploadPct: pct });
      onProgress?.(pct);
    });

    return res.data; // 👈 chỉ return data
  } catch (err) {
    const message =
      err.response?.data?.error || err.message || 'Có lỗi xảy ra';

    set({ error: message });
    throw new Error(message); // 👈 QUAN TRỌNG
  } finally {
    set({ isSaving: false, uploadPct: 0 });
  }
},


  getAllRequets: async (filters = {}, pagination = { page: 1, limit: 20 }) => {
    try {
      set({ isLoading: true });

      const params = { ...filters, ...pagination };
      const res = await requestApi.getAllRequets(params);

      const items = res?.data?.data?.items || [];

      set({
        requests: items || [],
        isLoading: false,
      });

      return res;
    } catch (err) {
      set({
        error: err.message,
        isLoading: false,
      });
      return [];
    }
  },


  getRequestById: async (Id) => {
    try {
      const res = await requestApi.getRequestById(Id);
      return res;
    } catch (err) {
      console.error("get request error:", err?.response?.status, err?.message, err); // ← thêm
      return err;
    }
  },

  assignRequest: async (Id, userIds) => {
    try {
      const res = await requestApi.assignRequest(Id, userIds);
      return res;
    } catch (err) {
      return err;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await requestApi.updateStatus(id, status);
      return res;
    } catch (err) {
      return err;
    }
  },

  clearError: () => set({ error: null }),
}));
