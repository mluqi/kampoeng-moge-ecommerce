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

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, profile } = useUserAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Implementasi Long Polling untuk pesan baru
  useEffect(() => {
    if (!user || !profile || !conversation) {
      return;
    }

    const pollForNewMessages = async () => {
      // Jangan poll jika tab tidak aktif
      if (document.hidden) return;

      const lastMessage =
        messages.length > 0 ? messages[messages.length - 1] : null;
      // Gunakan ID 0 jika belum ada pesan sama sekali
      const lastMessageId = lastMessage ? lastMessage.id : 0;

      try {
        const res = await api.get(`/chat/new-messages`, {
          params: {
            conversationId: conversation.id,
            lastMessageId: lastMessageId,
          },
        });

        if (res.data && res.data.length > 0) {
          // Gabungkan pesan baru tanpa duplikasi
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newUniqueMessages = res.data.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...newUniqueMessages];
          });

          const newUnread = res.data.filter(
            (msg) => msg.sender_role !== "user"
          ).length;
          if (newUnread > 0) {
            setUnreadCount((prev) => prev + newUnread);
          }
        }
      } catch (error) {
        console.error("Polling for new messages failed", error);
      }
    };

    const intervalId = setInterval(pollForNewMessages, 3000); // Poll setiap 3 detik

    return () => clearInterval(intervalId);
  }, [user, profile, conversation, messages]); // `messages` sebagai dependency untuk mendapatkan `lastMessageId` terbaru

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
  const sendMessage = async (messageData) => { // messageData bisa berupa { content, image, product_id }
    if (!conversation) return;

    const formData = new FormData();
    formData.append("conversationId", conversation.id);
    formData.append("content", messageData.content || "");
    if (messageData.product_id) {
      formData.append("product_id", messageData.product_id);
    }
    if (messageData.image) {
      formData.append("image", messageData.image);
    }

    try {
      const res = await api.post("/chat/messages", formData);
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

  const openChat = () => {
    setIsOpen(true);
    markAsRead();
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      markAsRead();
    }
  };

  const startChatWithProduct = (productInfo) => {
    openChat();
    // Kirim pesan ke backend dengan menyertakan productId
    sendMessage({
      content: `Halo, saya ingin bertanya tentang produk: ${productInfo.name}`,
      product_id: productInfo.id,
      type: "product_inquiry", // type ini bisa opsional jika backend hanya cek `productId`
    });
  };

  const value = {
    messages,
    sendMessage,
    isChatReady: !!conversation,
    unreadCount,
    isOpen,
    toggleChat,
    openChat,
    closeChat,
    startChatWithProduct,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
