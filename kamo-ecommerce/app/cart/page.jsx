"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import Loading from "@/components/Loading";
import Link from "next/link";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import { useUserAuth } from "@/contexts/UserAuthContext";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const Cart = () => {
  const router = useRouter();
  const { user } = useUserAuth();

  const {
    cartItems,
    loading,
    updateCartItem,
    removeFromCart,
    selectedItems,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    selectedCartTotal,
  } = useCart();

  const inStockItems = useMemo(
    () => cartItems.filter((item) => item.product.product_stock > 0),
    [cartItems]
  );
  const finalTotal = useMemo(
    // Di halaman keranjang, kita hanya tampilkan total barang saja
    () => selectedCartTotal,
    [selectedCartTotal]
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Anda harus masuk untuk melihat keranjang belanja
          </h1>
          <p className="text-gray-600 mb-6">
            Silakan masuk ke akun Anda untuk melanjutkan.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90"
          >
            Masuk ke Akun
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      {/* Tambahkan padding bawah untuk mobile agar tidak tertutup floating footer */}
      <div className="min-h-[70vh] px-4 sm:px-6 lg:px-32 py-14 pb-40 lg:pb-14">
        {cartItems && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-6">
                Keranjang Belanja
              </h1>
              {/* Select All Checkbox */}
              <div className="flex items-center gap-3 p-4 border rounded-lg mb-4 bg-gray-50/50">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={
                    inStockItems.length > 0 &&
                    selectedItems.length === inStockItems.length
                  }
                  onChange={() => {
                    if (selectedItems.length === inStockItems.length) {
                      deselectAllItems();
                    } else {
                      selectAllItems();
                    }
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Pilih Semua ({selectedItems.length} / {inStockItems.length}{" "}
                  item dipilih)
                </label>
              </div>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const isOutOfStock = item.product.product_stock <= 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg ${
                        isOutOfStock ? "bg-red-50 opacity-70" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.product_id)}
                        onChange={() => toggleSelectItem(item.product_id)}
                        disabled={isOutOfStock}
                        className="flex-shrink-0 mt-1 sm:mt-0 h-5 w-5 rounded border-gray-300 text-accent focus:ring-accent cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-200"
                      />
                      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                        <Image
                          src={
                            item.product.product_pictures?.[0]
                              ? baseUrl + item.product.product_pictures[0]
                              : assets.product_placeholder
                          }
                          alt={item.product.product_name}
                          width={96}
                          height={96}
                          className="w-full h-full rounded-md object-cover bg-gray-100"
                        />
                      </div>

                      {/* Details and Actions */}
                      <div className="flex-grow flex flex-col justify-between w-full">
                        {/* Top: Name, Price, and Mobile Remove Button */}
                        <div className="flex justify-between items-start">
                          <div className="pr-4">
                            <p
                              className="font-medium text-gray-800 line-clamp-2 cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/product/${item.product.product_id}`
                                )
                              }
                            >
                              {item.product.product_name}
                            </p>
                            {isOutOfStock && (
                              <p className="text-xs font-bold text-red-600 mt-1">
                                Stok Habis
                              </p>
                            )}
                            <div className="flex flex-col items-start mt-1">
                              <div className="flex items-center gap-2">
                                {item.product.product_is_discount && (
                                  <p className="text-xs text-gray-400 line-through">
                                    Rp{" "}
                                    {item.product.product_price.toLocaleString(
                                      "id-ID"
                                    )}
                                  </p>
                                )}
                                {item.product.product_is_discount && (
                                  <p className="text-xs text-[#F84B62] font-medium bg-[#F84B62]/10 px-2 py-0.5 rounded-lg mt-1">
                                    {item.product.product_discount_percentage}%
                                  </p>
                                )}
                              </div>
                              <p
                                className={`text-sm font-semibold ${
                                  item.product.product_is_discount
                                    ? "text-[#F84B62]"
                                    : "text-gray-800"
                                }`}
                              >
                                Rp{" "}
                                {item.product.product_is_discount
                                  ? item.product.product_discount_price.toLocaleString(
                                      "id-ID"
                                    )
                                  : item.product.product_price.toLocaleString(
                                      "id-ID"
                                    )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="sm:hidden text-gray-400 hover:text-red-600 transition"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        {/* Bottom: Quantity and Subtotal */}
                        <div className="flex flex-col items-start gap-2 mt-4 sm:flex-row sm:justify-between sm:items-center">
                          <div className="flex items-center gap-3 border rounded-full px-2 py-1 self-start">
                            <button
                              onClick={() =>
                                updateCartItem(
                                  item.product_id,
                                  item.quantity - 1
                                )
                              }
                              disabled={isOutOfStock}
                              className="text-gray-500 hover:text-red-500 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              -
                            </button>
                            <span className="font-medium text-sm w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartItem(
                                  item.product_id,
                                  item.quantity + 1
                                )
                              }
                              disabled={isOutOfStock}
                              className="text-gray-500 hover:text-green-500 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-semibold text-sm text-gray-800 w-full text-right sm:w-auto sm:text-left">
                            Rp{" "}
                            {(
                              (item.product.product_is_discount
                                ? item.product.product_discount_price
                                : item.product.product_price) * item.quantity
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                      {/* Desktop Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="hidden sm:block text-gray-400 hover:text-red-600 transition self-start"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary - Desktop */}
            <div className="hidden lg:block lg:col-span-1 ">
              <div className="bg-gray-50 p-6 rounded-lg sticky top-28">
                <h2 className="text-xl font-medium text-gray-800 mb-6">
                  Ringkasan Pesanan
                </h2>
                <div className="space-y-3 text-gray-600 border-b pb-4">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>Rp {selectedCartTotal.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Biaya pengiriman dan pajak akan dihitung di halaman checkout.
                </p>
                <button
                  disabled={selectedItems.length === 0}
                  className="w-full mt-6 bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={() => router.push("/checkout")}
                >
                  Beli ({selectedItems.length})
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-16 w-16 text-gray-300"
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
            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Keranjang Anda Kosong
            </h3>
            <p className="mt-1 text-gray-500">
              Sepertinya Anda belum menambahkan produk apapun.
            </p>
            <div className="mt-6">
              <Link
                href="/all-products"
                className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90"
              >
                <FaArrowLeft />
                Mulai Belanja
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Footer - Mobile */}
      {cartItems && cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 text-sm">
              Subtotal ({selectedItems.length} item)
            </span>
            <span className="font-bold text-lg text-gray-900">
              Rp {selectedCartTotal.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            disabled={selectedItems.length === 0}
            className="w-full bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={() => router.push("/checkout")}
          >
            Lanjut ke Checkout
          </button>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Cart;
