"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const HomepageManagerPage = () => {
  const [activeTab, setActiveTab] = useState("login-banners");

  // State for Header Slides
  const [slides, setSlides] = useState([]);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [slideImagePreviews, setSlideImagePreviews] = useState({});

  //state for loginBanner
  const [loginBanners, setLoginBanners] = useState([]);
  const [isLoginBannerModalOpen, setIsLoginBannerModalOpen] = useState(false);
  const [currentLoginBanner, setCurrentLoginBanner] = useState(null);
  const [loginBannerImagePreview, setLoginBannerImagePreview] = useState(null);

  // Generic State
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSlides = useCallback(async () => {
    try {
      const res = await api.get("/header-slides/all");
      setSlides(res.data);
    } catch (error) {
      toast.error("Gagal memuat data slider.");
    }
  }, []);

  const fetchLoginBanners = useCallback(async () => {
    try {
      const res = await api.get("/login-banners/all");
      setLoginBanners(res.data);
      console.log(res.data);
    } catch (error) {
      toast.error("Gagal memuat data login banner.");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSlides(), fetchLoginBanners()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSlides, fetchLoginBanners]);

  // --- Modal Handlers ---
  const handleOpenSlideModal = (slide = null) => {
    setCurrentSlide(slide);
    setSlideImagePreviews({
      desktop: slide ? baseUrl + slide.image_url_desktop : null,
      mobile: slide ? baseUrl + slide.image_url_mobile : null,
    });
    setIsSlideModalOpen(true);
  };

  const handleOpenLoginBannerModal = (loginBanner = null) => {
    setCurrentLoginBanner(loginBanner);
    setLoginBannerImagePreview(
      loginBanner ? baseUrl + loginBanner.images : null
    );
    setIsLoginBannerModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsSlideModalOpen(false);
    setIsLoginBannerModalOpen(false);
    setCurrentSlide(null);
    setCurrentLoginBanner(null);
    setSlideImagePreviews({});
    setLoginBannerImagePreview(null);
  };

  // --- Form Submit Handlers ---
  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    // Pastikan backend controller Anda diupdate untuk menangani field `link`, `image_desktop`, dan `image_mobile`
    const apiCall = currentSlide
      ? api.put(`/header-slides/${currentSlide.id}`, formData)
      : api.post("/header-slides", formData);

    toast
      .promise(apiCall, {
        loading: "Menyimpan slide...",
        success: (res) => {
          fetchSlides();
          handleCloseModals();
          return res.data.message;
        },
        error: (err) => err.response?.data?.message || "Terjadi kesalahan.",
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleLoginBannerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const apiCall = currentLoginBanner
      ? api.put(`/login-banners/${currentLoginBanner.id}`, formData)
      : api.post("/login-banners", formData);

    toast
      .promise(apiCall, {
        loading: "Menyimpan login banner...",
        success: (res) => {
          fetchLoginBanners();
          handleCloseModals();
          return res.data.message;
        },
        error: (err) => err.response?.data?.message || "Terjadi kesalahan.",
      })
      .finally(() => setIsSubmitting(false));
  };

  // --- Delete Handlers ---
  const handleDelete = (type, id) => {
    let endpoint, fetcher;

    switch (type) {
      case "slide":
        endpoint = `/header-slides/${id}`;
        fetcher = fetchSlides;
        break;
      case "login-banner":
        endpoint = `/login-banners/${id}`;
        fetcher = fetchLoginBanners;
        break;
      default:
        return;
    }

    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      toast.promise(api.delete(endpoint), {
        loading: "Menghapus...",
        success: () => {
          fetcher();
          return "Berhasil dihapus!";
        },
        error: "Gagal menghapus.",
      });
    }
  };

  if (loading) return <Loading />;

  const renderInput = (
    name,
    label,
    defaultValue,
    required = false,
    type = "text"
  ) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full p-2 border border-gray-300 rounded-md"
      />
    </div>
  );

  const renderImageInput = (name, label, preview, onChange, description) => (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="flex items-center gap-4">
        {preview && (
          <Image
            src={preview}
            alt="Preview"
            width={100}
            height={60}
            className="rounded-md object-cover"
          />
        )}
        <input
          type="file"
          name={name}
          id={name}
          accept="image/*"
          onChange={onChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Pengaturan Beranda
      </h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("login-banners")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "login-banners"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Login Banner
          </button>
          <button
            onClick={() => setActiveTab("slides")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "slides"
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Header Slider
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === "login-banners" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Kelola Banner Login</h2>
              <button
                onClick={() => handleOpenLoginBannerModal()}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 font-semibold"
              >
                <FaPlus /> Tambah Banner
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Gambar</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Urutan Tampil</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loginBanners.map((loginBanner) => (
                    <tr
                      key={loginBanner.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <Image
                          src={baseUrl + loginBanner.images}
                          alt={`Banner-${loginBanner.display_order}`}
                          width={120}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            loginBanner.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {loginBanner.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {loginBanner.display_order}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() =>
                              handleOpenLoginBannerModal(loginBanner)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete("login-banner", loginBanner.id)
                            }
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
          </div>
        )}

        {activeTab === "slides" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Kelola Header Slider</h2>
              <button
                onClick={() => handleOpenSlideModal()}
                className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 font-semibold"
              >
                <FaPlus /> Tambah Slide
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Gambar Desktop</th>
                    <th className="px-6 py-3">Gambar Mobile</th>
                    <th className="px-6 py-3">Link</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {slides.map((slide) => (
                    <tr
                      key={slide.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <Image
                          src={baseUrl + slide.image_url_desktop}
                          alt="Desktop"
                          width={120}
                          height={60}
                          className="rounded-md object-contain bg-gray-100"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Image
                          src={baseUrl + slide.image_url_mobile}
                          alt="Mobile"
                          width={60}
                          height={60}
                          className="rounded-md object-contain bg-gray-100"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <a
                          href={slide.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {slide.link}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            slide.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {slide.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenSlideModal(slide)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete("slide", slide.id)}
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
          </div>
        )}
      </div>

      {/* Slide Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4">          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl m-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModals}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {currentSlide ? "Edit" : "Tambah"} Slide
            </h2>
            <form onSubmit={handleSlideSubmit} className="space-y-4">
              {renderInput(
                "link",
                "Link Tujuan (URL)",
                currentSlide?.link,
                true
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "display_order",
                  "Urutan Tampil",
                  currentSlide?.display_order || 0,
                  false,
                  "number"
                )}
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
                    defaultValue={currentSlide?.is_active ?? true}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              {renderImageInput(
                "image_desktop",
                "Gambar Desktop",
                slideImagePreviews.desktop,
                (e) =>
                  e.target.files[0] &&
                  setSlideImagePreviews((p) => ({
                    ...p,
                    desktop: URL.createObjectURL(e.target.files[0]),
                  })),
                "Rekomendasi ukuran: 1667x331  pixel."
              )}
              {renderImageInput(
                "image_mobile",
                "Gambar Mobile",
                slideImagePreviews.mobile,
                (e) =>
                  e.target.files[0] &&
                  setSlideImagePreviews((p) => ({
                    ...p,
                    mobile: URL.createObjectURL(e.target.files[0]),
                  })),
                "Rekomendasi ukuran: 339x310 pixel."
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
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

      {/* Login Banner Modal */}
      {isLoginBannerModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4">          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl m-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModals}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6">
              {currentLoginBanner ? "Edit" : "Tambah"} Login Banner
            </h2>
            <form onSubmit={handleLoginBannerSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput(
                  "display_order",
                  "Urutan Tampil",
                  currentLoginBanner?.display_order || 0,
                  false,
                  "number"
                )}
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
                    defaultValue={currentLoginBanner?.is_active ?? true}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              {renderImageInput(
                "image",
                "Gambar Login Banner",
                loginBannerImagePreview,
                (e) =>
                  e.target.files[0] &&
                  setLoginBannerImagePreview(
                    URL.createObjectURL(e.target.files[0])
                  ),
                "Rekomendasi ukuran: 961x918 pixel."
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModals}
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

export default HomepageManagerPage;
