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

  create: async (data) => {
    const res = await axiosClient.post("/users/create-user", data);
    return res.data.data;
  },

   // GET /api/users/get-user/:id
  getById: async (id) => {
    const res = await axiosClient.get(`/users/get-user-byId/${id}`);
    return res.data.data;
  },

  // PUT /api/users/update-user/:id
  update: async (id, data) => {
    const res = await axiosClient.put(`/users/update-user/${id}`, data);
    return res.data.data;
  },

  // DELETE /api/users/delete-user/:id
  delete: async (id) => {
    const res = await axiosClient.delete(`/users/delete-user/${id}`);
    return res.data;
  },
};