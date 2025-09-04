"use client";

import React from "react";
import Image from "next/image";
import { FaPrint } from "react-icons/fa";
import Barcode from "react-barcode";
import { assets } from "@/assets/assets";

const ShippingInvoice = ({ order }) => {
  if (!order) return null;

  const shippingAddress = JSON.parse(order.shipping_address);

  const calculatedTotalWeight = order.items.reduce((total, item) => {
    const itemWeight = item.product?.product_weight || 0;
    const itemQuantity = item.quantity || 0;
    return total + itemWeight * itemQuantity;
  }, 0);

  const maskPhone = (phone) => {
    if (!phone) return "";
    // Ambil sisa setelah 8 digit
    const visiblePart = phone.slice(8);
    return "x".repeat(8) + visiblePart;
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A6 portrait; /* Bisa juga landscape kalau mau horizontal */
            margin: 5mm; /* margin biar tidak kepotong */
          }

          body * {
            visibility: hidden;
          }
          #shipping-invoice-section,
          #shipping-invoice-section * {
            visibility: visible;
          }
          #shipping-invoice-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 125mm; /* sesuai lebar A6 */
            height: 130mm; /* sesuai tinggi A6 */
            padding: 5mm; /* biar ga mepet */
            margin: 0;
            background: white;
            box-sizing: border-box;
          }
          .no-print {
            display: none;
          }
          #shipping-invoice-section {
            transform: scale(0.9); /* perkecil 90% */
            transform-origin: top left; /* biar nge-scale dari pojok */
          }
        }
      `}</style>

      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
        <div className="no-print mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Label Pengiriman</h2>
          <button
            onClick={() => window.print()}
            className="bg-accent text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-accent/90"
          >
            <FaPrint />
            Cetak Label
          </button>
        </div>

        <div
          id="shipping-invoice-section"
          className="border text-xs p-2 w-[400px]"
        >
          {" "}
          {/* Header dengan logo KAMO + kode order */}
          <div className="flex flex-col items-right border-b pb-1 mb-1">
            <Image
              src={assets.logo_accent}
              alt="KAMO Logo"
              width={100}
              height={40}
              className="mb-1 p-1"
            />
            <div className="text-center w-full border-t pt-1">
              <p className="text-[10px]">INV/{order.order_id}</p>
            </div>
          </div>
          {/* Barcode */}
          <div className="flex justify-center mb-2">
            {order.shipping_number && (
              <Barcode
                value={order.shipping_number}
                height={50}
                width={2}
                fontSize={12}
                margin={0}
              />
            )}
          </div>
          {/* Info method, Dropoff, Berat */}
          <div className="grid grid-cols-3 grid-rows-2 border text-[10px] text-center">
            {/* Logo JNE spanning 2 baris & 2 kolom */}
            <div className="border-r row-span-2 col-span-1 flex flex-col items-center justify-center p-3">
              <Image
                src={assets.jne_logo}
                alt="JNE Logo"
                width={45}
                height={22}
              />
              <span className="text-[9px] mt-0.5">Kurir JNE</span>
            </div>

            {/* Shipping Method (YES) */}
            <div className="border-r flex items-center justify-center font-semibold">
              {order.shipping_method.slice(0, 3)}
            </div>

            {/* Drop Off */}
            <div className=" flex items-center justify-center font-semibold">
              Drop Off
            </div>

            {/* Berat */}
            <div className="col-span-2 border-t flex items-center justify-center font-semibold">
              Berat: {calculatedTotalWeight.toFixed(1)} Kg
            </div>
          </div>
          {/* Penerima & Pengirim */}
          <div className="grid grid-cols-2 border-b text-[10px]">
            <div className="border-r p-1">
              <p>
                <b>Penerima:</b> {shippingAddress.address_full_name}
              </p>
              <p>
                {shippingAddress.address_area}, {shippingAddress.address_city}
              </p>
              <p>
                {shippingAddress.address_state},{" "}
                {shippingAddress.address_pincode}
              </p>
              <p>{maskPhone(shippingAddress.address_phone)}</p>
            </div>
            <div className="p-1">
              <p>
                <b>Pengirim:</b> Kampoengmoge
              </p>
              <p>Jl. Raya Panembahan No.03</p>
              <p>Plered, Kab. Cirebon, Jawa Barat 45154</p>
              <p>xxxxxxxx7890</p>
            </div>
          </div>
          {/* Info pembayaran */}
          <div className="flex justify-between border-b text-[10px] p-1">
            <p>Non Tunai</p>
            <p>Penjual tidak perlu bayar apapun ke kurir</p>
          </div>
          {/* Daftar Item */}
          <div className="text-[10px] p-1">
            <table className="w-full border text-[10px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-1 py-0.5">Produk</th>
                  <th className="border px-1 py-0.5">SKU</th>
                  <th className="border px-1 py-0.5">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="border px-1 py-0.5">{item.product_name}</td>
                    <td className="border px-1 py-0.5">
                      {item.product?.product_sku || "-"}
                    </td>
                    <td className="border px-1 py-0.5 text-center">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingInvoice;
