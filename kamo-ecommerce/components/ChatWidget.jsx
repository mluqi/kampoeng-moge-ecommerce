"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { FaCommentDots, FaPaperPlane, FaTimes } from "react-icons/fa";
import Image from "next/image";
import { assets } from "@/assets/assets";


const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { messages, sendMessage, isChatReady, unreadCount, markAsRead } =
    useChat();
  const { profile } = useUserAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isChatReady) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (!profile) return null; // Hanya tampilkan jika user sudah login

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            if (newIsOpen) {
              markAsRead();
            }
          }}
          className="bg-accent text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-accent/90 transition-transform hover:scale-110"
        >
          {isOpen ? <FaTimes size={24} /> : <FaCommentDots size={24} />}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-accent text-white p-3 rounded-t-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src={assets.logo_circle}
                alt="Admin Kamo"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">Admin Kamo</h3>
              <p className="text-xs opacity-90">Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end mb-4 ${
                  msg.sender_role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-lg px-4 py-2 rounded-xl shadow-sm ${
                    msg.sender_role === "user"
                      ? "bg-accent text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p
                    className="text-sm"
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {msg.content}
                  </p>
                  <div className="text-right text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSend} className="flex items-center gap-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ketik pesan..."
                className="flex-1 p-3 border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={!isChatReady}
              />
              <button
                type="submit"
                className="bg-accent text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-accent/90 disabled:bg-gray-300"
                disabled={!isChatReady || !newMessage.trim()}
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
