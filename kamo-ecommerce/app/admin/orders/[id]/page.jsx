"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import Image from "next/image";
import api from "@/service/api";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import { assets } from "@/assets/assets";
import { FaPrint, FaTruck } from "react-icons/fa";
import toast from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ShippingInvoice = React.lazy(() => import('@/components/admin/ShippingInvoice'));

const OrderDetailContent = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [showShippingLabel, setShowShippingLabel] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/orders/admin/${id}`);
      setOrder(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat detail pesanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async () => {
    const promise = api.put(`/orders/admin/${id}/status`, {
      status: newStatus,
    });
    toast.promise(promise, {
      loading: "Memperbarui status...",
      success: (res) => {
        setOrder(res.data.order);
        return res.data.message || "Status berhasil diperbarui!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal memperbarui status.",
    });
  };

  // Approve cancellation
  const handleApproveCancel = async () => {
    const promise = api.put(`/orders/admin/${id}/approve-cancel`);
    toast.promise(promise, {
      loading: "Menyetujui pembatalan...",
      success: (res) => {
        fetchOrderDetails();
        return res.data.message || "Pesanan berhasil dibatalkan.";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menyetujui pembatalan.",
    });
  };

  // Reject cancellation
  const handleRejectCancel = async () => {
    const promise = api.put(`/orders/admin/${id}/reject-cancel`);
    toast.promise(promise, {
      loading: "Menolak pembatalan...",
      success: (res) => {
        fetchOrderDetails();
        return res.data.message || "Permintaan pembatalan ditolak.";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menolak pembatalan.",
    });
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!order) return null;

  const shippingAddress = JSON.parse(order.shipping_address);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-accent hover:underline"
        >
          &larr; Kembali ke Daftar Pesanan
        </button>
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Detail Pesanan
              </h1>
              <p className="text-sm text-gray-500">
                Order ID:{" "}
                <span className="font-medium text-gray-700">
                  {order.order_id}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="p-2 border rounded-md text-sm bg-white"
              >
                <option value="pending">Menunggu Pembayaran</option>
                <option value="processing">Diproses</option>
                <option value="shipped">Dikirim</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <button
                onClick={handleUpdateStatus}
                className="bg-accent text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Update Status
              </button>
              <button
                onClick={() => router.push(`/admin/invoice/${order.order_id}`)}
                disabled={order.status === 'pending'}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-700 disabled:bg-gray-400"
                title={order.status === 'pending' ? "Pesanan belum dibayar" : "Cetak Invoice Penjualan"}
              >
                <FaPrint /> Cetak Invoice Penjualan
              </button>
              <button
                onClick={() => setShowShippingLabel(!showShippingLabel)}
                disabled={order.status === 'pending' || order.status === 'cancelled'}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-blue-600 disabled:bg-gray-400"
                title={order.status === 'pending' || order.status === 'cancelled' ? "Tidak dapat mencetak label untuk pesanan ini" : "Cetak Label Pengiriman"}
              >
                <FaTruck /> {showShippingLabel ? 'Sembunyikan' : 'Tampilkan'} Label Pengiriman
              </button>
            </div>
          </div>
          {/* Tampilkan aksi pembatalan jika status cancellation_requested */}
          {order.status === "cancellation_requested" && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleApproveCancel}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Setujui Pembatalan
              </button>
              <button
                onClick={handleRejectCancel}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Tolak Pembatalan
              </button>
            </div>
          )}

          {/* Tampilkan alasan pembatalan jika ada */}
          {(order.status === "cancellation_requested" ||
            order.status === "cancelled") &&
            order.cancel_reason && (
              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="font-semibold text-yellow-800 mb-1">
                  Alasan Pembatalan:
                </div>
                <div className="text-yellow-900 whitespace-pre-line">
                  {order.cancel_reason}
                </div>
              </div>
            )}
        </div>

        {/* Order Status Tracker */}
        <div className="my-8">
          <OrderStatusTracker status={order.status} shippingNumber={order.shipping_number} />
        </div>

        {/* Shipping Invoice Section */}
        {showShippingLabel && <ShippingInvoice order={order} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Item Pesanan
              </h2>
              <ul className="space-y-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-100 overflow-hidden">
                      <Image
                        src={
                          item.product?.product_pictures?.[0]
                            ? baseUrl + item.product.product_pictures[0]
                            : assets.product_placeholder
                        }
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.product_name.length > 70
                          ? `${item.product_name.substring(0, 70)}...`
                          : item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x Rp{" "}
                        {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Info Pelanggan
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Nama:</strong> {order.User?.user_name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {order.User?.user_email || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Alamat Pengiriman
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-bold">{shippingAddress.address_full_name}</p>
                <p>{shippingAddress.address_phone}</p>
                <p>
                  {shippingAddress.address_area}, {shippingAddress.address_city}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Ringkasan Biaya
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Pengiriman</span>
                  <span>Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 mt-2 border-t">
                  <span>Total</span>
                  <span>Rp {order.total_amount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrderDetailPage = () => {
  return (
    <>
      {/* Navbar dan Footer bisa dihilangkan jika ini bagian dari layout admin yang berbeda */}
      {/* <Navbar /> */}
      <Suspense fallback={<Loading />}>
        <OrderDetailContent />
      </Suspense>
      {/* <Footer /> */}
    </>
  );
};

export default AdminOrderDetailPage;
