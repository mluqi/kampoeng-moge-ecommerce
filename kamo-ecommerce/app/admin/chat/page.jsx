"use client";
import React, { useState, useEffect } from "react";
import api from "@/service/api";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminChat } from "@/contexts/AdminChatContext";
import ConversationList from "@/components/admin/ConversationList";
import ChatWindow from "@/components/admin/ChatWindow";
import Loading from "@/components/Loading";

const AdminChatPage = () => {
  const { admin } = useAuth(); // Mengambil data admin yang sedang login
  const {
    conversations,
    loading: loadingConversations,
    sendMessageFromAdmin,
    markConversationAsReadInState,
  } = useAdminChat();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // [BARU] Polling untuk pesan baru di jendela chat yang aktif
  useEffect(() => {
    if (!selectedConversationId) return;

    const pollForNewMessages = async () => {
      // Jangan poll jika tab tidak aktif untuk efisiensi
      if (document.hidden) return;

      const lastMessage =
        messages && messages.length > 0 ? messages[messages.length - 1] : null;
      const lastMessageId = lastMessage ? lastMessage.id : 0;

      try {
        const res = await api.get(`/chat/admin/new-messages`, {
          params: {
            conversationId: selectedConversationId,
            lastMessageId: lastMessageId,
          },
        });

        if (res.data && res.data.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newUniqueMessages = res.data.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...prev, ...newUniqueMessages];
          });
        }
      } catch (error) {
        console.error("Polling for new messages failed", error);
      }
    };

    const intervalId = setInterval(pollForNewMessages, 3000); // Poll setiap 3 detik

    return () => clearInterval(intervalId);
  }, [selectedConversationId, messages]); // `messages` sebagai dependency

  // Fetch pesan saat percakapan dipilih
  const handleSelectConversation = async (convoId) => {
    if (convoId === selectedConversationId) return;
    setSelectedConversationId(convoId);
    setLoadingMessages(true);
    try {
      // Jalankan pengambilan pesan dan penandaan "telah dibaca" secara bersamaan
      const [messagesRes] = await Promise.all([
        api.get(`/chat/admin/conversations/${convoId}/messages`),
        api.put(`/chat/admin/conversations/${convoId}/read`),
      ]);

      setMessages(messagesRes.data);
      // Update state di context untuk menghilangkan notifikasi
      markConversationAsReadInState(convoId);
    } catch (error) {
      console.error("Failed to fetch messages or mark as read:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Kirim pesan dari admin
  const handleSendMessage = async (content) => {
    if (!selectedConversationId) return;
    try {
      // [DIUBAH] Pembaruan UI optimis
      const sentMessage = await sendMessageFromAdmin(
        selectedConversationId,
        content
      );
      // Tambahkan pesan yang baru dikirim ke state messages secara langsung
      setMessages((prev) => [...prev, sentMessage]);
    } catch (error) {
      console.error("Gagal mengirim pesan dari halaman chat:", error);
    }
  };

  if (loadingConversations) {
    return <Loading />;
  }

  return (
    <div className="flex h-full bg-gray-100">
      {/* Conversation List Wrapper */}
      <div
        className={`${
          selectedConversationId ? "hidden md:block" : "block"
        } w-full md:w-1/3 md:max-w-sm`}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>
      {/* Chat Window Wrapper */}
      <div
        className={`${
          selectedConversationId ? "block" : "hidden md:block"
        } flex-1`}
      >
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          adminId={admin?.id}
          loading={loadingMessages}
          selectedConversation={conversations.find(c => c.id === selectedConversationId)}
          onBack={() => setSelectedConversationId(null)}
        />
      </div>
    </div>
  );
};

export default AdminChatPage;
