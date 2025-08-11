"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import Loading from "@/components/Loading";
import Image from "next/image";
import { assets } from "@/assets/assets";
import api from "@/service/api";
import toast from "react-hot-toast";
import PaymentIframe from "@/components/PaymentIframe";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const WAREHOUSE_ORIGIN = "CBN10000";

const CheckoutPage = () => {
  const router = useRouter();
  const { user, profile, loading: userLoading } = useUserAuth();
  const {
    cartItems,
    selectedItems,
    selectedCartTotal,
    loading: cartLoading,
    clearCartState,
  } = useCart();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [jneShippingOptions, setJneShippingOptions] = useState([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const [orderTotal, setOrderTotal] = useState(0);

  const [installmentTerm, setInstallmentTerm] = useState(0);
  const [showInstallmentOptions, setShowInstallmentOptions] = useState(false);

  useEffect(() => {
    // Jangan alihkan jika sedang dalam proses membuat pesanan
    if (isPlacingOrder) return;

    if (!userLoading && !cartLoading) {
      if (!user) {
        router.replace("/account");
      } else if (selectedItems.length === 0) {
        router.replace("/cart");
      }
    }
  }, [user, selectedItems, userLoading, cartLoading, router, isPlacingOrder]);

  // Set default address from profile
  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const defaultAddress = profile.addresses.find(
        (addr) => addr.address_is_default
      );
      setSelectedAddress(defaultAddress || profile.addresses[0]);
    }
  }, [profile]);

  // Fetch payment methods from API
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPayment(true);
      try {
        const res = await api.get("/payment-methods");
        let methodsWithAdjustedFees = res.data.map((method) => {
          // Adjust fees based on payment code
          if (method.wlpay_code === "CREDIT_CARD") {
            return { ...method, admin_fee: "2000" };
          } else if (method.wlpay_code.includes("VA")) {
            return { ...method, admin_fee: "4000" };
          }
          return method;
        });
        // Move CREDIT_CARD to the end
        methodsWithAdjustedFees.sort((a, b) => {
          if (a.wlpay_code === "CREDIT_CARD") return 1;
          if (b.wlpay_code === "CREDIT_CARD") return -1;
          return 0;
        });
        setPaymentMethods(methodsWithAdjustedFees);
        if (methodsWithAdjustedFees.length > 0) {
          setSelectedPayment(methodsWithAdjustedFees[0]);
        }
      } catch (error) {
        console.error("Failed to fetch payment methods:", error);
        toast.error("Gagal memuat metode pembayaran.");
        setPaymentMethods([]);
      } finally {
        setLoadingPayment(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const itemsToCheckout = useMemo(
    () => cartItems.filter((item) => selectedItems.includes(item.product_id)),
    [cartItems, selectedItems]
  );

  const totalWeightKg = useMemo(() => {
    const totalWeight = itemsToCheckout.reduce(
      (acc, item) => acc + (item.product.product_weight || 0.5) * item.quantity,
      0
    );
    // JNE minimum weight is 1kg
    return Math.max(1, totalWeight);
  }, [itemsToCheckout]);

  // Fetch JNE shipping rates when address or cart changes
  useEffect(() => {
    if (!selectedAddress || itemsToCheckout.length === 0) {
      setJneShippingOptions([]);
      setSelectedShipping(null);
      return;
    }

    const fetchShippingRates = async () => {
      setLoadingShipping(true);
      setShippingError("");
      setJneShippingOptions([]);
      setSelectedShipping(null);

      try {
        const destination = { zipCode: selectedAddress.address_pincode };

        const res = await api.post("/shipping/rates", {
          origin: WAREHOUSE_ORIGIN,
          destination,
          weight: totalWeightKg,
        });

        console.log("JNE Shipping Rates Response:", res.data);

        const filteredData = res.data.filter(
          (opt) =>
            opt.service_code === "JTR23" ||
            opt.service_code.includes("REG") ||
            opt.service_code.includes("YES")
        );

        const formattedOptions = filteredData.map((opt) => {
          const etdString =
            opt.etd_from && opt.etd_thru
              ? opt.etd_from === opt.etd_thru
                ? opt.etd_from
                : `${opt.etd_from}-${opt.etd_thru}`
              : "-";

          return {
            ...opt,
            id: opt.service_code,
            name: `${opt.service_display} (${etdString} hari)`,
            cost: Number(opt.price || 0),
          };
        });

        setJneShippingOptions(formattedOptions);
        if (formattedOptions.length > 0) {
          setSelectedShipping(formattedOptions[0]);
        } else {
          setShippingError("Tidak ada opsi pengiriman ke alamat ini.");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Gagal memuat ongkos kirim.";
        setShippingError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShippingRates();
  }, [selectedAddress, totalWeightKg, itemsToCheckout.length]);

  const shippingCost = selectedShipping?.cost || 0;
  const [finalTotal, paymentFee] = useMemo(() => {
    let paymentFee = 0;
    const subtotalPlusShipping = selectedCartTotal + shippingCost;
    let ppn = 0;

    if (selectedPayment) {
      // Base admin fee
      paymentFee += parseFloat(selectedPayment.admin_fee || 0);

      // For credit card payments
      if (selectedPayment.wlpay_code === "CREDIT_CARD") {
        if (installmentTerm > 0) {
          // Installment fee
          if (installmentTerm === 3) {
            paymentFee += subtotalPlusShipping * 0.05;
          } else if (installmentTerm === 6) {
            paymentFee += subtotalPlusShipping * 0.07;
          } else if (installmentTerm === 12) {
            paymentFee += subtotalPlusShipping * 0.1;
          }
        } else {
          // Lunas fee 2.9%
          paymentFee += subtotalPlusShipping * 0.029;
        }
      } else {
        // For non-credit card payments
        paymentFee += parseFloat(selectedPayment.transaction_fee_va || 0);
      }
      ppn = paymentFee * 0.11;
      paymentFee += ppn;
    }

    const roundedPaymentFee = Math.ceil(paymentFee / 1000) * 1000;

    return [subtotalPlusShipping + roundedPaymentFee, roundedPaymentFee];
  }, [selectedCartTotal, shippingCost, selectedPayment, installmentTerm]);

  // Add this function to handle payment method selection
  const handlePaymentMethodSelect = (method) => {
    setSelectedPayment(method);
    setInstallmentTerm(0); // Reset installment term when changing payment method
    setShowInstallmentOptions(method.wlpay_code === "CREDIT_CARD");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Silakan pilih alamat pengiriman.");
      return;
    }
    if (!selectedShipping) {
      toast.error("Silakan pilih metode pengiriman.");
      return;
    }
    if (!selectedPayment) {
      toast.error("Silakan pilih metode pembayaran.");
      return;
    }
    if (!profile?.phone) {
      toast.error(
        "Silakan lengkapi nomor telepon di profil Anda sebelum melanjutkan."
      );
      return;
    }

    setOrderTotal(finalTotal);
    setIsPlacingOrder(true);

    const orderDetails = {
      items: itemsToCheckout.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        category: item.category,
      })),
      shippingAddress: selectedAddress,
      shippingMethod: selectedShipping,
      paymentMethod: selectedPayment.wlpay_code,
      installmentTerm:
        selectedPayment.wlpay_code === "CREDIT_CARD"
          ? installmentTerm
          : undefined,
    };

    const promise = api.post("/orders", orderDetails);

    toast.promise(promise, {
      loading: "Membuat pesanan Anda...",
      success: (res) => {
        clearCartState();
        if (res.data.invoice_url || res.data.checkout_url) {
          setPaymentUrl(res.data.invoice_url || res.data.checkout_url);
          return "Silakan lakukan pembayaran di bawah ini.";
        }
        return res.data.message || "Pesanan berhasil dibuat!";
      },
      error: (err) => {
        setIsPlacingOrder(false);
        return (
          err.response?.data?.message ||
          "Gagal membuat pesanan. Silakan coba lagi."
        );
      },
    });
  };

  if (userLoading || cartLoading || loadingPayment || !profile) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-6">
            Checkout
          </h1>
          {paymentUrl ? (
            <PaymentIframe
              paymentUrl={paymentUrl}
              paymentMethod={selectedPayment?.wlpay_nama || "N/A"}
              amount={orderTotal}
              onClose={() => router.push("/cart")}
              onLoad={() => {
                localStorage.setItem("redirectAfterXendit", "true");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Shipping and Payment */}
              <div className="lg:col-span-3 space-y-8">
                {/* Shipping Address */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Alamat Pengiriman
                  </h2>
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/50 flex justify-between items-center"
                    >
                      {selectedAddress ? (
                        <div className="text-sm">
                          <p className="font-bold">
                            {selectedAddress.address_full_name}
                          </p>
                          <p className="text-gray-500 text-xs text-sm max-w-xs md:max-w-none">
                            {selectedAddress.address_area},{" "}
                            {selectedAddress.address_city},{" "}
                            {selectedAddress.address_state}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Pilih Alamat</span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <ul className="absolute w-full bg-white border shadow-lg mt-1 z-10 rounded-md overflow-hidden">
                        {profile?.addresses?.map((address) => (
                          <li
                            key={address.address_id}
                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSelectedAddress(address);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {address.address_full_name}, {address.address_area}
                          </li>
                        ))}
                        <li
                          onClick={() => router.push("/profile?tab=address")}
                          className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-center text-accent font-medium"
                        >
                          + Kelola Alamat
                        </li>
                      </ul>
                    )}
                  </div>
                  {!selectedAddress && (
                    <p className="text-red-500 text-xs mt-2">
                      Silakan pilih atau tambahkan alamat pengiriman.
                    </p>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Metode Pengiriman
                  </h2>
                  {loadingShipping ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                      <span>Memuat opsi pengiriman...</span>
                    </div>
                  ) : shippingError ? (
                    <p className="text-red-500 text-sm">{shippingError}</p>
                  ) : jneShippingOptions.length > 0 ? (
                    <div className="space-y-3">
                      {jneShippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={selectedShipping?.id === option.id}
                            onChange={() => setSelectedShipping(option)}
                            className="h-4 w-4 text-accent focus:ring-accent"
                          />
                          <div className="ml-4 flex justify-between w-full">
                            <span className="text-sm font-medium text-gray-700">
                              {option.name}
                            </span>
                            <span className="text-sm text-gray-600">
                              Rp {option.cost.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      Pilih alamat untuk melihat opsi pengiriman.
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Metode Pembayaran
                  </h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method, index) => (
                      <div key={index}>
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:border-accent">
                          <input
                            type="radio"
                            name="payment"
                            value={method.wlpay_code}
                            checked={
                              selectedPayment?.wlpay_code === method.wlpay_code
                            }
                            onChange={() => handlePaymentMethodSelect(method)}
                            className="h-4 w-4 text-accent focus:ring-accent"
                          />
                          <Image
                            src={`${baseUrl}/${method.wlpay_logo}`}
                            alt={method.wlpay_nama}
                            width={80}
                            height={80}
                            className="ml-4 object-contain h-12"
                          />
                          <span className="ml-4 text-sm font-medium text-gray-700 flex-grow">
                            {method.wlpay_nama}
                          </span>
                          <span className="text-xs text-gray-500">
                            + Rp{" "}
                            {method.wlpay_nama === "CREDIT_CARD"
                              ? "2.000"
                              : method.wlpay_nama.includes("VA")
                              ? "4.000"
                              : parseFloat(
                                  method.admin_fee || 0
                                ).toLocaleString("id-ID")}
                          </span>
                        </label>

                        {/* Installment options for credit card */}
                        {selectedPayment?.wlpay_code === "CREDIT_CARD" &&
                          method.wlpay_code === "CREDIT_CARD" &&
                          showInstallmentOptions && (
                            <div className="ml-8 mt-2 mb-4 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Pilih Tenor Cicilan:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {[0, 3, 6, 12].map((term) => (
                                  <button
                                    key={term}
                                    type="button"
                                    onClick={() => setInstallmentTerm(term)}
                                    className={`px-3 py-1 text-sm rounded-md border ${
                                      installmentTerm === term
                                        ? "bg-accent text-white border-accent"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                    }`}
                                  >
                                    {term === 0 ? "Lunas" : `${term} Bulan`}
                                  </button>
                                ))}
                              </div>
                              {installmentTerm > 0 ? (
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                  <p>
                                    Biaya cicilan:{" "}
                                    {installmentTerm === 3
                                      ? "5%"
                                      : installmentTerm === 6
                                      ? "7%"
                                      : "10%"}{" "}
                                    dari (Subtotal + Ongkir)
                                  </p>
                                  <p>
                                    Perhitungan: (Rp
                                    {selectedCartTotal.toLocaleString(
                                      "id-ID"
                                    )}{" "}
                                    + Rp
                                    {(
                                      selectedShipping?.cost || 0
                                    ).toLocaleString("id-ID")}
                                    ) x{" "}
                                    {installmentTerm === 3
                                      ? "5%"
                                      : installmentTerm === 6
                                      ? "7%"
                                      : "10%"}{" "}
                                    = Rp
                                    {(
                                      (selectedCartTotal +
                                        (selectedShipping?.cost || 0)) *
                                      (installmentTerm === 3
                                        ? 0.05
                                        : installmentTerm === 6
                                        ? 0.07
                                        : 0.1)
                                    ).toLocaleString("id-ID")}
                                  </p>
                                </div>
                              ) : (
                                <div className="mt-2 text-xs text-gray-500 space-y-1">
                                  <p>
                                    Biaya transaksi kartu kredit: 2.9% dari
                                    (Subtotal + Ongkir)
                                  </p>
                                  <p>
                                    Perhitungan: (Rp
                                    {selectedCartTotal.toLocaleString(
                                      "id-ID"
                                    )}{" "}
                                    + Rp
                                    {(
                                      selectedShipping?.cost || 0
                                    ).toLocaleString("id-ID")}
                                    ) x 2.9% = Rp
                                    {(
                                      (selectedCartTotal +
                                        (selectedShipping?.cost || 0)) *
                                      0.029
                                    ).toLocaleString("id-ID")}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-sm sticky top-28">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-4">
                    Ringkasan Pesanan
                  </h2>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {itemsToCheckout.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={
                              item.product.product_pictures?.[0]
                                ? baseUrl + item.product.product_pictures[0]
                                : assets.product_placeholder
                            }
                            alt={item.product.product_name}
                            fill
                            className="object-cover"
                          />
                          <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">
                            {item.product.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rp{" "}
                            {item.product.product_price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          Rp{" "}
                          {(
                            item.product.product_price * item.quantity
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t space-y-6">
                    {/* Promo Code */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Kode Promo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Masukkan kode"
                          className="flex-grow w-full outline-none p-2 text-gray-600 border rounded-md focus:ring-2 focus:ring-accent/50"
                        />
                        <button className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition text-sm font-medium">
                          Pakai
                        </button>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <p>Subtotal</p>
                        <p>Rp {selectedCartTotal.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <p>Biaya Pengiriman</p>
                        <p>
                          Rp{" "}
                          {(selectedShipping?.cost || 0).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      {/* {selectedPayment?.wlpay_code === "CREDIT_CARD" && (
                        <div className="flex justify-between text-gray-600">
                          <p>
                            {installmentTerm > 0
                              ? `Biaya Cicilan (${installmentTerm} bulan)`
                              : "Biaya Transaksi Kartu Kredit"}
                          </p>
                          <p>
                            Rp{" "}
                            {(
                              (selectedCartTotal +
                                (selectedShipping?.cost || 0)) *
                              (installmentTerm === 3
                                ? 0.05
                                : installmentTerm === 6
                                ? 0.07
                                : installmentTerm === 12
                                ? 0.1
                                : 0.029)
                            ).toLocaleString("id-ID")}
                          </p>
                        </div>
                      )} */}
                      <div className="flex justify-between text-gray-600">
                        <p>Biaya Admin</p>
                        <p>Rp {paymentFee.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t mt-2">
                        <p>Total</p>
                        <p>Rp {finalTotal.toLocaleString("id-ID")}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={
                      !selectedAddress ||
                      !selectedPayment ||
                      !selectedShipping ||
                      itemsToCheckout.length === 0
                    }
                    className="w-full mt-6 bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Buat Pesanan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
