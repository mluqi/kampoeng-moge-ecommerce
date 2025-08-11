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

const AdminChatContext = createContext();

export const useAdminChat = () => useContext(AdminChatContext);

export const AdminChatProvider = ({ children }) => {
  const { admin } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastPollTime, setLastPollTime] = useState(null);

  const fetchAllConversations = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const res = await api.get("/chat/admin/conversations");
      setConversations(res.data);
      // Set initial poll time after the first full fetch
      setLastPollTime(new Date().toISOString());
    } catch (error) {
      console.error("Failed to fetch admin conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  // Inisialisasi data saat admin login
  useEffect(() => {
    if (admin) {
      fetchAllConversations();
    }
  }, [admin, fetchAllConversations]);

  // [OPTIMIZED] Polling for conversation updates
  useEffect(() => {
    if (!admin || !lastPollTime) return;

    const pollForUpdates = async () => {
      if (document.hidden) return;

      try {
        const res = await api.get("/chat/admin/conversations/updates", {
          params: { lastFetchTimestamp: lastPollTime },
        });

        const updates = res.data;
        if (updates.length > 0) {
          setConversations((prevConvos) => {
            const convosMap = new Map(prevConvos.map((c) => [c.id, c]));
            updates.forEach((updatedConvo) => {
              convosMap.set(updatedConvo.id, updatedConvo);
            });
            const newConvos = Array.from(convosMap.values());
            return newConvos.sort(
              (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
            );
          });
        }
        // Always update the poll time to now for the next request
        setLastPollTime(new Date().toISOString());
      } catch (error) {
        console.error("Failed to poll for conversation updates:", error);
      }
    };

    const intervalId = setInterval(pollForUpdates, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [admin, lastPollTime]);

  const markConversationAsReadInState = useCallback((conversationId) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  const totalUnreadCount = conversations.reduce(
    (acc, convo) => acc + (parseInt(convo.unreadCount, 10) || 0),
    0
  );

  const sendMessageFromAdmin = async (conversationId, content) => {
    if (!conversationId) {
      throw new Error("ID percakapan tidak siap.");
    }
    try {
      const res = await api.post("/chat/admin/messages", {
        conversationId,
        content,
      });
      const sentMessage = res.data;

      // Update state secara lokal untuk memindahkan percakapan ke atas
      setConversations((prevConvos) => {
        const convoIndex = prevConvos.findIndex((c) => c.id === conversationId);
        if (convoIndex === -1) return prevConvos;

        const updatedConvo = {
          ...prevConvos[convoIndex],
          messages: [sentMessage],
          lastMessageAt: sentMessage.createdAt,
        };

        const otherConvos = prevConvos.filter((c) => c.id !== conversationId);
        return [updatedConvo, ...otherConvos];
      });

      return res.data; // Kembalikan data pesan baru
    } catch (error) {
      console.error("Failed to send message from admin:", error);
      throw error; // Lemparkan error agar bisa ditangani di komponen
    }
  };

  const value = {
    conversations,
    loading,
    totalUnreadCount,
    markConversationAsReadInState,
    sendMessageFromAdmin,
  };

  return (
    <AdminChatContext.Provider value={value}>
      {children}
    </AdminChatContext.Provider>
  );
};
