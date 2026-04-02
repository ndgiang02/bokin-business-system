import axiosClient from "./axiosClient";

export const requestApi = {

  createRequest: async (formData, onProgress) => {
    try {
      const res = await axiosClient.post('/requests/create-request', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.lengthComputable && onProgress) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      return res; // trả nguyên response
    } catch (err) {
      console.error('Lỗi createRequest:', err);
      throw err; //  để store xử lý
    }
  },


  /*createRequest: async(data) => {
    const res = await axiosClient.post("/requests/create-request", data)
    return res;
  },
  */

  getAllRequets: async(filters) => {
    const res = await axiosClient.get("/requests/get-all-requests", { params: filters });
    return res;
  },

 getRequestById: async (Id) => {
    try {
      const res = await axiosClient.get('/requests/get-request-byId', {params: { Id }});
      return res.data;
    } catch (err) {
      console.error('Lỗi getById:', err);
      return null;
    }
  },

  assignRequest: async (requestId, userIds) => {
    const res = await axiosClient.post("/requests/assign-request", { requestId, userIds });
    return res;
  },


 updateStatus: async (id, status) => {
    try {
      const res = await axiosClient.patch(`/requests/${id}/status`, { status });
      return res.data;
    } catch (err) {
      console.error('Lỗi updateStatus:', err);
      throw err;
    }
  },

  // Tạo revision với comment
  createRevision: async (id, comment) => {
    try {
      const res = await axiosClient.post(`/requests/${id}/revision`, { comment });
      return res.data;
    } catch (err) {
      console.error('Lỗi createRevision:', err);
      throw err;
    }
  },

  // Xóa user được gán
  removeAssign: async (id, userId) => {
    try {
      const res = await axiosClient.delete(`/requests/${id}/assign/${userId}`);
      return res.data;
    } catch (err) {
      console.error('Lỗi removeAssign:', err);
      throw err;
    }
  },

  // Lấy danh sách nhân viên SX / trưởng phòng SX
  getSXUsers: async () => {
    try {
      const res = await axiosClient.get('/users', { params: { role: 'nhan_vien_san_xuat,truong_phong_sx' } });
      return res.data;
    } catch (err) {
      console.error('Lỗi getSXUsers:', err);
      throw err;
    }
  },

  update: (id, data) => Promise.resolve({ id, ...data }),
  delete: (id) => Promise.resolve({ success: true })
};