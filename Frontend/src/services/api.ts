import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    config.headers["x-refresh-token"] = refreshToken;
  }

  return config;
});

export default api;

export { API_URL };
