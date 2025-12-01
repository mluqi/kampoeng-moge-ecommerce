"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FaCheck, FaBox, FaTruck, FaClipboardCheck } from "react-icons/fa";
import api from "@/service/api";

const OrderStatusTracker = ({ orderId, status, shippingNumber, createdAt, updatedAt }) => {
  const steps = [
    { name: "Pesanan Dibuat", status: "pending", icon: <FaCheck /> },
    { name: "Diproses", status: "processing", icon: <FaBox /> },
    { name: "Dikirim", status: "shipped", icon: <FaTruck /> },
    { name: "Selesai", status: "completed", icon: <FaClipboardCheck /> },
  ];

  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCnoteNotFound, setIsCnoteNotFound] = useState(false);

  const fetchTrackingInfo = useCallback(async () => {
    if (!shippingNumber) {
      setTrackingInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsCnoteNotFound(false); // Reset pada setiap fetch
    try {
      // Asumsi endpoint untuk melacak AWB adalah `/shipping/track-awb/:awb`
      const res = await api.get(`/shipping/track-awb/${shippingNumber}`);

      // API mengembalikan riwayat secara kronologis, kita ingin menampilkan yang terbaru lebih dulu.
      if (res.data && res.data.history) {
        res.data.history.reverse();
      }
      setTrackingInfo(res.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Gagal memuat riwayat pengiriman.";
      // Cek jika error spesifik 'cnote not found'
      if (errorMessage.toLowerCase().includes("cnote no. not found")) {
        setIsCnoteNotFound(true);
      } else {
        setError(errorMessage);
      }
      setTrackingInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, [shippingNumber]);

  useEffect(() => {
    fetchTrackingInfo();
  }, [fetchTrackingInfo]);

  const statusOrder = ["pending", "processing", "shipped", "completed"];
  const effectiveStatus =
    status === "cancellation_request" ? "processing" : status;
  const currentStatusIndex = statusOrder.indexOf(effectiveStatus);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "cancelled") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Status Pesanan
        </h2>
        <p className="text-red-600">Pesanan ini telah dibatalkan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">
        Status Pesanan
      </h2>

      {shippingNumber && (
        <p className="text-sm text-gray-600 mb-4">
          Nomor Resi:{" "}
          <span className="font-medium text-gray-800">{shippingNumber}</span>
        </p>
      )}

      {/* Progress Bar */}
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStatusIndex >= index;

          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center w-1/4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {step.icon}
                </div>
                <p
                  className={`mt-2 text-xs text-center font-medium ${
                    isCompleted ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mt-5 mx-2 ${
                    isCompleted ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Shipping History */}
      <div className="mt-8">
        <h3 className="text-md font-semibold text-gray-700 mb-4">
          Riwayat Pengiriman
        </h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Memuat riwayat...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : status === "pending" ? (
          <p className="text-sm text-gray-500">Belum ada pembayaran.</p>
        ) : (
          <>
            {trackingInfo &&
            trackingInfo.history &&
            trackingInfo.history.length > 0 ? (
              <div className="relative pl-4 border-l-2 border-gray-200">
                {trackingInfo.history.map((item, index) => (
                  <div key={index} className="mb-6 relative">
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${
                        index === 0
                          ? "bg-green-500 ring-4 ring-green-100"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="pl-4">
                      <p
                        className={`text-sm font-semibold ${
                          index === 0 ? "text-gray-800" : "text-gray-600"
                        }`}
                      >
                        {item.desc}
                      </p>
                      <p
                        className={`text-xs ${
                          index === 0 ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        {item.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {isCnoteNotFound ||
            (trackingInfo && trackingInfo.history.length > 0) ? (
              <div className="relative pl-4 border-l-2 border-gray-200">
                <div className="mb-6 relative">
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${
                      isCnoteNotFound
                        ? "bg-green-500 ring-4 ring-green-100"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <div className="pl-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Pengirim telah mengatur pengiriman. Menunggu pesanan
                      diserahkan ke pihak jasa kirim.
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="mb-6 relative">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300"></div>
                  <div className="pl-4">
                    <p className="text-sm font-semibold text-gray-800">
                      Pesanan Dibuat
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Riwayat pengiriman akan tersedia setelah paket diproses oleh
                kurir.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
