import axiosClient from "./axiosClient";

export const roleApi = {

  getAllRoles: async () => {
    const res = await axiosClient.get("/roles/getAllRoles");
    return res;
  }
}