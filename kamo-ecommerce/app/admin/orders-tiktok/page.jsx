"use client";
import React, { useEffect, useState } from "react";
import { useTiktokOrder } from "@/contexts/TiktokOrderContext";
import Loading from "@/components/Loading";
import { FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";
import { useRouter } from "next/navigation";

const OrdersTiktokPage = () => {
  const router = useRouter();
  const {
    orders,
    loading,
    error,
    pagination,
    fetchTiktokOrders,
    setPagination,
  } = useTiktokOrder();
  const [pageToken, setPageToken] = useState("");

  useEffect(() => {
    fetchTiktokOrders({ page_size: 10, page_token: pageToken });
  }, [pageToken, fetchTiktokOrders]);

  const handleNextPage = () => {
    if (pagination.next_page_token) {
      setPagination((prev) => ({
        ...prev,
        prev_page_tokens: [...prev.prev_page_tokens, pageToken],
      }));
      setPageToken(pagination.next_page_token);
    }
  };

  const handlePrevPage = () => {
    // Get the last token from the history
    const prevTokens = [...pagination.prev_page_tokens];
    const lastToken = prevTokens.pop() || ""; // Go to first page if no more tokens

    setPagination((prev) => ({
      ...prev,
      prev_page_tokens: prevTokens,
    }));
    setPageToken(lastToken);
  };

  const formatUnixTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount, currency = "IDR") => {
    if (amount === undefined || amount === null) return "-";
    // The amount from TikTok API is in the smallest currency unit.
    // For IDR, this is the Rupiah itself.
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Pesanan TikTok Shop
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Pembeli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Telepon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <Loading />
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.recipient_address?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.recipient_address?.phone_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatUnixTimestamp(order.create_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-semibold">
                      {formatCurrency(
                        order.payment?.total_amount,
                        order.payment?.currency
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/admin/orders-tiktok/${order.id}`)
                        }
                        className="text-accent hover:text-accent/80 p-2 rounded-full hover:bg-accent/10"
                        title="Lihat Detail"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Total Pesanan:{" "}
            <span className="font-medium">{pagination.total_count}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={loading || pagination.prev_page_tokens.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaChevronLeft /> Sebelumnya
          </button>
          <button
            onClick={handleNextPage}
            disabled={loading || !pagination.next_page_token}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTiktokPage;
