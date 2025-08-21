"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserAuth } from "@/contexts/UserAuthContext";
import api from "@/service/api";
import { toast } from "react-hot-toast";
import { FaPencilAlt, FaTrash, FaCheckCircle } from "react-icons/fa";

const AddressTab = () => {
  const router = useRouter();
  const { profile, userProfile } = useUserAuth();

  useEffect(() => {
    // Memuat ulang data profil untuk memastikan daftar alamat selalu terbaru
    // saat komponen ini ditampilkan.
    userProfile();
  }, []);

  const handleDelete = async (addressId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      try {
        const res = await api.delete(`/auth/address/${addressId}`);
        toast.success("Alamat berhasil dihapus.");
        userProfile();
      } catch (error) {
        toast.error(error.response?.data?.message || "Gagal menghapus alamat.");
      }
    }
  };

  const setDefault = async (addressId) => {
    try {
      await api.patch(`/auth/address/${addressId}/default`, {
        addressId,
      });
      toast.success("Alamat utama berhasil diatur.");
      userProfile();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal mengatur alamat utama."
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Buku Alamat</h3>
        <button
          onClick={() => router.push("/add-address")}
          className="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent/90"
        >
          + Tambah Alamat
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {profile?.addresses?.length > 0 ? (
          profile.addresses.map((addr) => (
            <div
              key={addr.address_id}
              className="border p-4 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">{addr.address_full_name}</p>
                <p className="text-sm text-gray-600">{addr.address_phone}</p>
                <p className="text-sm text-gray-600">
                  {addr.address_area}, {addr.address_city}, {addr.address_state}{" "}
                  {addr.address_pincode}
                </p>
                {addr.address_is_default ? (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1">
                    <FaCheckCircle /> Alamat Utama
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 items-end">
                {!addr.address_is_default && (
                  <button
                    key={`default-${addr.address_id}`}
                    onClick={() => setDefault(addr.address_id)}
                    className="text-xs text-accent hover:underline"
                  >
                    Atur sebagai utama
                  </button>
                )}
                <button
                  key={`delete-${addr.address_id}`}
                  onClick={() => handleDelete(addr.address_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
                <button
                  key={`edit-${addr.address_id}`}
                  onClick={() =>
                    router.push(`/profile/edit-address/${addr.address_id}`)
                  }
                  className="text-accent hover:text-acent/80"
                >
                  <FaPencilAlt />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            Anda belum memiliki alamat tersimpan.
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressTab;
