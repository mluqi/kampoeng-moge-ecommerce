"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUserAuth } from "./UserAuthContext";
import api from "@/service/api";
import io from "socket.io-client";

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, profile } = useUserAuth();
  const [socket, setSocket] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Inisialisasi dan koneksi Socket.IO
  useEffect(() => {
    if (user && profile) {
      const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
      setSocket(newSocket);

      newSocket.emit("join_room", profile.user_id);

      newSocket.on("receive_message", (newMessage) => {
        if (newMessage.conversationId === conversation?.id) {
          setMessages((prev) => [...prev, newMessage]);
        }
        if (newMessage.senderId !== profile?.user_id) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      return () => newSocket.close();
    }
  }, [user, profile, conversation?.id]);

  // Mengambil riwayat percakapan
  const fetchConversation = useCallback(async () => {
    if (user) {
      try {
        const res = await api.get("/chat/conversation");
        setConversation(res.data);
        setMessages(res.data.messages || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (error) {
        console.error("Failed to fetch conversation", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  // Mengirim pesan
  const sendMessage = async (content) => {
    if (!socket || !conversation) return;

    try {
      const res = await api.post("/chat/messages", {
        conversationId: conversation.id,
        content,
      });
      setMessages((prev) => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const markAsRead = async () => {
    if (!conversation || unreadCount === 0) return;
    try {
      await api.put(`/chat/conversations/${conversation.id}/read`);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  const value = {
    messages,
    sendMessage,
    isChatReady: !!socket && !!conversation,
    unreadCount,
    markAsRead,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
