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
    socket,
    sendMessageFromAdmin,
    markConversationAsReadInState,
  } = useAdminChat();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Listener untuk pesan baru, hanya untuk jendela chat yang sedang aktif
  useEffect(() => {
    if (socket) {
      const handleReceiveMessage = (newMessage) => {
        // Hanya update jika pesan untuk percakapan yang sedang dipilih
        if (newMessage.conversationId === selectedConversationId) {
          // Tambahkan pengecekan untuk menghindari duplikasi
          setMessages((prev) => {
            if (prev && prev.find(msg => msg.id === newMessage.id)) return prev;
            return prev ? [...prev, newMessage] : [newMessage];
          });
        }
      };

      socket.on("receive_message", handleReceiveMessage);
      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [socket, selectedConversationId]);

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
      // Hapus pembaruan optimis di sini.
      // Biarkan listener socket yang menangani penambahan pesan ke UI.
      // Ini memastikan hanya ada satu sumber kebenaran (socket event).
      await sendMessageFromAdmin(
        selectedConversationId,
        content
      );
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
