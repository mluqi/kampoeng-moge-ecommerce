import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/kamo",
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
  }
  return config;
});

export default api;
