"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import {
  FaCommentDots,
  FaPaperPlane,
  FaTimes,
  FaQuestionCircle,
  FaPhone,
} from "react-icons/fa";
import Image from "next/image";
import { assets } from "@/assets/assets";
import ProductInfoCard from "@/components/ProductInfoCard";
import { AnimatePresence, motion } from "framer-motion";

const ChatWidget = () => {
  const router = useRouter();
  const [newMessage, setNewMessage] = useState("");

  const {
    isOpen,
    toggleChat,
    closeChat,
    messages,
    sendMessage,
    isChatReady,
    unreadCount,
  } = useChat();

  const { profile } = useUserAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() && isChatReady) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  if (!profile) return null;

  return (
    <>
      <div className="fixed lg:bottom-6 md:bottom-6 bottom-20 right-6 z-50 ">
        <button
          onClick={toggleChat}
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="fixed lg:bottom-6 md:bottom-6 bottom-0 lg:right-5 md:right-5 right-0 lg:w-96 md:w-96 w-full lg:h-[44rem] md:h-[42rem] h-full bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200"
          >
            {/* Header with brand info */}
            <div className="bg-gray-800 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
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
                    <h3 className="font-bold text-lg">Kampoeng Moge</h3>
                    <p className="text-xs opacity-90">
                      Indonesia's Premium Motorcycle Marketplace
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeChat}
                  className="p-1 hover:bg-white/20 rounded-full"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              {/* <div className="text-xs opacity-80 flex justify-between items-center">
                <span>11:19 AM</span>
                <span>Online</span>
              </div> */}
            </div>

            {/* Messages area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
              {/* Welcome message */}
              <div className="flex justify-start">
                <div className="max-w-xs bg-white text-gray-800 px-4 py-3 rounded-xl rounded-bl-none shadow-sm border border-gray-200">
                  <p className="text-sm">
                    Hello, thank you for contacting Kampoeng Moge. We're happy
                    to help you with your motorcycle needs.
                  </p>
                  <p className="text-sm mt-2">
                    Our operating hours are 08.00 - 21.00 WIB.
                  </p>
                  <div className="text-right text-xs mt-2 opacity-70">
                    11:19 AM
                  </div>
                </div>
              </div>

              {/* User messages */}
              {messages.map((msg) => {
                // Jika pesan memiliki data produk, tampilkan kartu DAN pesannya.
                if (msg.product) {
                  return (
                    <div key={msg.id} className="space-y-2">
                      <div className="flex justify-center">
                        <ProductInfoCard
                          product={msg.product}
                          onClick={() => {
                            router.push(`/product/${msg.product.product_id}`);
                            closeChat();
                          }}
                          className="w-full max-w-xs border border-gray-200"
                        />
                      </div>
                      {/* Pesan teks yang menyertainya */}
                      <div
                        className={`flex items-end ${
                          msg.sender_role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                            msg.sender_role === "user"
                              ? "bg-accent text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p
                            className="text-sm"
                            style={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.content}
                          </p>
                          <div className="text-right text-xs mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "id-ID",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Pesan biasa tanpa produk
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end ${
                      msg.sender_role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                        msg.sender_role === "user"
                          ? "bg-accent text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                      }`}
                    >
                      <p
                        className="text-sm"
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
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
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick links */}
            {/* <div className="flex border-t border-gray-200 bg-gray-100">
              <button className="flex-1 py-2 text-xs text-gray-600 hover:text-accent flex items-center justify-center gap-1">
                <FaQuestionCircle /> FAQ
              </button>
              <button className="flex-1 py-2 text-xs text-gray-600 hover:text-accent flex items-center justify-center gap-1">
                <FaPhone /> Contact Us
              </button>
            </div> */}

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-full text-base md:text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={!isChatReady}
                  style={{ fontSize: "16px" }} // Tambahkan ini
                />
                <button
                  type="submit"
                  className="bg-accent text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent/90 disabled:bg-gray-300"
                  disabled={!isChatReady || !newMessage.trim()}
                >
                  <FaPaperPlane size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
