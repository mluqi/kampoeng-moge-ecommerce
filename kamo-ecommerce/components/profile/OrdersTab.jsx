"use client";

import React, { useState, useEffect } from "react";
import api from "@/service/api";
import Link from "next/link";
import Image from "next/image";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const getStatusChip = (status) => {
  const statusMap = {
    pending: { class: "bg-yellow-100 text-yellow-800", label: "Menunggu" },
    processing: { class: "bg-blue-100 text-blue-800", label: "Diproses" },
    shipped: { class: "bg-indigo-100 text-indigo-800", label: "Dikirim" },
    completed: { class: "bg-green-100 text-green-800", label: "Selesai" },
    cancelled: { class: "bg-red-100 text-red-800", label: "Dibatalkan" },
    cancellation_requested: {
      class: "bg-red-100 text-red-800",
      label: "Permintaan Pembatalan",
    },
    default: { class: "bg-gray-100 text-gray-800", label: status },
  };

  return statusMap[status] || statusMap.default;
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(7);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter orders by status
  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800">Pesanan Saya</h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Semua
          </button>
          {["pending", "processing", "shipped", "completed", "cancelled"].map(
            (status) => {
              const statusInfo = getStatusChip(status);
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 text-sm rounded-full capitalize whitespace-nowrap ${
                    statusFilter === status
                      ? statusInfo.class + " font-medium"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusInfo.label}
                </button>
              );
            }
          )}
        </div>
      </div>

      {currentOrders.length > 0 ? (
        <div className="space-y-4">
          {currentOrders.map((order) => (
            <div
              key={order.order_id}
              className="border rounded-lg overflow-hidden"
            >
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleOrderExpand(order.order_id)}
              >
                <div>
                  <p className="font-bold text-gray-800">
                    Order #{order.order_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      getStatusChip(order.status).class
                    }`}
                  >
                    {getStatusChip(order.status).label}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transform transition-transform ${
                      expandedOrder === order.order_id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div
                className={`${
                  expandedOrder === order.order_id ? "block" : "hidden"
                } px-4 pb-4`}
              >
                <div className="space-y-3 mb-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={baseUrl + item.product.product_pictures[0]}
                          alt={item.product_name}
                          fill
                          className="rounded-md object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium truncate">
                          {item.product_name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Rp {item.price.toLocaleString("id-ID")} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-sm">
                      Rp{" "}
                      {order.subtotal?.toLocaleString("id-ID") ||
                        order.total_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Pengiriman</span>
                    <span className="text-sm">
                      Rp {order.shipping_cost?.toLocaleString("id-ID") || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-800">
                    <span>Total</span>
                    <span>Rp {order.total_amount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Link
                    href={`/order/${order.order_id}`}
                    className="px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent-dark transition-colors"
                  >
                    Lihat Detail Pesanan
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-full ${
                      currentPage === pageNum
                        ? "bg-accent text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            {statusFilter === "all"
              ? "Anda belum memiliki riwayat pesanan"
              : `Tidak ada pesanan dengan status ${getStatusChip(
                  statusFilter
                ).label.toLowerCase()}`}
          </h4>
          <p className="text-gray-500 mb-4">
            Semua pesanan Anda akan muncul di sini
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
          >
            Mulai Belanja
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
