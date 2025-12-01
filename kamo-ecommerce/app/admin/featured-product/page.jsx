"use client";

import React, { useState, useEffect } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const FeaturedProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [aspectRatioPreview, setAspectRatioPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/featured-products/all");
      setProducts(res.data);
    } catch (error) {
      toast.error("Gagal memuat produk unggulan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setImagePreview(product ? baseUrl + product.image_url : null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setImagePreview(null);
    setAspectRatioPreview(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      const promise = api.delete(`/featured-products/${id}`);
      toast.promise(promise, {
        loading: "Menghapus...",
        success: () => {
          fetchProducts();
          return "Berhasil dihapus!";
        },
        error: "Gagal menghapus.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const isEditing = !!currentProduct;

    const apiCall = isEditing
      ? api.put(`/featured-products/${currentProduct.id}`, formData)
      : api.post("/featured-products", formData);

    const promise = toast.promise(apiCall, {
      loading: "Menyimpan...",
      success: (res) => {
        fetchProducts();
        handleCloseModal();
        return res.data.message;
      },
      error: (err) => err.response?.data?.message || "Terjadi kesalahan.",
    });

    promise.finally(() => setIsSubmitting(false));
  };

  // Modal preview handlers
  const openPreviewModal = (imageUrl) => {
    setPreviewImage(imageUrl);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setPreviewImage(null);
    setIsPreviewModalOpen(false);
  };

  // Fungsi untuk membuat preview dengan aspect ratio
  const createAspectRatioPreview = (file, aspectRatio, callback) => {
    if (!file) {
      callback(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Update fungsi handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview gambar biasa
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Preview dengan aspect ratio (1:1 untuk produk unggulan)
    createAspectRatioPreview(file, "1/1", (preview) => {
      setAspectRatioPreview(preview);
    });
  };

  const AspectRatioPreview = ({ imageUrl, aspectRatio, title }) => {
    if (!imageUrl) return null;

    return (
      <div className="mt-2 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm font-medium text-gray-700 mb-2">{title}</p>
        <div
          className="mx-auto bg-gray-200 overflow-hidden relative"
          style={{
            width: "100%",
            maxWidth: "100px",
            aspectRatio: aspectRatio,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 border border-dashed border-gray-400"></div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Preview area tampilan (ratio: {aspectRatio})
        </p>
      </div>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produk Unggulan</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 transition font-semibold"
        >
          <FaPlus /> Tambah Baru
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Gambar</th>
              <th className="px-6 py-3">Judul</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Urutan</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <Image
                    src={baseUrl + product.image_url}
                    alt={product.title}
                    width={80}
                    height={60}
                    className="rounded-md object-cover cursor-pointer"
                    onClick={() =>
                      openPreviewModal(baseUrl + product.image_url)
                    }
                  />
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {product.title}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-6 py-4">{product.display_order}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4 overflow-y-auto">
          {" "}
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl m-4 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {currentProduct ? "Edit" : "Tambah"} Produk Unggulan
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Judul
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={currentProduct?.title}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="button_text"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Teks Tombol
                  </label>
                  <input
                    type="text"
                    name="button_text"
                    id="button_text"
                    defaultValue={currentProduct?.button_text}
                    placeholder="e.g., Lihat Sekarang"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  id="description"
                  defaultValue={currentProduct?.description}
                  required
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="button_link"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Link Tombol
                </label>
                <input
                  type="text"
                  name="button_link"
                  id="button_link"
                  defaultValue={currentProduct?.button_link}
                  placeholder="e.g., /shop"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="display_order"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    id="display_order"
                    defaultValue={currentProduct?.display_order || 0}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label
                    htmlFor="is_active"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    name="is_active"
                    id="is_active"
                    defaultValue={currentProduct?.is_active ?? true}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gambar
                </label>
                <p className="text-xs text-gray-500 mb-2">Rekomendasi ukuran ratio 3:4</p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={100}
                        height={75}
                        className="rounded-md object-cover cursor-pointer"
                        onClick={() => openPreviewModal(imagePreview)}
                      />
                    )}
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                    />
                  </div>

                  {/* Tambahkan preview aspect ratio */}
                  {aspectRatioPreview && (
                    <AspectRatioPreview
                      imageUrl={aspectRatioPreview}
                      aspectRatio="3/4"
                      title="Preview Tampilan Aktual (Akan Dikrop ke Ratio 3:4)"
                    />
                  )}

                  {!currentProduct && (
                    <p className="text-xs text-gray-500 mt-1">
                      Gambar wajib diisi untuk item baru. Gambar akan dikrop ke
                      ratio 1:1.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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

      {/* Image Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
          <div className="bg-transparent rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={closePreviewModal}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 z-10 cursor-pointer"
              >
                <FaTimes size={20} />
              </button>
              {previewImage && (
                <div className="p-4">
                  <Image
                    src={previewImage}
                    alt="Preview"
                    width={1000}
                    height={1000}
                    className="rounded-md object-contain w-full max-h-[70vh]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsAdminPage;
