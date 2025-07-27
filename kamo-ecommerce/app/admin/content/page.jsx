"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import "react-quill-new/dist/quill.snow.css"; // Import CSS Quill

// Import React Quill secara dinamis untuk menghindari masalah SSR
const QuillEditor = dynamic(() => import("react-quill-new"), { ssr: false });

const AdminContentsPage = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        // Menggunakan route admin yang sudah dibuat sebelumnya
        const res = await api.get("/content/");
        setContents(res.data);
      } catch (error) {
        toast.error("Gagal memuat konten.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, []);

  // Fungsi untuk memilih konten dari daftar
  const handleSelectContent = (content) => {
    setSelectedContent(content);
    setCurrentTitle(content.content_title);
    setCurrentValue(content.content_value);
  };

  // Fungsi untuk menyimpan perubahan
  const handleSave = async () => {
    if (!selectedContent) return;
    setIsSaving(true);
    const promise = api.put(`/content/${selectedContent.id}`, {
      content_title: currentTitle,
      content_value: currentValue,
    });

    toast.promise(promise, {
      loading: "Menyimpan perubahan...",
      success: (res) => {
        // Update state secara lokal agar perubahan langsung terlihat
        setContents((prevContents) =>
          prevContents.map((c) =>
            c.id === selectedContent.id ? res.data.content : c
          )
        );
        setSelectedContent(res.data.content);
        setIsSaving(false);
        return "Konten berhasil diperbarui!";
      },
      error: (err) => {
        setIsSaving(false);
        return (
          err.response?.data?.message || "Gagal menyimpan. Silakan coba lagi."
        );
      },
    });
  };

  // Konfigurasi toolbar untuk React Quill
  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Konten Situs</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Daftar Konten */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Daftar Konten</h2>
          <ul className="space-y-2">
            {contents.map((content) => (
              <li key={content.id}>
                <button
                  onClick={() => handleSelectContent(content)}
                  className={`w-full text-left p-3 rounded-md transition-colors ${
                    selectedContent?.id === content.id
                      ? "bg-accent text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium">{content.content_title}</p>
                  <p className="text-xs opacity-80">{content.description}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom Editor */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          {selectedContent ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Edit: {selectedContent.content_title}</h2>
              <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent" />
              <div className="bg-white">
                <QuillEditor theme="snow" value={currentValue} onChange={setCurrentValue} modules={quillModules} className="h-96 mb-12" />
              </div>
              <div className="flex justify-end"><button onClick={handleSave} disabled={isSaving} className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent/90 transition font-semibold disabled:bg-gray-300">{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</button></div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500"><p>Pilih konten dari daftar untuk mulai mengedit.</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContentsPage;

