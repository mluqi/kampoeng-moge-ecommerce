"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Image from "next/image";
import { FaPlus, FaEdit, FaTrash, FaKey, FaTimes } from "react-icons/fa";
import { assets } from "@/assets/assets";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add', 'edit', 'password'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/admins");
      setAdmins(response.data);
    } catch (error) {
      toast.error("Gagal memuat daftar admin.");
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (type, admin = null) => {
    setModalType(type);
    setSelectedAdmin(admin);
    if (type === "add") {
      setFormData({ name: "", email: "", phone: "", password: "" });
    } else if (type === "edit" && admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        password: "",
      });
    } else {
      setFormData({ password: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setFormData({ name: "", email: "", phone: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Menyimpan...");

    try {
      let response;
      if (modalType === "add") {
        if (!formData.password) {
          toast.error("Password wajib diisi untuk admin baru.", { id: toastId });
          setIsSubmitting(false);
          return;
        }
        response = await api.post("/admins", formData);
        toast.success("Admin berhasil ditambahkan.", { id: toastId });
      } else if (modalType === "edit") {
        const { name, email, phone } = formData;
        response = await api.put(`/admins/${selectedAdmin.id}`, {
          name,
          email,
          phone,
        });
        toast.success("Informasi admin berhasil diperbarui.", { id: toastId });
      } else if (modalType === "password") {
        const { password } = formData;
        if (!password || password.length < 6) {
          toast.error("Password baru minimal 6 karakter.", { id: toastId });
          setIsSubmitting(false);
          return;
        }
        response = await api.put(`/admins/${selectedAdmin.id}/password`, {
          password,
        });
        toast.success("Password admin berhasil diubah.", { id: toastId });
      }
      fetchAdmins();
      closeModal();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        "Terjadi kesalahan.";
      toast.error(errorMessage, { id: toastId });
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adminId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus admin ini?")) {
      const toastId = toast.loading("Menghapus...");
      try {
        // Note: The controller expects ID in params, not query.
        // The route is DELETE /admins/:id
        await api.delete(`/admins/${adminId}`);
        toast.success("Admin berhasil dihapus.", { id: toastId });
        fetchAdmins();
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Gagal menghapus admin.";
        toast.error(errorMessage, { id: toastId });
        console.error("Delete error:", error);
      }
    }
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "add":
      case "edit":
        return (
          <>
            <h2 className="text-xl font-bold mb-6">
              {modalType === "add" ? "Tambah Admin Baru" : "Edit Admin"}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="text" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              {modalType === 'add' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
              )}
            </div>
          </>
        );
      case "password":
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Ubah Password untuk {selectedAdmin?.name}</h2>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
              <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter.</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Akses Admin</h1>
        <button onClick={() => openModal('add')} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition font-semibold">
          <FaPlus /> Tambah Admin
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Memuat data...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Admin</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Telepon</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <Image
                        src={admin.photo ? `${baseUrl}${admin.photo}` : assets.user_icon}
                        alt={admin.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <span>{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">{admin.phone}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => openModal("edit", admin)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Info"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => openModal("password", admin)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title="Ubah Password"
                      >
                        <FaKey size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus Admin"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg m-4 relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <form onSubmit={handleSubmit}>
              {renderModalContent()}
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded bg-accent text-white hover:bg-accent/90 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage