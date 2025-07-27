"use client";

import React, { useState, useEffect } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        // Inisialisasi state dengan data yang ada atau string kosong
        setSettings({
          footer_description: res.data.footer?.description || "",
          footer_phone: res.data.footer?.phone || "",
          footer_email: res.data.footer?.email || "",
          footer_instagram_url: res.data.footer?.instagram_url || "",
          footer_facebook_url: res.data.footer?.facebook_url || "",
        });
      } catch (error) {
        toast.error("Gagal memuat pengaturan.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    // Ubah format state menjadi array yang diharapkan oleh backend
    const payload = [
      {
        key: "description",
        value: settings.footer_description,
        group: "footer",
      },
      { key: "phone", value: settings.footer_phone, group: "footer" },
      { key: "email", value: settings.footer_email, group: "footer" },
      {
        key: "instagram_url",
        value: settings.footer_instagram_url,
        group: "footer",
      },
      {
        key: "facebook_url",
        value: settings.footer_facebook_url,
        group: "footer",
      },
    ];

    const promise = api.put("/settings", payload);

    toast.promise(promise, {
      loading: "Menyimpan pengaturan...",
      success: () => {
        setIsSaving(false);
        return "Pengaturan berhasil diperbarui!";
      },
      error: (err) => {
        setIsSaving(false);
        return err.response?.data?.message || "Gagal menyimpan pengaturan.";
      },
    });
  };

  if (loading) {
    return <Loading />;
  }

  const renderInput = (name, label, placeholder, type = "text") => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={settings[name] || ""}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
      />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Situs</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent/90 transition font-semibold disabled:bg-gray-300"
        >
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 border-b pb-2">
          Pengaturan Footer
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label
              htmlFor="footer_description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Deskripsi Footer
            </label>
            <textarea
              id="footer_description"
              name="footer_description"
              value={settings.footer_description || ""}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
              placeholder="Deskripsi singkat perusahaan di footer."
            />
          </div>
          {renderInput("footer_phone", "Nomor Telepon", "+62 812...")}
          {renderInput(
            "footer_email",
            "Alamat Email",
            "info@example.com",
            "email"
          )}
          {renderInput(
            "footer_instagram_url",
            "URL Instagram",
            "https://instagram.com/...",
            "url"
          )}
          {renderInput(
            "footer_facebook_url",
            "URL Facebook",
            "https://facebook.com/...",
            "url"
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
