"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import api from "@/service/api";

const OrderNotificationContext = createContext();

export const useOrderNotification = () => useContext(OrderNotificationContext);

export const OrderNotificationProvider = ({ children }) => {
  const { admin } = useAuth();
  const [processingOrdersCount, setProcessingOrdersCount] = useState(0);

  const fetchProcessingOrdersCount = useCallback(async () => {
    if (!admin) return;
    try {
      const res = await api.get("/orders/admin/processing-count");
      setProcessingOrdersCount(res.data.count);
    } catch (error) {
      console.error("Failed to fetch processing orders count", error);
    }
  }, [admin]);

  useEffect(() => {
    if (admin) {
      fetchProcessingOrdersCount();
      const intervalId = setInterval(fetchProcessingOrdersCount, 15000); // Poll every 15 seconds
      return () => clearInterval(intervalId);
    }
  }, [admin, fetchProcessingOrdersCount]);

  const value = {
    processingOrdersCount,
  };

  return (
    <OrderNotificationContext.Provider value={value}>
      {children}
    </OrderNotificationContext.Provider>
  );
};
