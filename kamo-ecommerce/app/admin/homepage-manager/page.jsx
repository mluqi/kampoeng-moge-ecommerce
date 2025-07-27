"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { FaEdit, FaTrash, FaPlus, FaTimes } from "react-icons/fa";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const HomepageManagerPage = () => {
  const [activeTab, setActiveTab] = useState('slides');

  // State for Header Slides
  const [slides, setSlides] = useState([]);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [slideImagePreview, setSlideImagePreview] = useState(null);

  // State for Promo Banners
  const [banners, setBanners] = useState([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [bannerImagePreviews, setBannerImagePreviews] = useState({});

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

  const fetchBanners = useCallback(async () => {
    try {
      const res = await api.get("/banners/all");
      setBanners(res.data);
    } catch (error) {
      toast.error("Gagal memuat data banner.");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSlides(), fetchBanners()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSlides, fetchBanners]);

  // --- Modal Handlers ---
  const handleOpenSlideModal = (slide = null) => {
    setCurrentSlide(slide);
    setSlideImagePreview(slide ? baseUrl + slide.image_url : null);
    setIsSlideModalOpen(true);
  };

  const handleOpenBannerModal = (banner = null) => {
    setCurrentBanner(banner);
    setBannerImagePreviews({
      image_left: banner ? baseUrl + banner.image_left_url : null,
      image_right: banner ? baseUrl + banner.image_right_url : null,
      image_mobile: banner ? baseUrl + banner.image_mobile_url : null,
    });
    setIsBannerModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsSlideModalOpen(false);
    setIsBannerModalOpen(false);
    setCurrentSlide(null);
    setCurrentBanner(null);
  };

  // --- Form Submit Handlers ---
  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const apiCall = currentSlide ? api.put(`/header-slides/${currentSlide.id}`, formData) : api.post("/header-slides", formData);
    
    toast.promise(apiCall, {
      loading: 'Menyimpan slide...',
      success: (res) => {
        fetchSlides();
        handleCloseModals();
        return res.data.message;
      },
      error: (err) => err.response?.data?.message || "Terjadi kesalahan."
    }).finally(() => setIsSubmitting(false));
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const apiCall = currentBanner ? api.put(`/banners/${currentBanner.id}`, formData) : api.post("/banners", formData);

    toast.promise(apiCall, {
      loading: 'Menyimpan banner...',
      success: (res) => {
        fetchBanners();
        handleCloseModals();
        return res.data.message;
      },
      error: (err) => err.response?.data?.message || "Terjadi kesalahan."
    }).finally(() => setIsSubmitting(false));
  };

  // --- Delete Handlers ---
  const handleDelete = (type, id) => {
    const endpoint = type === 'slide' ? `/header-slides/${id}` : `/banners/${id}`;
    const fetcher = type === 'slide' ? fetchSlides : fetchBanners;

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

  const renderInput = (name, label, defaultValue, required = false, type = "text") => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} id={name} defaultValue={defaultValue} required={required} className="w-full p-2 border border-gray-300 rounded-md" />
    </div>
  );

  const renderImageInput = (name, label, preview, onChange) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-4">
        {preview && <Image src={preview} alt="Preview" width={100} height={60} className="rounded-md object-cover" />}
        <input type="file" name={name} accept="image/*" onChange={onChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajer Halaman Utama</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('slides')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'slides' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Header Slider
          </button>
          <button onClick={() => setActiveTab('banners')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'banners' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Promo Banner
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'slides' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Kelola Header Slider</h2>
              <button onClick={() => handleOpenSlideModal()} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 font-semibold"><FaPlus /> Tambah Slide</button>
            </div>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Gambar</th>
                    <th className="px-6 py-3">Judul</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {slides.map((slide) => (
                    <tr key={slide.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4"><Image src={baseUrl + slide.image_url} alt={slide.title} width={120} height={60} className="rounded-md object-cover" /></td>
                      <td className="px-6 py-4 font-medium text-gray-900">{slide.title}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${slide.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{slide.is_active ? "Aktif" : "Nonaktif"}</span></td>
                      <td className="px-6 py-4 text-right"><div className="flex justify-end gap-3"><button onClick={() => handleOpenSlideModal(slide)} className="text-blue-600 hover:text-blue-800"><FaEdit size={16} /></button><button onClick={() => handleDelete('slide', slide.id)} className="text-red-600 hover:text-red-800"><FaTrash size={16} /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Kelola Promo Banner</h2>
              {banners.length === 0 && <button onClick={() => handleOpenBannerModal()} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90 font-semibold"><FaPlus /> Tambah Banner</button>}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              {banners.map((banner) => (
                <div key={banner.id} className="flex justify-between items-center border-b pb-3 mb-3">
                  <div>
                    <p className="font-semibold">{banner.title}</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${banner.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{banner.is_active ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div className="flex justify-end gap-3"><button onClick={() => handleOpenBannerModal(banner)} className="text-blue-600 hover:text-blue-800"><FaEdit size={16} /></button><button onClick={() => handleDelete('banner', banner.id)} className="text-red-600 hover:text-red-800"><FaTrash size={16} /></button></div>
                </div>
              ))}
              {banners.length > 0 ? <p className="text-sm text-gray-500">Hanya satu banner yang bisa aktif dalam satu waktu.</p> : <p>Belum ada banner.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Slide Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl m-4 relative max-h-[90vh] overflow-y-auto">
          <button onClick={handleCloseModals} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
          <h2 className="text-xl font-bold mb-6">{currentSlide ? "Edit" : "Tambah"} Slide</h2>
          <form onSubmit={handleSlideSubmit} className="space-y-4">
            {renderInput("title", "Judul Slide", currentSlide?.title, true)}
            {renderInput("offer_text", "Teks Penawaran (di atas judul)", currentSlide?.offer_text)}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("button1_text", "Teks Tombol 1", currentSlide?.button1_text)}
              {renderInput("button1_link", "Link Tombol 1", currentSlide?.button1_link)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("button2_text", "Teks Tombol 2", currentSlide?.button2_text)}
              {renderInput("button2_link", "Link Tombol 2", currentSlide?.button2_link)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("display_order", "Urutan Tampil", currentSlide?.display_order || 0, false, "number")}
              <div><label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="is_active" id="is_active" defaultValue={currentSlide?.is_active ?? true} className="w-full p-2 border border-gray-300 rounded-md bg-white"><option value="true">Aktif</option><option value="false">Nonaktif</option></select></div>
            </div>
            {renderImageInput("image", "Gambar Slide", slideImagePreview, (e) => e.target.files[0] && setSlideImagePreview(URL.createObjectURL(e.target.files[0])))}
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-accent text-white hover:bg-accent/90 disabled:bg-gray-400">{isSubmitting ? "Menyimpan..." : "Simpan"}</button></div>
          </form>
        </div></div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"><div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl m-4 relative max-h-[90vh] overflow-y-auto">
          <button onClick={handleCloseModals} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
          <h2 className="text-xl font-bold mb-6">{currentBanner ? "Edit" : "Tambah"} Banner</h2>
          <form onSubmit={handleBannerSubmit} className="space-y-4">
            {renderInput("title", "Judul Banner", currentBanner?.title, true)}
            <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><textarea name="description" id="description" defaultValue={currentBanner?.description} rows="3" className="w-full p-2 border border-gray-300 rounded-md"></textarea></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput("button_text", "Teks Tombol", currentBanner?.button_text)}
              {renderInput("button_link", "Link Tombol", currentBanner?.button_link)}
            </div>
            <div><label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="is_active" id="is_active" defaultValue={currentBanner?.is_active ?? true} className="w-full p-2 border border-gray-300 rounded-md bg-white"><option value="true">Aktif</option><option value="false">Nonaktif</option></select></div>
            {renderImageInput("image_left", "Gambar Kiri (Desktop)", bannerImagePreviews.image_left, (e) => e.target.files[0] && setBannerImagePreviews(p => ({...p, image_left: URL.createObjectURL(e.target.files[0])})))}
            {renderImageInput("image_right", "Gambar Kanan (Desktop)", bannerImagePreviews.image_right, (e) => e.target.files[0] && setBannerImagePreviews(p => ({...p, image_right: URL.createObjectURL(e.target.files[0])})))}
            {renderImageInput("image_mobile", "Gambar (Mobile)", bannerImagePreviews.image_mobile, (e) => e.target.files[0] && setBannerImagePreviews(p => ({...p, image_mobile: URL.createObjectURL(e.target.files[0])})))}
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={handleCloseModals} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Batal</button><button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-accent text-white hover:bg-accent/90 disabled:bg-gray-400">{isSubmitting ? "Menyimpan..." : "Simpan"}</button></div>
          </form>
        </div></div>
      )}
    </div>
  );
};

export default HomepageManagerPage;

