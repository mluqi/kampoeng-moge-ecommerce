"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import Loading from "@/components/Loading";
import Image from "next/image";
import {
  FaShoppingCart,
  FaBoxOpen,
  FaDollarSign,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center">
      <div className="p-2 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const AnalyticsCart = () => {
  const [summary, setSummary] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await api.get("/analytics/cart-summary");
      setSummary(res.data);
    } catch (err) {
      setError("Gagal memuat ringkasan analitik keranjang.");
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchCartItems = useCallback(async (page) => {
    setLoadingItems(true);
    try {
      const res = await api.get(`/analytics/cart-items?page=${page}&limit=10`);
      setCartItems(res.data.data);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      setError("Gagal memuat item keranjang.");
      console.error(err);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchCartItems(currentPage);
  }, [fetchCartItems, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-full">
      <div className="flex items-center gap-3 mb-8">
        <FaShoppingCart className="text-2xl text-accent" />
        <h1 className="text-2xl font-bold text-gray-800">Analitik Keranjang Belanja</h1>
      </div>

      {/* Summary Cards */}
      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<FaUsers size={24} />}
            title="Keranjang Aktif"
            value={summary.totalActiveCarts.toLocaleString("id-ID")}
            color="#3B82F6"
          />
          <StatCard
            icon={<FaBoxOpen size={24} />}
            title="Total Item di Keranjang"
            value={summary.totalItemsInCart.toLocaleString("id-ID")}
            color="#10B981"
          />
          <StatCard
            icon={<FaDollarSign size={24} />}
            title="Total Nilai Keranjang"
            value={formatCurrency(summary.totalValueInCart)}
            color="#F59E0B"
          />
          <StatCard
            icon={<FaShoppingCart size={24} />}
            title="Produk Teratas"
            value={summary.topProductsByFrequency[0]?.product_name || "-"}
            color="#EF4444"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products in Cart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Produk Paling Sering di Keranjang</h2>
          {loadingSummary ? (
            <Loading />
          ) : summary?.topProductsByFrequency?.length > 0 ? (
            <ul className="space-y-4">
              {summary.topProductsByFrequency.map((product, index) => (
                <li key={product.product_id} className="flex items-center gap-4">
                  <span className="font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                  <Image
                    src={product.product_pictures?.[0] ? baseUrl + product.product_pictures[0] : "/placeholder.png"}
                    alt={product.product_name}
                    width={48}
                    height={48}
                    className="w-12 h-12 object-cover rounded-md bg-gray-100"
                  />
                  <div className="flex-grow">
                    <p className="font-medium text-sm text-gray-800">{product.product_name}</p>
                    <p className="text-xs text-gray-500">Ditambahkan {product.frequency} kali</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Tidak ada data produk.</p>
          )}
        </div>

        {/* Detailed Cart Items Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-800 p-6">Semua Item di Keranjang Pengguna</h2>
          {loadingItems ? (
            <Loading />
          ) : cartItems.length > 0 ? (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengguna</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.user.user_name}</div>
                        <div className="text-xs text-gray-500">{item.user.user_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              className="h-10 w-10 rounded-md object-cover"
                              src={item.product?.product_pictures?.[0] ? baseUrl + item.product.product_pictures[0] : "/placeholder.png"}
                              alt={item.product?.product_name || "Produk"}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.product?.product_name}</div>
                            <div className="text-xs text-gray-500">{item.product?.product_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">Halaman {currentPage} dari {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">Tidak ada item di keranjang pengguna saat ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCart;