import axiosClient from "./axiosClient";

export const depApi = {

  getAlldepartments: async () => {
    const res = await axiosClient.get("/departments/getAllDepartments");
    return res;
  }
}