import axiosClient from "./axiosClient";

export const userApi = {

  getAll: async () => {
    const res = await axiosClient.get("/users/getAllUsers");
    return res.data.data;
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