"use client";
import { createContext, useContext, useState, useCallback } from "react";
import api from "@/service/api";

const TiktokOrderContext = createContext();

export const TiktokOrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null); // State for a single order
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    next_page_token: "",
    prev_page_tokens: [], // Array to store previous page tokens for back navigation
    total_count: 0,
  });

  const fetchTiktokOrders = useCallback(async (params = {}, body = {}) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.post(`/orders/admin/tiktok/search?${query}`, body);
      const {
        orders: newOrders,
        next_page_token,
        total_count,
      } = res.data.data;

      setOrders(newOrders || []);

      setPagination((prev) => ({
        ...prev,
        next_page_token: next_page_token || "",
        total_count: total_count || 0,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal mengambil pesanan TikTok");
      setOrders([]);
      setPagination({ next_page_token: "", prev_page_tokens: [], total_count: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTiktokOrderById = useCallback(async (orderId) => {
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.get(`/orders/admin/tiktok/${orderId}`);
      setOrder(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal mengambil detail pesanan TikTok"
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TiktokOrderContext.Provider
      value={{
        orders,
        order,
        loading,
        error,
        pagination,
        setPagination,
        fetchTiktokOrders,
        fetchTiktokOrderById,
      }}
    >
      {children}
    </TiktokOrderContext.Provider>
  );
};

export const useTiktokOrder = () => useContext(TiktokOrderContext);
