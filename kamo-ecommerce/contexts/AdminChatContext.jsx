"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import io from "socket.io-client";
import { useAuth } from "./AuthContext";
import api from "@/service/api";

const AdminChatContext = createContext();

export const useAdminChat = () => useContext(AdminChatContext);

export const AdminChatProvider = ({ children }) => {
  const { admin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllConversations = useCallback(async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const res = await api.get("/chat/admin/conversations");
      setConversations(res.data);
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

  // Setup dan cleanup koneksi Socket.IO
  useEffect(() => {
    if (admin) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
      setSocket(newSocket);

      newSocket.emit("join_room", admin.id);

      const handleReceiveMessage = (newMessage) => {
        // Abaikan pesan yang dikirim oleh admin sendiri
        if (newMessage.sender_role === "admin") return;

        setConversations((prevConvos) => {
          const convoIndex = prevConvos.findIndex(
            (c) => c.id === newMessage.conversationId
          );

          // Jika percakapan baru (misal, user baru pertama kali chat)
          if (convoIndex === -1) {
            // Fallback aman: fetch ulang jika percakapan tidak ditemukan di list.
            fetchAllConversations();
            return prevConvos;
          }

          // Update percakapan yang ada
          const updatedConvo = {
            ...prevConvos[convoIndex],
            messages: [newMessage], // Update pesan terakhir
            lastMessageAt: newMessage.createdAt,
            unreadCount:
              (parseInt(prevConvos[convoIndex].unreadCount) || 0) + 1,
          };

          // Hapus percakapan lama dan tambahkan yang baru di paling atas
          const otherConvos = prevConvos.filter(
            (c) => c.id !== newMessage.conversationId
          );
          return [updatedConvo, ...otherConvos];
        });
      };

      newSocket.on("receive_message", handleReceiveMessage);

      return () => {
        newSocket.off("receive_message", handleReceiveMessage);
        newSocket.close();
      };
    }
  }, [admin, fetchAllConversations]);

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
    if (!socket || !conversationId) {
      throw new Error("Socket atau ID percakapan tidak siap.");
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
    socket,
    markConversationAsReadInState,
    sendMessageFromAdmin,
  };

  return (
    <AdminChatContext.Provider value={value}>
      {children}
    </AdminChatContext.Provider>
  );
};
