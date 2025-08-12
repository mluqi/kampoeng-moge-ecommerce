"use client";

import React, { useState, useEffect } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        setSettings({
          footer_description: res.data.footer?.description || "",
          footer_phone: res.data.footer?.phone || "",
          footer_email: res.data.footer?.email || "",
          footer_instagram_url: res.data.footer?.instagram_url || "",
          footer_facebook_url: res.data.footer?.facebook_url || "",
          footer_tiktok_url: res.data.footer?.tiktok_url || "",
          footer_youtube_url: res.data.footer?.youtube_url || "",
        });
        setLogoPreview(
          res.data.footer?.logo_url ? res.data.footer.logo_url : ""
        );
      } catch (error) {
        toast.error("Gagal memuat pengaturan.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Tambahkan handler file
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);

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
      {
        key: "tiktok_url",
        value: settings.footer_tiktok_url,
        group: "footer",
      },
      {
        key: "youtube_url",
        value: settings.footer_youtube_url,
        group: "footer",
      },
    ];

    // Gunakan FormData jika upload file
    const formData = new FormData();
    formData.append("settings", JSON.stringify(payload));
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    const promise = api.put("/settings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

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
          {/* Logo Upload Section */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo Footer
            </label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <img
                  src={
                    logoPreview.startsWith("blob:")
                      ? logoPreview
                      : baseUrl + logoPreview
                  }
                  alt="Logo Preview"
                  className="w-32 h-auto border rounded-md bg-gray-100 p-1 object-contain"
                />
              )}
              <div className="flex flex-col">
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  <span>Ganti Logo</span>
                  <input
                    id="logo-upload"
                    name="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="sr-only"
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, SVG direkomendasikan. Maksimal ukuran 500kb.
                </p>
              </div>
            </div>
          </div>

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
          {renderInput(
            "footer_tiktok_url",
            "URL TikTok",
            "https://tiktok.com/...",
            "url"
          )}
          {renderInput(
            "footer_youtube_url",
            "URL YouTube",
            "https://youtube.com/...",
            "url"
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
