"use client";

import React, { useState } from "react";
import Image from "next/image";
import StarRating from "./StarRating";
import api from "@/service/api";
import toast from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ReviewModal = ({ item, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Rating tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);

    const promise = api.post("/reviews", {
      order_item_id: item.id,
      rating,
      comment,
    });

    toast.promise(promise, {
      loading: "Mengirim ulasan...",
      success: (res) => {
        onSuccess();
        return res.data.message;
      },
      error: (err) => {
        setIsSubmitting(false);
        return err.response?.data?.message || "Gagal mengirim ulasan.";
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-4">Beri Ulasan</h2>
        <div className="flex items-center gap-4 mb-4">
          <Image
            src={baseUrl + item.product.product_pictures[0]}
            alt={item.product_name}
            width={60}
            height={60}
            className="rounded-md object-cover"
          />
          <p className="font-medium">{item.product_name}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Anda
            </label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Komentar (Opsional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Bagaimana pendapat Anda tentang produk ini?"
            />
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
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="px-4 py-2 rounded bg-accent text-white hover:bg-accent/90 disabled:bg-accent/50"
            >
              {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
