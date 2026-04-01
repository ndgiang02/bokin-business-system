import axiosClient from "./axiosClient";

export const userApi = {

  getAll: async () => {
    const res = await axiosClient.get("/users/get-all-users");
    return res.data.data;
  },

  getUsersDepartment: async (departmentId) => {
    try {
      const res = await axiosClient.get('/users/get-users-department', { params: { departmentId: departmentId }});
      return res.data.data;
    } catch (err) {
      console.error("getUsersDepartment error:", err?.response?.status, err?.message, err); 
      return err;
    }
  },

  getById: async (id) => {
    const res = await axiosClient.get(`/users/${id}`);
    return res.data.data;
  },

  create: async (data) => {
    const res = await axiosClient.post("/users/create-user", data);
    return res.data.data;
  },

  update: async (id, data) => {
    const res = await axiosClient.put(`/users/${id}`, data);
    return res.data.data;
  },

  delete: async (id) => {
    const res = await axiosClient.delete(`/users/${id}`);
    return res.data.data;
  }

};