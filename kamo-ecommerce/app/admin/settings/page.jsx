"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/service/api";
import { toast } from "react-hot-toast";
import Loading from "@/components/Loading";

const SettingsPage = () => {
  const { admin } = useAuth();
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [activeServices, setActiveServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [categoryColor, setCategoryColor] = useState("#000000");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.new_password !== formData.confirm_new_password) {
      toast.error("Password baru dan konfirmasi tidak cocok.");
      setLoading(false);
      return;
    }

    const promise = api.post("/auth/admin/change-password", formData);

    toast.promise(promise, {
      loading: "Mengubah password...",
      success: (res) => {
        setLoading(false);
        setFormData({
          old_password: "",
          new_password: "",
          confirm_new_password: "",
        });
        return res.data.message || "Password berhasil diubah!";
      },
      error: (err) => {
        setLoading(false);
        return err.response?.data?.message || "Gagal mengubah password.";
      },
    });
  };

  useEffect(() => {
    const fetchActiveServices = async () => {
      try {
        const response = await api.get(
          "/settings/shipping_jne_active_services"
        );
        if (response.status === 200) {
          setActiveServices(JSON.parse(response.data.value));
        }
      } catch (error) {
        console.error(
          "Failed to fetch active shipping services:",
          error.message
        );
        toast.error("Failed to fetch active shipping services.");
      }
    };
    const fetchCategoryColour = async () => {
      try {
        const response = await api.get("/settings/category_colour");
        if (response.status === 200) {
          setCategoryColor(response.data.value || "#000000");
        }
      } catch (error) {
        console.error("Failed to fetch category colour:", error.message);
        toast.error("Failed to fetch category colour.");
      }
    };
    fetchCategoryColour();

    fetchActiveServices();
  }, []);

  // Layout admin sudah menangani pengalihan jika bukan admin,
  // jadi pengecekan ini bersifat sebagai pengaman tambahan.
  if (!admin) {
    return null;
  }

  return (
    <div className="flex-1 p-8">
      {/* Change Password Section */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Akun</h1>
      <div className="max-w-lg bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Ubah Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="old_password"
              className="block text-sm font-medium text-gray-600"
            >
              Password Lama
            </label>
            <input
              type="password"
              name="old_password"
              id="old_password"
              value={formData.old_password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-600"
            >
              Password Baru
            </label>
            <input
              type="password"
              name="new_password"
              id="new_password"
              value={formData.new_password}
              onChange={handleChange}
              required
              minLength="6"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="confirm_new_password"
              className="block text-sm font-medium text-gray-600"
            >
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              name="confirm_new_password"
              id="confirm_new_password"
              value={formData.confirm_new_password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-gray-300"
            >
              {loading ? "Menyimpan..." : "Ubah Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Colour Setting */}
      <div className="mt-12 max-w-lg bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Atur Warna Teks Kategori
        </h2>
        {/* ... deskripsi ... */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="category_colour"
              className="block text-sm font-medium text-gray-600"
            >
              Pilih Warna
            </label>
            <div className="mt-1 flex items-center gap-4">
              <input
                type="color"
                id="category_colour"
                name="category_colour"
                value={categoryColor}
                onChange={(e) => setCategoryColor(e.target.value)}
                className="h-10 w-16 p-1 border border-gray-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={categoryColor}
                onChange={(e) => setCategoryColor(e.target.value)}
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              onClick={handleUpdateColour} // <-- Di sini handle dihubungkan
              disabled={loading}
              className="py-2 px-4 bg-accent text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent/90"
            >
              {loading ? "Menyimpan..." : "Simpan Warna"}
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Service Settings */}
      <div className="mt-12 max-w-lg bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Atur Layanan Pengiriman JNE
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Layanan yang Ditampilkan:
            </label>
            <div className="mt-2 space-y-2">
              <ShippingServiceCheckbox
                label="JTR"
                value="JTR"
                checked={activeServices?.includes("JTR")}
                onChange={handleServiceChange}
              />
              <ShippingServiceCheckbox
                label="REG"
                value="REG"
                checked={activeServices?.includes("REG")}
                onChange={handleServiceChange}
              />
              <ShippingServiceCheckbox
                label="YES"
                value="YES"
                checked={activeServices?.includes("YES")}
                onChange={handleServiceChange}
              />
              {/* Tambahkan opsi layanan lain sesuai kebutuhan */}
            </div>
          </div>
          <div>
            <button
              onClick={handleUpdateServices}
              disabled={loading}
              className="py-2 px-4 bg-accent text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-accent/90"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function ShippingServiceCheckbox({ label, value, checked, onChange }) {
    return (
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          className="rounded text-accent focus:ring-accent"
          value={value}
          checked={checked}
          onChange={onChange}
        />
        <span className="text-gray-700">{label}</span>
      </label>
    );
  }

  function handleServiceChange(e) {
    const { value, checked } = e.target;

    setActiveServices((prev) => {
      if (checked) {
        return [...(prev || []), value];
      } else {
        return (prev || []).filter((s) => s !== value);
      }
    });
  }
  async function handleUpdateServices() {
    await api.put("/settings/shipping-services", { services: activeServices });
  }

  async function handleUpdateColour() {
    await api.put("/settings/category-colour", { colour: categoryColor });
  }
};

export default SettingsPage;
