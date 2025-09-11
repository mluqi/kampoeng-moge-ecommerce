"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaLink,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
import { toast } from "react-hot-toast";

const ShareModal = ({ isOpen, onClose, shareData }) => {
  if (!isOpen || !shareData) return null;

  const { url, title, text, imageUrl } = shareData;

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text || title);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={24} className="text-green-500" />,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: <FaFacebook size={24} className="text-blue-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Instagram",
      icon: <FaInstagram size={24} className="text-pink-500" />,
      url: `https://www.instagram.com/`,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success("Link berhasil disalin!");
        onClose();
      },
      (err) => {
        toast.error("Gagal menyalin link.");
        console.error("Could not copy text: ", err);
      }
    );
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    // For desktop
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    // For mobile (bottom sheet)
    hiddenSheet: { y: "100%" },
    visibleSheet: { y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center md:items-center md:justify-center"
          onClick={onClose}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          transition={{ duration: 0.3 }}
        >
          {/* Mobile Bottom Sheet */}
          <motion.div
            className="md:hidden w-full bg-white rounded-t-2xl p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            initial="hiddenSheet"
            animate="visibleSheet"
            exit="hiddenSheet"
            variants={modalVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-center mb-4">Bagikan</h3>
            {imageUrl && (
              <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-lg">
                <Image
                  src={imageUrl}
                  alt={title}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <p className="font-medium text-gray-800 line-clamp-2">
                  {title}
                </p>
              </div>
            )}
            <div className="grid grid-cols-4 gap-4 text-center">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 hover:text-accent"
                >
                  {option.icon}
                  <span className="text-xs">{option.name}</span>
                </a>
              ))}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 text-gray-700 hover:text-accent"
              >
                <FaLink size={24} className="text-gray-500" />
                <span className="text-xs">Salin Link</span>
              </button>
            </div>
          </motion.div>

          {/* Desktop Modal */}
          <motion.div
            className="hidden md:block bg-white rounded-xl p-6 shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Bagikan</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>
            {imageUrl && (
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <Image
                  src={imageUrl}
                  alt={title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <p className="text-lg font-medium text-gray-800 line-clamp-2">
                  {title}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-4">
              Bagikan link ini melalui:
            </p>
            <div className="flex justify-around items-center mb-6">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 text-gray-700 hover:text-accent transition-colors"
                  title={`Bagikan ke ${option.name}`}
                >
                  {option.icon}
                  <span className="text-sm">{option.name}</span>
                </a>
              ))}
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 text-gray-700 hover:text-accent transition-colors cursor-pointer"
              >
                <FaLink size={24} className="text-gray-500" />
                <span className="text-xs">Salin Link</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
