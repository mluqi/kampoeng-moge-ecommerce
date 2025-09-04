"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/service/api";
import Loading from "@/components/Loading";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { FaPrint } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const InvoicePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        setError("");
        try {
          const res = await api.get(`/orders/admin/${id}`);
          setOrder(res.data);
        } catch (err) {
          setError(
            err.response?.data?.message || "Gagal memuat detail pesanan."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-20">Pesanan tidak ditemukan.</div>;
  }

  const shippingAddress = JSON.parse(order.shipping_address);

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-section,
          #invoice-section * {
            visibility: visible;
          }
          #invoice-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="no-print mb-6 flex justify-between items-center">
            <h1 className="text-xl font-semibold">Detail Invoice</h1>
            <button
              onClick={() => window.print()}
              className="bg-accent text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-accent/90"
            >
              <FaPrint />
              Cetak
            </button>
          </div>

          <div
            id="invoice-section"
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            {/* Header */}
            <div className="flex justify-between items-start pb-6 border-b">
              <div>
                <Image
                  src={assets.logo_accent}
                  alt="Kampoeng Moge"
                  width={150}
                  height={40}
                />
                <p className="text-sm text-gray-500 mt-2">Kampoeng Moge</p>
                <p className="text-sm text-gray-500">
                  Jl. Raya Panembahan No.03, Panembahan, <br />
                  Kec. Plered, Kabupaten Cirebon, Jawa Barat
                  <br /> 45154
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold uppercase text-gray-700">
                  Invoice
                </h2>
                <p className="text-gray-500">{order.order_id}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Tanggal:{" "}
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <h3 className="font-semibold text-gray-600">
                  Ditagihkan Kepada:
                </h3>
                <p className="text-gray-800 font-medium">
                  {order.User.user_name}
                </p>
                <p className="text-gray-600">{order.User.user_email}</p>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-gray-600">Dikirim Ke:</h3>
                <p className="text-gray-800 font-medium">
                  {shippingAddress.address_full_name}
                </p>
                <p className="text-gray-600">
                  {shippingAddress.address_area}, {shippingAddress.address_city}
                </p>
                <p className="text-gray-600">{shippingAddress.address_phone}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm">
                    <th className="py-3 px-4 font-semibold">Deskripsi</th>
                    <th className="py-3 px-4 font-semibold text-center">
                      Jumlah
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Harga
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3 px-4">{item.product_name}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">
                        Rp {item.price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-full max-w-xs text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    Pengiriman ({order.shipping_method})
                  </span>
                  <span>Rp {order.shipping_cost.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Biaya Admin</span>
                  <span>
                    Rp {order.transaction_fee.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>Rp {order.total_amount.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t text-center text-gray-500 text-sm">
              <p>Terima kasih telah berbelanja di Kampoeng Moge!</p>
              <p>
                Jika ada pertanyaan, silakan hubungi kami di
                support@kampoengmoge.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;
