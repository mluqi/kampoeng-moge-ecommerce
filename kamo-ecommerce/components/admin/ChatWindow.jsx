"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { FaPaperPlane, FaUser, FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import ProductInfoCard from "@/components/ProductInfoCard";
import Loading from "../Loading";

const ChatWindow = ({
  messages,
  onSendMessage,
  adminId,
  loading,
  selectedConversation,
  onBack,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  // Gunakan useLayoutEffect untuk memastikan scroll terjadi setelah DOM di-update
  // tapi sebelum browser melakukan paint. Ini mencegah "lompatan" visual.
  useLayoutEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
    // eslint-disable-next-line
  }, [messages]);

  // Deteksi apakah user sedang di bawah
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const threshold = 80; // px, toleransi agar tidak terlalu strict
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < threshold);
  };

  // Reset scroll ke bawah saat ganti percakapan
  useEffect(() => {
    scrollToBottom();
    setIsAtBottom(true);
    // eslint-disable-next-line
  }, [selectedConversation]);

  useEffect(() => {
    if (messages && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    if (!messages) return [];

    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.createdAt).toDateString();

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="text-gray-500 mt-2">Memuat pesan...</p>
        </div>
      </div>
    );
  }

  if (!messages) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaUser className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Pilih percakapan untuk memulai chat
            </h3>
            <p className="text-gray-500 text-sm">
              Klik pada salah satu percakapan di sebelah kiri untuk melihat
              pesan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      {selectedConversation && (
        <div className="bg-white border-b p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Tombol kembali untuk mobile */}
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-accent transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src={
                  selectedConversation.user?.user_photo ||
                  "/assets/user_icon.png"
                }
                alt={selectedConversation.user?.user_name || "User"}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {selectedConversation.user?.user_name || "User"}
              </h3>
              <p className="text-sm text-gray-500">
                {selectedConversation.user?.user_email ||
                  "Email tidak tersedia"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 p-4 overflow-y-auto"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messageGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Belum ada pesan dalam percakapan ini
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Mulai percakapan dengan mengirim pesan
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-6">
              {/* Date separator */}
              <div className="text-center mb-4">
                <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border">
                  {formatDate(group.messages[0].createdAt)}
                </span>
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg, index) => {
                const isAdmin = msg.sender_role === "admin";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end mb-4 ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex flex-col gap-1 ${
                        isAdmin ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Render ProductInfoCard if product data exists */}
                      {msg.product && (
                        <ProductInfoCard
                          product={msg.product}
                          onClick={() => {
                            router.push(`/product/${msg.product.product_id}`);
                          }}
                          className="w-full max-w-xs border border-gray-200"
                        />
                      )}

                      {/* The message bubble itself */}
                      <div
                        className={`max-w-[80%] md:max-w-lg px-4 py-2 rounded-2xl shadow-sm ${
                          isAdmin
                            ? "bg-accent text-white rounded-br-none"
                            : "bg-white text-gray-800 border rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-all">
                          {msg.content}
                        </p>
                        <div
                          className={`text-xs mt-1 opacity-70 ${
                            isAdmin ? "text-white" : "text-gray-500"
                          }`}
                        >
                          <span>{formatTime(msg.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik balasan Anda..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              rows="1"
              style={{
                minHeight: "44px",
                maxHeight: "120px",
              }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              disabled={isSending}
            />
          </div>
          <button
            type="submit"
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
              newMessage.trim() && !isSending
                ? "bg-accent text-white hover:bg-accent/90 transform hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPaperPlane className="text-sm" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
