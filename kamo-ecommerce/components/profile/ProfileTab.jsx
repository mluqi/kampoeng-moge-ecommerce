"use client";

import React, { useState, useEffect } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import api from "@/service/api";
import { toast } from "react-hot-toast";
import Image from "next/image";

const ProfileTab = () => {
  const { user, profile, userProfile } = useUserAuth();
  const [formData, setFormData] = useState({
    user_name: "",
    user_phone: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        user_name: profile.name || "",
        user_phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.user_name,
      phone: formData.user_phone,
    };

    try {
      await api.put("/auth/profile", payload);
      toast.success("Profil berhasil diperbarui!");
      await userProfile();
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal memperbarui profil."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p>Memuat profil...</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Detail Profil</h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-accent/90"
          >
            Edit Profil
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <Image
            src={profile.photo || "/placeholder-user.png"}
            alt="Profile"
            width={128}
            height={128}
            className="rounded-full object-cover w-32 h-32 border-4 border-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nama Lengkap
          </label>
          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nomor Telepon
          </label>
          <input
            type="tel"
            name="user_phone"
            value={formData.user_phone}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm disabled:bg-gray-50"
          />
        </div>
        {isEditing && (
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:bg-green-300"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileTab;
