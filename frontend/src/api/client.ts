import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://192.168.128.1:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true", // Bypasses ngrok mobile warning screen
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("awtarprop_auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
