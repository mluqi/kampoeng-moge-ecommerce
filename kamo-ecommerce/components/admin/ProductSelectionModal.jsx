// kamo-ecommerce/components/admin/ProductSelectionModal.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import Loading from "../Loading";
import Image from "next/image";
import { FaTimes, FaSearch } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductSelectionModal = ({ isOpen, onClose, onSelectProduct }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: {
          limit: 6,
          page: currentPage,
          search: debouncedSearchTerm,
          status: "active", // Hanya tampilkan produk yang aktif
        },
      });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Pilih Produk untuk Dikirim</h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk (nama atau SKU)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md"
          />
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loading />
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.product_id}
                onClick={() => onSelectProduct(product.product_id)}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <Image
                  src={
                    product.product_pictures?.[0]
                      ? baseUrl + product.product_pictures[0]
                      : "/placeholder.png"
                  }
                  width={50}
                  height={50}
                  alt={product.product_name}
                  className="w-14 h-14 rounded-md object-cover"
                />
                <div className="flex-1">
                  <div className="mb-1">
                    <p className="font-semibold text-gray-800 line-clamp-1">
                      {product.product_name}
                    </p>
                    <p className="text-gray-600 text-xs">
                      SKU: {product.product_sku || "Tidak tersedia"}
                    </p>
                  </div>
                  {product.product_is_discount &&
                  product.product_discount_status ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 line-through">
                          Rp {product.product_price.toLocaleString("id-ID")}
                        </p>
                        <span className="text-xs text-white bg-[#F84B62] px-1.5 py-0.5 rounded-md">
                          {product.product_discount_percentage}%
                        </span>
                      </div>
                      <p className="text-sm text-accent font-bold">
                        Rp{" "}
                        {product.product_discount_price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-accent font-medium">
                      Rp {product.product_price.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">
              Produk tidak ditemukan.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelectionModal;
