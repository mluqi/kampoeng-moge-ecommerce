"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import {
  FaCommentDots,
  FaPaperPlane,
  FaTimes,
  FaImage,
  FaExclamationTriangle,
} from "react-icons/fa";
import Image from "next/image";
import { assets } from "@/assets/assets";
import ProductInfoCard from "@/components/ProductInfoCard";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import { AnimatePresence, motion } from "framer-motion";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  const [imageToSend, setImageToSend] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [brokenImages, setBrokenImages] = useState(new Set());
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageToSend) || !isChatReady) return;

    try {
      await sendMessage({ content: newMessage, image: imageToSend });
      setNewMessage("");
      setImageToSend(null);
    } catch (error) {
      console.error("Gagal mengirim pesan dari widget:", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Anda bisa menambahkan validasi ukuran atau tipe file di sini
      setImageToSend(file);
    }
  };

  const handleImageClick = (url) => {
    setPreviewImageUrl(url);
  };

  const handleImageError = (url) => {
    setBrokenImages((prev) => new Set(prev).add(url));
  };

  if (!profile) return null;

  return (
    <>
      <ImagePreviewModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
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
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-2 ${
                        msg.sender_role === "user"
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
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
                      {msg.content && (
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                            msg.sender_role === "user"
                              ? "bg-accent text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-word">
                            {msg.content}{" "}
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
                      )}
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
                    <div className="flex flex-col gap-1 items-end">
                      {msg.image_url &&
                        (brokenImages.has(baseUrl + msg.image_url) ? (
                          <div className="flex items-center gap-2 p-3 bg-gray-200 border border-dashed border-gray-300 rounded-lg text-gray-600 w-48">
                            <FaExclamationTriangle className="text-yellow-500 flex-shrink-0" />
                            <span className="text-sm">
                              Gambar tidak tersedia
                            </span>
                          </div>
                        ) : (
                          <div
                            className="relative w-48 h-48 cursor-pointer"
                            onClick={() =>
                              handleImageClick(baseUrl + msg.image_url)
                            }
                          >
                            <Image
                              src={baseUrl + msg.image_url}
                              alt="Gambar chat"
                              layout="fill"
                              className="rounded-lg object-cover"
                              onError={() =>
                                handleImageError(baseUrl + msg.image_url)
                              }
                            />
                          </div>
                        ))}
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl shadow-sm ${
                          msg.sender_role === "user"
                            ? "bg-accent text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-word">
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
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick links */}

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {imageToSend && (
                <div className="relative w-20 h-20 mb-2 border rounded-md p-1">
                  <Image
                    src={URL.createObjectURL(imageToSend)}
                    alt="Preview"
                    layout="fill"
                    className="object-cover rounded"
                  />
                  <button
                    onClick={() => setImageToSend(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current.click()}
                  className="p-2 text-gray-500 hover:text-accent transition-colors disabled:opacity-50"
                  disabled={!isChatReady}
                >
                  <FaImage size={20} />
                </button>
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  disabled={!isChatReady}
                />
                <button
                  type="submit"
                  className="bg-accent text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent/90 disabled:bg-gray-300"
                  disabled={!isChatReady || (!newMessage.trim() && !imageToSend)}
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
