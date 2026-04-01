import axiosClient from "./axiosClient";

export const authApi = {

  login: async (email, password) => {
    const res = await axiosClient.post("/auth/login", {
      email,
      password
    });
    return res;
  },

  logout: async () => {
    const res = await axiosClient.post("/auth/logout");
    return res;
  },

  me: async () => {
    const res = await axiosClient.get("/auth/me");
    return res;
  }

};