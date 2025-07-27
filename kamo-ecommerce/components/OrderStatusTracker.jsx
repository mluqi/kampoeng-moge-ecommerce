"use client";

import React, { useState, useEffect } from "react";
import { FaCheck, FaBox, FaTruck, FaClipboardCheck } from "react-icons/fa";
import api from "@/service/api";

const OrderStatusTracker = ({ orderId, status, shippingNumber }) => {
  const steps = [
    { name: "Pesanan Dibuat", status: "pending", icon: <FaCheck /> },
    { name: "Diproses", status: "processing", icon: <FaBox /> },
    { name: "Dikirim", status: "shipped", icon: <FaTruck /> },
    { name: "Selesai", status: "completed", icon: <FaClipboardCheck /> },
  ];

  // Simulasi state dengan data dari API
  const [trackingInfo, setTrackingInfo] = useState({
    cnote: {
      cnote_no: "XXXXXXXXXXXXX",
      pod_status: "DELIVERED",
      last_status: "DELIVERED TO [WAWAN | 03-04-2022 13:31 | BANDUNG ]",
      cnote_pod_date: "2022-04-03T13:31:00.000+07:00",
    },
    history: [
      {
        date: "02-04-2022 17:45",
        desc: "SHIPMENT RECEIVED BY JNE COUNTER OFFICER AT [CIANJUR, CIANJUR]",
        code: "RC1"
      },
      {
        date: "02-04-2022 18:02",
        desc: "PICKED UP BY COURIER [CIANJUR, CIANJUR]",
        code: "PU1"
      },
      {
        date: "02-04-2022 22:21",
        desc: "PROCESSED AT SORTING CENTER [CIANJUR, SABANDAR]",
        code: "OP2"
      },
      {
        date: "03-04-2022 01:16",
        desc: "RECEIVED AT ORIGIN GATEWAY  [BANDUNG]",
        code: "TP1"
      },
      {
        date: "03-04-2022 01:31",
        desc: "RECEIVED AT WAREHOUSE   [TGG, AGEN SUKANAGARA]",
        code: "IP1"
      },
      {
        date: "03-04-2022 04:25",
        desc: "SHIPMENT FORWARDED FROM TRANSIT CITY TO DESTINATION CITY [TGG, PAGELARAN]",
        code: "OP3"
      },
      {
        date: "03-04-2022 08:10",
        desc: "WITH DELIVERY COURIER  [BANDUNG]",
        code: "IP3"
      },
      {
        date: "03-04-2022 13:31",
        desc: "DELIVERED TO [WAWAN | 03-04-2022 13:31 | BANDUNG ]",
        code: "D01"
      }
    ].reverse() // History sudah di-reverse seperti di kode asli
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const statusOrder = ["pending", "processing", "shipped", "completed"];
  const effectiveStatus = status === "cancellation_request" ? "processing" : status;
  const currentStatusIndex = statusOrder.indexOf(effectiveStatus);

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
          Nomor Resi: <span className="font-medium text-gray-800">{shippingNumber}</span>
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
        <h3 className="text-md font-semibold text-gray-700 mb-4">Riwayat Pengiriman</h3>
        {isLoading && <p className="text-sm text-gray-500">Memuat riwayat...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {trackingInfo && trackingInfo.history && (
          <div className="relative pl-4 border-l-2 border-gray-200">
            {trackingInfo.history.map((item, index) => (
              <div key={index} className="mb-6 relative">
                <div
                  className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${
                    index === 0 ? "bg-green-500 ring-4 ring-green-100" : "bg-gray-300"
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
        )}
      </div>
    </div>
  );
};

export default OrderStatusTracker;