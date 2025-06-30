"use client";
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState } from "react";
import api from "@/service/api";
import { useRouter } from "next/navigation";

const AddAddress = () => {
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
    country: "",
    label: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/auth/address", address);
      setSuccess("Alamat berhasil ditambahkan!");
      setTimeout(() => {
        router.push("/profile?tab=address");
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Gagal menambahkan alamat. Silakan coba lagi."
      );
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="bg-white text-gray-700 px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-800">
            Add Shipping <span className="font-semibold text-accent">Address</span>
          </p>
          <div className="space-y-4 max-w-sm mt-10">
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="Full name"
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
              value={address.fullName}
              required
            />
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="Phone number"
              onChange={(e) =>
                setAddress({ ...address, phoneNumber: e.target.value })
              }
              value={address.phoneNumber}
              required
            />
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="Pin code"
              onChange={(e) =>
                setAddress({ ...address, pincode: e.target.value })
              }
              value={address.pincode}
              required
            />
            <textarea
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full resize-none"
              rows={4}
              placeholder="Area and Street"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
              required
            ></textarea>
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="City/District/Town"
              onChange={(e) =>
                setAddress({ ...address, city: e.target.value })
              }
              value={address.city}
              required
            />
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="State"
              onChange={(e) =>
                setAddress({ ...address, state: e.target.value })
              }
              value={address.state}
              required
            />
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="Country (optional)"
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              value={address.country}
            />
            <input
              className="px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-accent w-full"
              type="text"
              placeholder="Label (ex: Rumah, Kantor, dll)"
              onChange={(e) =>
                setAddress({ ...address, label: e.target.value })
              }
              value={address.label}
            />
            <div className="flex items-center space-x-2">
              <input
                id="isDefault"
                type="checkbox"
                checked={address.isDefault}
                onChange={(e) =>
                  setAddress({ ...address, isDefault: e.target.checked })
                }
                className="h-4 w-4 text-accent border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Jadikan alamat utama
              </label>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
          </div>
          <button
            type="submit"
            className="max-w-sm w-full mt-6 bg-accent text-white py-3 rounded-md hover:bg-accent/90 transition uppercase"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save address"}
          </button>
        </form>
        <Image
          className="md:ml-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
          width={700}
          height={700}
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;