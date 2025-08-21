"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../service/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAdminProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // api instance should automatically include the token in headers
        const res = await api.get("/auth/admin/me");
        setAdmin(res.data); // Store the full admin object
      } catch (error) {
        console.error("Failed to fetch admin profile, logging out.", error);
        localStorage.removeItem("token");
        setAdmin(null);
      }
    } else {
      setAdmin(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const loginAdmin = async ({ email, password }) => {
    try {
      const res = await api.post("/auth/admin/signin", {
        email,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        await fetchAdminProfile(); // Fetch profile after getting token
        router.push("/admin");
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login gagal",
      };
    }
  };

  const logoutAdmin = async () => {
    try {
      await api.post("/auth/admin/logout");
    } catch (e) {
      // console.log(e);
    }
    localStorage.removeItem("token");
    setAdmin(null); // Clear admin state on logout
    router.push("/account");
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ admin, loginAdmin, logoutAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
