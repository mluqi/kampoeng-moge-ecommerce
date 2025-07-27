"use client";

import React from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import ProductCard from "../ProductCard";
import Link from "next/link";

const WishlistTab = () => {
  const { wishlist, loading } = useUserAuth();

  if (loading) return <p>Memuat wishlist...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Wishlist Saya</h3>
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <ProductCard key={item.product_id} product={item.product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          Wishlist Anda kosong. Mulai <Link href="/all-products" className="text-accent hover:underline">jelajahi produk</Link>!
        </p>
      )}
    </div>
  );
};

export default WishlistTab;