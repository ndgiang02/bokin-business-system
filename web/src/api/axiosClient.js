import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5002/api", // API server
  timeout: 10000,
});

// request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("auth_user");

    if (user) {
        const { token } = JSON.parse(user);
        if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// response interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      //localStorage.removeItem("auth_user");
     // window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;