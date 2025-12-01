"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import api from "@/service/api";
import StatusBadge from "@/components/admin/StatusBadge";
import { FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Image from "next/image";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null); // State untuk accordion
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchAdminOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: debouncedSearchTerm,
      });
      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch orders for admin:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    fetchAdminOrders();
  }, [fetchAdminOrders]);

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8">
      <h2 className="text-xl font-semibold mb-6">Manajemen Pesanan</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari berdasarkan Order ID atau SKU Produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border rounded-md text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded-md text-sm bg-white"
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                    {order.items && order.items.length > 0 ? ( // Check if order.items exists and has length
                      <div className="flex flex-col">
                        {/* Display first product */}
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              src={
                                order.items[0].product?.product_pictures?.[0]
                                  ? baseUrl +
                                    order.items[0].product.product_pictures[0]
                                  : "/no-image.png"
                              }
                              alt={
                                order.items[0].product?.product_name ||
                                "Product Image"
                              }
                              width={40}
                              height={40}
                              className="object-cover rounded-md"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.items[0].product?.product_name.length > 25
                                ? `${order.items[0].product.product_name.substring(
                                    0,
                                    25
                                  )}...`
                                : order.items[0].product?.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {order.items[0].product?.product_id} | SKU:{" "}
                              {order.items[0].product?.product_sku}
                            </div>
                          </div>
                        </div>
                        {/* If more than one product, show a button to expand */}
                        {order.items.length > 1 && (
                          <button
                            onClick={() =>
                              setExpandedOrder(
                                expandedOrder === order.order_id
                                  ? null
                                  : order.order_id
                              )
                            }
                            className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {expandedOrder === order.order_id ? (
                              <FaChevronUp size={10} />
                            ) : (
                              <FaChevronDown size={10} />
                            )}{" "}
                            Lihat {order.items.length - 1} produk lainnya
                          </button>
                        )}
                        {/* Accordion for additional products */}
                        {expandedOrder === order.order_id && (
                          <div className="mt-2 space-y-2">
                            {order.items.slice(1).map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center ml-4"
                              >
                                <Image
                                  src={
                                    item.product?.product_pictures?.[0]
                                      ? baseUrl +
                                        item.product.product_pictures[0]
                                      : "/no-image.png"
                                  }
                                  alt={
                                    item.product?.product_name ||
                                    "Product Image"
                                  }
                                  width={30}
                                  height={30}
                                  className="object-cover rounded-md"
                                />
                                <div className="ml-2">
                                  <div className="text-xs text-gray-700">
                                    {item.product?.product_name.length > 25
                                      ? `${item.product.product_name.substring(
                                          0,
                                          25
                                        )}...`
                                      : item.product?.product_name}{" "}
                                    (x{item.quantity})
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {item.product?.product_id} | SKU:{" "}
                                    {item.product?.product_sku}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">
                        Tidak ada item
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {order.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.User?.user_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {order.total_amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        router.push(`/admin/orders/${order.order_id}`)
                      }
                      className="text-accent hover:underline cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="text-center p-6 text-gray-500">
              Tidak ada pesanan yang ditemukan.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <span>
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded-md text-sm disabled:opacity-50"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
};

export default Orders;
