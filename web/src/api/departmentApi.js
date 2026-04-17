import axiosClient from "./axiosClient";

export const depApi = {

  getAlldepartments: async () => {
    const res = await axiosClient.get("/departments/getAllDepartments");
    return res;
  },

  // ── Lấy theo ID ────────────────────────
  getDepartmentById: async (id) => {
    const res = await axiosClient.get(`/departments/${id}`);
    return res;
  },

  // ── Tạo ───────────────────────────────
  createDepartment: (data) => {
    return axiosClient.post("/departments/create", data);
  },

  // ── Cập nhật ──────────────────────────
  updateDepartment: (id, data) => {
    return axiosClient.put(`/departments/${id}/update`, data);
  },

  // ── Xoá ───────────────────────────────
  deleteDepartment: (id) => {
    return axiosClient.delete(`/departments/${id}/delete`);
  },
 
}