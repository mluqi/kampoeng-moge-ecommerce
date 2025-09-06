import axios from "axios";

const api = axios.create({
  baseURL: "https://kampoengmoge.com/kamo",
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
  }
  return config;
});

export default api;
