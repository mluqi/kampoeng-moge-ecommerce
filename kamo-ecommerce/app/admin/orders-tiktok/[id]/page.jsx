"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTiktokOrder } from "@/contexts/TiktokOrderContext";
import Loading from "@/components/Loading";
import {
  FaArrowLeft,
  FaBox,
  FaCreditCard,
  FaUser,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import Image from "next/image";

const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
      {icon}
      {title}
    </h3>
    <div className="space-y-2 text-sm text-gray-600">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right">{value || "-"}</span>
  </div>
);

const TiktokOrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { order, loading, error, fetchTiktokOrderById } = useTiktokOrder();

  useEffect(() => {
    if (id) {
      fetchTiktokOrderById(id);
    }
  }, [id, fetchTiktokOrderById]);

  const formatUnixTimestamp = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp * 1000).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const formatCurrency = (amount, currency = "IDR") => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
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

  const { recipient_address: address, payment } = order;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Detail Pesanan TikTok
            </h1>
            <p className="text-sm text-gray-500">
              ID: <span className="font-mono">{order.id}</span>
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Items */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-3">
                <FaBox className="text-accent" />
                Item Pesanan ({order.line_items?.length || 0})
              </h3>
              <div className="space-y-4">
                {order.line_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 p-3 border-b last:border-b-0"
                  >
                    <Image
                      src={item.sku_image}
                      alt={item.product_name}
                      width={64}
                      height={64}
                      className="rounded-md object-cover border"
                    />
                    <div className="flex-grow">
                      <p className="font-medium text-gray-900">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {item.seller_sku}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatCurrency(item.sale_price, item.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Info */}
            <InfoCard
              title="Alamat Pengiriman"
              icon={<FaMapMarkerAlt className="text-accent" />}
            >
              <p className="font-bold">{address?.name}</p>
              <p>{address?.phone_number}</p>
              <p className="leading-relaxed">{address?.full_address}</p>
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Order Status & Info */}
            <InfoCard
              title="Informasi Pesanan"
              icon={<FaFileInvoiceDollar className="text-accent" />}
            >
              <InfoItem label="Status" value={order.status} />
              <InfoItem
                label="Tanggal Dibuat"
                value={formatUnixTimestamp(order.create_time)}
              />
              <InfoItem
                label="Tanggal Dibayar"
                value={formatUnixTimestamp(order.paid_time)}
              />
              <InfoItem
                label="Diperbarui"
                value={formatUnixTimestamp(order.update_time)}
              />
              <InfoItem label="Pengiriman" value={order.shipping_provider} />
            </InfoCard>

            {/* Buyer Info */}
            <InfoCard
              title="Informasi Pembeli"
              icon={<FaUser className="text-accent" />}
            >
              <InfoItem label="Nama" value={address?.name} />
              <InfoItem label="Email" value={order.buyer_email} />
              <InfoItem label="Telepon" value={address?.phone_number} />
            </InfoCard>

            {/* Payment Details */}
            <InfoCard
              title="Detail Pembayaran"
              icon={<FaCreditCard className="text-accent" />}
            >
              <InfoItem label="Metode" value={order.payment_method_name} />
              <div className="pt-3 mt-3 border-t">
                <InfoItem
                  label="Subtotal Produk"
                  value={formatCurrency(
                    payment?.original_total_product_price,
                    payment?.currency
                  )}
                />
                <InfoItem
                  label="Biaya Pengiriman"
                  value={formatCurrency(
                    payment?.original_shipping_fee,
                    payment?.currency
                  )}
                />
                <InfoItem
                  label="Diskon Penjual"
                  value={formatCurrency(
                    payment?.seller_discount,
                    payment?.currency
                  )}
                />
                <InfoItem
                  label="Diskon Platform"
                  value={formatCurrency(
                    payment?.platform_discount,
                    payment?.currency
                  )}
                />
                <InfoItem
                  label="Biaya Layanan"
                  value={formatCurrency(
                    payment?.buyer_service_fee,
                    payment?.currency
                  )}
                />
                <div className="pt-3 mt-3 border-t">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>
                      {formatCurrency(payment?.total_amount, payment?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiktokOrderDetailPage;
