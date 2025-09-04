import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/kamo",
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use((config) => {
  // This check ensures localStorage is only accessed on the client-side
  if (typeof window !== "undefined") {
    // const token = localStorage.getItem("token");
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
  }
  return config;
});

export default api;
