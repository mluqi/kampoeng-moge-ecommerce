"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../service/api';

const ProductTiktokActions = ({ product, onActionComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Jika produk tidak terhubung dengan TikTok, tampilkan pesan.
  if (!product.product_tiktok_id) {
    return (
      <span className="text-xs text-gray-500 italic">
        Not on TikTok
      </span>
    );
  }

  const handleToggleStatus = async () => {
    setIsLoading(true);
    const isActive = product.tiktok_status === "ACTIVATE";
    const toastId = toast.loading(
      isActive ? 'Deactivating on TikTok Shop...' : 'Activating on TikTok Shop...'
    );
    try {
      if (isActive) {
        await api.post('/products/tiktok/deactivate', { product_ids: [product.product_tiktok_id] });
        toast.success('Product deactivated on TikTok Shop!', { id: toastId });
      } else {
        await api.post('/products/tiktok/activate', { product_ids: [product.product_tiktok_id] });
        toast.success('Product activated on TikTok Shop!', { id: toastId });
      }
      if (onActionComplete) onActionComplete();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update product status.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          product.tiktok_status === "ACTIVATE"
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {product.tiktok_status === "ACTIVATE" ? "Aktif" : "Tidak Aktif"}
      </span>

      {/* Toggle Switch */}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={product.tiktok_status === "ACTIVATE"}
          onChange={handleToggleStatus}
          className="sr-only peer"
          disabled={isLoading}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
      </label>
    </div>
  );
};

export default ProductTiktokActions;