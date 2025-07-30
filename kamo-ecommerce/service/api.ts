import axios, { InternalAxiosRequestConfig } from "axios";

const instance = axios.create({
  baseURL: "http://192.168.10.33:8000/api", // Ubah ke localhost untuk konsistensi
  withCredentials: true,
});

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default instance;
