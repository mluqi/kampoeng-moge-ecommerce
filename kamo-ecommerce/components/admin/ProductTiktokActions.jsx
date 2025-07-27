"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../service/api';
import { FaPlay, FaPause } from 'react-icons/fa';

const ProductTiktokActions = ({ product, onActionComplete }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Jika produk tidak terhubung dengan TikTok, tampilkan pesan.
  if (!product.product_tiktok_id) {
    return (
      <span className="text-xs text-gray-500 italic">
        Not on TikTok
      </span>
    );
  }

  const handleActivate = async (e) => {
    e.stopPropagation(); // Mencegah event klik pada baris tabel
    setIsActivating(true);
    const toastId = toast.loading('Activating on TikTok Shop...');
    try {
      await api.post('/products/tiktok/activate', { product_ids: [product.product_tiktok_id] });
      toast.success('Product activated on TikTok Shop!', { id: toastId });
      if (onActionComplete) onActionComplete(); // Panggil callback untuk refresh data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to activate product.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async (e) => {
    e.stopPropagation();
    setIsDeactivating(true);
    const toastId = toast.loading('Deactivating on TikTok Shop...');
    try {
      await api.post('/products/tiktok/deactivate', { product_ids: [product.product_tiktok_id] });
      toast.success('Product deactivated on TikTok Shop!', { id: toastId });
      if (onActionComplete) onActionComplete();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to deactivate product.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleActivate}
        disabled={isActivating || isDeactivating}
        className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Activate on TikTok Shop"
      >
        <FaPlay className="h-2 w-2" />
        <span>{isActivating ? 'Activating...' : 'Activate'}</span>
      </button>
      <button
        onClick={handleDeactivate}
        disabled={isActivating || isDeactivating}
        className="flex items-center gap-1.5 text-xs bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-2 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        title="Deactivate on TikTok Shop"
      >
        <FaPause className="h-2 w-2" />
        <span>{isDeactivating ? 'Deactivating...' : 'Deactivate'}</span>
      </button>
    </div>
  );
};

export default ProductTiktokActions;

