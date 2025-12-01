"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import Image from "next/image";
import { useUserAuth } from "@/contexts/UserAuthContext";
import api from "@/service/api";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import ReviewModal from "@/components/ReviewModal";
import { assets } from "@/assets/assets";
import toast from "react-hot-toast";
import PaymentIframe from "../../../components/PaymentIframe";
import ConfirmationModal from "@/components/ConfirmationModal";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const OrderDetailContent = () => {
  const { id } = useParams();
  const router = useRouter();
  const { cancelOrder } = useUserAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [agreeCancel, setAgreeCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState(null);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [showCompleteConfirmModal, setShowCompleteConfirmModal] =
    useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat detail pesanan.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [id, fetchOrderDetails]);

  const openReviewModal = (item) => {
    setSelectedItemForReview(item);
    setReviewModalOpen(true);
  };

  const handleCancelOrder = async () => {
    setShowCancelModal(true);
  };

  const handleSubmitCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error("Silakan isi alasan pembatalan.");
      return;
    }
    try {
      await cancelOrder(order.order_id, cancelReason);
      toast.success(
        "Permintaan pembatalan telah diajukan. Menunggu persetujuan admin."
      );
      setShowCancelModal(false);
      setAgreeCancel(false);
      setCancelReason("");
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gagal mengajukan pembatalan."
      );
    }
  };

  const handleCompleteOrder = async () => {
    setIsCompleting(true);
    try {
      await api.put(`/orders/${order.order_id}/complete`);
      toast.success("Pesanan berhasil diselesaikan!");
      setShowCompleteConfirmModal(false);
      fetchOrderDetails(); // Refresh order details
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Gagal menyelesaikan pesanan."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-accent text-white rounded"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const shippingAddress = JSON.parse(order.shipping_address);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
              <p className="text-sm text-gray-500">
                Tanggal:{" "}
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-lg font-semibold text-gray-900">
                Rp {order.total_amount.toLocaleString("id-ID")}
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  order.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "processing" ||
                      order.status === "shipped"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : order.status === "pending"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status === "pending"
                  ? "Menunggu Pembayaran"
                  : order.status}
              </span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
            {order.status === "pending" && (
              <button
                onClick={handleCancelOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Batalkan Pesanan
              </button>
            )}

            {order.status === "pending" &&
              order.payment_invoice_url &&
              order.payment_method && (
                <button
                  onClick={() => setShowPaymentIframe(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Lanjutkan Pembayaran
                </button>
              )}

            {order.status === "cancellation_requested" && (
              <div className="w-full bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium">
                Permintaan pembatalan sedang diproses admin.
              </div>
            )}
            {order.status === "shipped" && (
              <button
                onClick={() => setShowCompleteConfirmModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Selesaikan Pesanan
              </button>
            )}
            {order.status === "cancellation_requested" && (
              <div className="w-full bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium">
                Permintaan pembatalan sedang diproses admin.
              </div>
            )}
          </div>
        </div>

        {/* Payment Iframe Modal */}
        {showPaymentIframe && order.payment_invoice_url && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-xl flex flex-col overflow-hidden transform transition-all duration-300 scale-95 sm:scale-100">
              {/* Header Modal */}
              <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-3 shrink-0">
                <h3 className="text-base font-medium">
                  Pembayaran{" "}
                  <span className="font-mono">#{order.order_id}</span>
                </h3>
                <button
                  onClick={() => {
                    setShowPaymentIframe(false);
                    fetchOrderDetails();
                  }}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Tutup modal pembayaran"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Status & User Guidance */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 shrink-0">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Menunggu Pembayaran
                  </div>
                </div>
              </div>

              {/* Iframe Container - Main content area, takes available space */}
              <div
                className="flex-grow p-2 bg-gray-100 overflow-y-auto"
                style={{ minHeight: "300px", maxHeight: "calc(100vh - 220px)" }}
              >
                {" "}
                {/* Dynamic height for iframe area */}
                <PaymentIframe
                  paymentUrl={order.payment_invoice_url}
                  paymentMethod={
                    order.payment_method === "xendit"
                      ? "Virtual Account"
                      : order.payment_method
                  }
                  amount={order.total_amount}
                  className="w-full h-full border border-gray-200 rounded-md bg-white"
                  onClose={() => {
                    setShowPaymentIframe(false);
                    fetchOrderDetails();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Order Status Tracker */}
        <div className="mb-8">
          <OrderStatusTracker
            orderId={order.order_id}
            status={order.status}
            shippingNumber={order.shipping_number}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping & Payment Details */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Alamat Pengiriman
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-bold">{shippingAddress.address_full_name}</p>
                <p>{shippingAddress.address_phone}</p>
                <p>
                  {shippingAddress.address_area}, {shippingAddress.address_city}
                  , {shippingAddress.address_state}{" "}
                  {shippingAddress.address_pincode}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Info Pembayaran & Pengiriman
              </h2>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Metode Pembayaran:</strong> {order.payment_method}
                </p>
                <p>
                  <strong>Metode Pengiriman:</strong> {order.shipping_method}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
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
                    <p className="text-sm font-medium text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </p>
                  {/* Tombol Beri Ulasan */}
                  {order.status === "completed" && (
                    <div className="ml-auto pl-4">
                      {item.reviews ? (
                        <span className="text-xs text-green-600 font-semibold">
                          Ulasan Diberikan
                        </span>
                      ) : (
                        <button
                          onClick={() => openReviewModal(item)}
                          className="text-xs bg-accent text-white px-3 py-1 rounded-full hover:bg-accent/90"
                        >
                          Beri Ulasan
                        </button>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {/* Price Summary */}
            <div className="mt-6 pt-6 border-t text-sm space-y-2">
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

      {/* Modal Ulasan */}
      {isReviewModalOpen && selectedItemForReview && (
        <ReviewModal
          item={selectedItemForReview}
          onClose={() => setReviewModalOpen(false)}
          onSuccess={() => {
            fetchOrderDetails();
            setReviewModalOpen(false);
          }}
        />
      )}

      {/* Modal Konfirmasi Pembatalan */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Konfirmasi Pembatalan</h2>
            <p className="mb-4 text-gray-700">
              Apakah Anda yakin ingin mengajukan pembatalan pesanan ini?
              Permintaan Anda akan diproses oleh admin.
            </p>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={agreeCancel}
                onChange={(e) => setAgreeCancel(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Saya menyetujui syarat dan ketentuan pembatalan pesanan.
              </span>
            </label>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alasan Pembatalan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Tulis alasan pembatalan pesanan Anda..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setAgreeCancel(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitCancel}
                disabled={!agreeCancel || !cancelReason.trim()}
                className={`px-4 py-2 rounded text-white ${
                  agreeCancel && cancelReason.trim()
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-300 cursor-not-allowed"
                }`}
              >
                Ajukan Pembatalan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Selesaikan Pesanan */}
      <ConfirmationModal
        isOpen={showCompleteConfirmModal}
        onClose={() => setShowCompleteConfirmModal(false)}
        onConfirm={handleCompleteOrder}
        title="Selesaikan Pesanan"
        message="Apakah Anda yakin ingin menyelesaikan pesanan ini? Pastikan Anda telah menerima dan memeriksa semua produk. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Selesaikan"
        cancelText="Batal"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        isConfirming={isCompleting}
      />
    </div>
  );
};

const OrderDetailPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loading />}>
        <OrderDetailContent />
      </Suspense>
      <Footer />
    </>
  );
};

export default OrderDetailPage;
