"use client";
import React from "react";
import Image from "next/image";
import { FaTimes } from "react-icons/fa";

const ImagePreviewModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  // Mencegah modal tertutup saat mengklik gambar itu sendiri
  const handleImageClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[120] p-4"
      onClick={onClose} // Tutup modal saat mengklik latar belakang
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-20"
      >
        <FaTimes size={28} />
      </button>
      <div
        className="relative w-full h-full max-w-4xl max-h-[85vh]"
        onClick={handleImageClick}
      >
        <Image
          src={imageUrl}
          alt="Image Preview"
          layout="fill"
          objectFit="contain"
          className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;

