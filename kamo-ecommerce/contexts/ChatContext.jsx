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
  const sendMessage = async (content) => {
    if (!conversation) return;

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

    // Buat pesan khusus untuk menampilkan kartu produk di UI
    // Ini adalah pesan client-side, tidak dikirim ke backend
    const productMessage = {
      id: `product-inquiry-${productInfo.id}`, // ID unik untuk rendering
      type: "product_inquiry",
      product: productInfo,
      createdAt: new Date().toISOString(),
    };

    // Tambahkan kartu produk ke daftar pesan jika belum ada
    setMessages((prev) => {
      if (prev.some((msg) => msg.id === productMessage.id)) {
        return prev;
      }
      return [...prev, productMessage];
    });

    // Kirim pesan otomatis ke admin
    sendMessage(`Halo, saya ingin bertanya tentang produk: ${productInfo.name}`);
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
