"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useAppContext } from "@/contexts/AppContext";
import api from "@/service/api";
import Loading from "@/components/Loading"; // Pastikan ProductCard diimpor jika belum ada
import ProductCard from "@/components/ProductCard";
import { assets, orderDummyData } from "@/assets/assets";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const ProfilePage = () => {
  const { user, profile, loading, userProfile } = useUserAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const { products, cartItems } = useAppContext();

  const [editProfileMode, setEditProfileMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const [profileMsg, setProfileMsg] = useState("");

  const [editAddressId, setEditAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({});
  const [addressMsg, setAddressMsg] = useState("");

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      await api.put("/auth/profile", profileForm);
      setProfileMsg("Profil berhasil diperbarui.");
      setEditProfileMode(false);
      await userProfile();
    } catch (err) {
      setProfileMsg(err?.response?.data?.message || "Gagal update profil.");
    }
  };

  const handleAddressEdit = (addr) => {
    setEditAddressId(addr.address_id);
    setAddressForm({
      address_id: addr.address_id,
      fullName: addr.address_full_name,
      phoneNumber: addr.address_phone,
      pincode: addr.address_pincode,
      area: addr.address_area,
      city: addr.address_city,
      state: addr.address_state,
      country: addr.address_country,
      label: addr.address_label,
      isDefault: !!addr.address_is_default,
    });
    setAddressMsg("");
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressMsg("");
    try {
      await api.put("/auth/address", addressForm);
      setAddressMsg("Alamat berhasil diperbarui.");
      setEditAddressId(null);
      await userProfile();
    } catch (err) {
      setAddressMsg(err?.response?.data?.message || "Gagal update alamat.");
    }
  };

  const processedCartItems = Object.keys(cartItems)
    .map((itemId) => {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        return {
          id: itemId,
          product: product,
          quantity: cartItems[itemId],
        };
      }
      return null;
    })
    .filter((item) => item !== null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account");
    }
  }, [user, loading, router, profile]);

  // Data dummy untuk wishlist. Nantinya ini akan diganti dengan data dari API.
  const dummyWishlist = [
    orderDummyData.length > 0 && orderDummyData[0].items.length > 0
      ? orderDummyData[0].items[0].product
      : null,
    orderDummyData.length > 1 && orderDummyData[1].items.length > 0
      ? orderDummyData[1].items[0].product
      : null,
    orderDummyData.length > 0 && orderDummyData[0].items.length > 1
      ? orderDummyData[0].items[1].product
      : null,
  ].filter(Boolean); // Menghapus item null jika data dummy tidak cukup

  if (loading || !user || !profile) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={profile.photo || assets.icon}
                alt={profile.name || "User"}
                fill
                className="rounded-full object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute inset-0 rounded-full border-2 border-transparent hover:border-accent transition-all duration-300"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.email}</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Tabs Navigation */}
            <div className="border-b border-gray-100">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "profile"
                      ? "border-accent text-accent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab("address")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "address"
                      ? "border-accent text-accent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Address
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "orders"
                      ? "border-accent text-accent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "wishlist"
                      ? "border-accent text-accent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Wishlist
                </button>
                <button
                  onClick={() => setActiveTab("cart")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "cart"
                      ? "border-accent text-accent"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Cart
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 sm:p-8">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </label>
                    {editProfileMode ? (
                      <input
                        className="border px-3 py-2 rounded w-full"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </label>
                    <p className="text-gray-900 font-medium">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </label>
                    {editProfileMode ? (
                      <input
                        className="border px-3 py-2 rounded w-full"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {profile.phone}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2 pt-4 flex gap-2">
                    {editProfileMode ? (
                      <>
                        <button
                          onClick={handleProfileSubmit}
                          className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditProfileMode(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                        onClick={() => setEditProfileMode(true)}
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  {profileMsg && (
                    <div className="md:col-span-2 text-sm mt-2 text-accent">
                      {profileMsg}
                    </div>
                  )}
                </div>
              )}
              {/* Address Tab */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Address List
                    </h3>
                    <button
                      onClick={() => router.push("/add-address")}
                      className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm font-medium"
                    >
                      + Add Address
                    </button>
                  </div>
                  {addressMsg && (
                    <div className="text-sm text-accent mb-2">{addressMsg}</div>
                  )}
                  {profile?.addresses && profile.addresses.length > 0 ? (
                    profile.addresses.map((addr) =>
                      editAddressId === addr.address_id ? (
                        <form
                          key={addr.address_id}
                          className="border p-4 rounded mb-4 space-y-2"
                          onSubmit={handleAddressSubmit}
                        >
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.fullName}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                fullName: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.phoneNumber}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                phoneNumber: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.pincode}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                pincode: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.area}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                area: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                city: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.state}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                state: e.target.value,
                              })
                            }
                            required
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.country}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                country: e.target.value,
                              })
                            }
                            placeholder="Country"
                          />
                          <input
                            className="border px-2 py-1 rounded w-full"
                            value={addressForm.label}
                            onChange={(e) =>
                              setAddressForm({
                                ...addressForm,
                                label: e.target.value,
                              })
                            }
                            placeholder="Label"
                          />
                          <div className="flex items-center space-x-2">
                            <input
                              id={`isDefault-${addr.address_id}`}
                              type="checkbox"
                              checked={addressForm.isDefault}
                              onChange={(e) =>
                                setAddressForm({
                                  ...addressForm,
                                  isDefault: e.target.checked,
                                })
                              }
                            />
                            <label htmlFor={`isDefault-${addr.address_id}`}>
                              Jadikan alamat utama
                            </label>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              type="submit"
                              className="px-3 py-1 bg-accent text-white rounded text-sm"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 bg-gray-200 rounded text-sm"
                              onClick={() => setEditAddressId(null)}
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div
                          key={addr.address_id}
                          className="border p-4 rounded mb-4"
                        >
                          <div className="font-semibold">
                            {addr.address_full_name}{" "}
                            {addr.address_is_default && (
                              <span className="text-xs bg-accent text-white px-2 py-1 rounded ml-2">
                                Utama
                              </span>
                            )}
                          </div>
                          <div>{addr.address_phone}</div>
                          <div>
                            {addr.address_area}, {addr.address_city},{" "}
                            {addr.address_state}, {addr.address_country}
                          </div>
                          <div>Kode Pos: {addr.address_pincode}</div>
                          <div>Label: {addr.address_label}</div>
                          <button
                            className="mt-2 px-3 py-1 bg-gray-900 text-white rounded text-sm"
                            onClick={() => handleAddressEdit(addr)}
                          >
                            Edit
                          </button>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-gray-500">
                      No address found. Please add your address.
                    </div>
                  )}
                </div>
              )}
              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div>
                  {dummyWishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {dummyWishlist.map((product, index) => (
                        <ProductCard
                          key={product.id || index}
                          product={product}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Your wishlist is empty
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Add products to your wishlist to see them here.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => router.push("/all-products")}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent/90 focus:outline-none"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  {orderDummyData.length > 0 ? (
                    orderDummyData.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-100 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              Order #{order._id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(order.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              Rp{order.amount.toLocaleString("id-ID")}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "processing"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="px-6 py-4">
                          <ul className="space-y-3">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                                  <Image
                                    src={item.product.image}
                                    alt={item.product.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.product.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-900">
                                    Rp
                                    {item.product.price.toLocaleString("id-ID")}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No orders
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by placing a new order.
                      </p>
                    </div>
                  )}
                </div>
              )}
              {/* Cart Tab */}
              {activeTab === "cart" && (
                <div>
                  {processedCartItems.length > 0 ? (
                    <div className="space-y-6">
                      {processedCartItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0 h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Rp{item.product.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">
                              x{item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-6 mt-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>
                            Rp
                            {processedCartItems
                              .reduce(
                                (total, item) =>
                                  total + item.product.price * item.quantity,
                                0
                              )
                              .toLocaleString("id-ID")}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                          <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium">
                            Checkout
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Your cart is empty
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start adding some products to your cart.
                      </p>
                      <div className="mt-6">
                        <button
                          onClick={() => router.push("/all-products")}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent-dark focus:outline-none"
                        >
                          Browse Products
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
