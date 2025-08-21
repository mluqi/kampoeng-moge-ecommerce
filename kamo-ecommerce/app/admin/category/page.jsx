"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useCategory } from "@/contexts/CategoryContext";
import { FaPencilAlt, FaTrashAlt, FaGripVertical } from "react-icons/fa";
import Image from "next/image";
import toast from "react-hot-toast";
import api from "@/service/api";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const CategoryPage = () => {
  const {
    categories,
    loading,
    setCategories,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategory();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    category_name: "",
    category_image: null,
  });
  const [selectedId, setSelectedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = useCallback(() => {
    setForm({ category_name: "", category_image: null });
    setPreviewImage(null);
  }, []);

  const openAddModal = () => {
    setEditMode(false);
    resetForm();
    setSelectedId(null);
    setShowModal(true);
  };

  const openEditModal = useCallback((cat) => {
    setEditMode(true);
    setForm({
      category_name: cat.category_name,
      category_image: cat.category_image || null,
    });
    setSelectedId(cat.category_id);
    setPreviewImage(cat.category_image || null);
    setShowModal(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_name", form.category_name);

    // Hanya tambahkan gambar jika ada file baru yang dipilih (instanceof File)
    // Saat edit, form.category_image bisa berupa string URL gambar lama
    if (form.category_image && form.category_image instanceof File) {
      // Backend mengharapkan field 'pictures'
      formData.append("pictures", form.category_image);
    }

    const action = editMode
      ? () => updateCategory(selectedId, formData)
      : () => addCategory(formData);

    const toastMessages = {
      loading: editMode ? "Memperbarui kategori..." : "Menambah kategori...",
      success: editMode
        ? "Kategori berhasil diperbarui!"
        : "Kategori berhasil ditambah!",
      error: (err) =>
        err.message ||
        (editMode ? "Gagal memperbarui kategori" : "Gagal menambah kategori"),
    };

    try {
      const success = await toast.promise(action(), toastMessages);

      if (success) {
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      // toast.promise sudah menangani pesan error
      console.error("Error submitting category:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus kategori ini?")) {
      await deleteCategory(id);
    }
  };

  // --- DND-KIT LOGIC ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Mulai drag setelah mouse bergerak 5px
      },
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((c) => c.category_id === active.id);
      const newIndex = categories.findIndex((c) => c.category_id === over.id);
      const newOrder = arrayMove(categories, oldIndex, newIndex);

      // Update UI secara optimis
      setCategories(newOrder);

      // Siapkan data untuk dikirim ke backend
      const payload = newOrder.map((cat, index) => ({
        category_id: cat.category_id,
        display_order: index + 1,
      }));

      // Kirim pembaruan ke backend
      try {
        await api.post("/products/categories/reorder", { order: payload });
        toast.success("Urutan kategori berhasil disimpan!");
      } catch (err) {
        console.log(err)
        toast.error("Gagal menyimpan urutan. Silakan refresh halaman.");
        // Optional: revert state jika gagal
        setCategories(categories);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen">
      <div className="w-full p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Kategori</h1>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
          >
            + Tambah Kategori
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>
        )}

        <div className="w-full bg-white border border-gray-200 rounded-md shadow-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.category_id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-gray-200">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <SortableCategoryItem
                      key={cat.category_id}
                      cat={cat}
                      openEditModal={openEditModal}
                      handleDelete={handleDelete}
                    />
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada kategori yang ditemukan.
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[110] p-4">          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editMode ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="category_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Kategori
                  </label>
                  <input
                    id="category_name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="Masukkan nama kategori..."
                    value={form.category_name}
                    onChange={(e) =>
                      setForm({ ...form, category_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="category_image"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gambar Kategori
                  </label>
                  <input
                    id="category_image"
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setForm({ ...form, category_image: file });
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPreviewImage(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {previewImage && (
                  <div className="mb-4">
                    <Image
                      width={100}
                      height={100}
                      src={
                        previewImage.startsWith("data:")
                          ? previewImage
                          : baseUrl + previewImage
                      }
                      alt="Preview"
                      className="rounded-md object-cover border border-gray-200"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    {editMode ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SortableCategoryItem = ({ cat, openEditModal, handleDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cat.category_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-4 bg-white hover:bg-gray-50"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-2 text-gray-400 hover:text-gray-600"
      >
        <FaGripVertical />
      </div>
      <div className="flex-shrink-0 w-16 text-sm text-gray-500">
        {cat.category_id}
      </div>
      <div className="flex-shrink-0 h-10 w-10">
        {cat.category_image ? (
          <Image
            width={40}
            height={40}
            src={baseUrl + cat.category_image}
            alt={cat.category_name}
            className="rounded-md object-cover"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
            Tidak ada gambar
          </div>
        )}
      </div>
      <div className="flex-1 px-4 text-sm text-gray-700 font-medium">
        {cat.category_name}
      </div>
      <div className="flex-shrink-0 w-24 text-right">
        <button
          onClick={() => openEditModal(cat)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
          aria-label="Edit"
        >
          <FaPencilAlt />
        </button>
        <button
          onClick={() => handleDelete(cat.category_id)}
          className="text-red-600 hover:text-red-900"
          aria-label="Delete"
        >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
