"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const PlatformSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  productCount,
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "TOKOPEDIA",
    "TIKTOK_SHOP",
  ]);

  const handlePlatformChange = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleConfirm = () => {
    if (selectedPlatforms.length === 0) {
      alert("Pilih setidaknya satu platform.");
      return;
    }
    onConfirm(selectedPlatforms);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[120]">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pilih Platform Penjualan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Anda akan mengunggah {productCount} produk. Pilih platform tujuan:
        </p>

        <div className="space-y-4 mb-8">
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              className="h-5 w-5 text-accent border-gray-300 rounded focus:ring-accent"
              checked={selectedPlatforms.includes("TOKOPEDIA")}
              onChange={() => handlePlatformChange("TOKOPEDIA")}
            />
            <span className="font-medium">Tokopedia</span>
          </label>
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              className="h-5 w-5 text-accent border-gray-300 rounded focus:ring-accent"
              checked={selectedPlatforms.includes("TIKTOK_SHOP")}
              onChange={() => handlePlatformChange("TIKTOK_SHOP")}
            />
            <span className="font-medium">TikTok Shop</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedPlatforms.length === 0}
            className="px-4 py-2 rounded bg-accent text-white hover:bg-accent/90 disabled:bg-gray-400"
          >
            Lanjutkan Unggah
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlatformSelectionModal;
