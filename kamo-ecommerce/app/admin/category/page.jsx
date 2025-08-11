"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useCategory } from "@/contexts/CategoryContext";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import toast from "react-hot-toast";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const CategoryPage = () => {
  const {
    categories,
    loading,
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
          <h2 className="text-lg font-medium">Category List</h2>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-colors"
          >
            + Add Category
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</div>
        )}

        <div className="flex flex-col items-center max-w-full w-full overflow-hidden rounded-md bg-white border border-gray-200 shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.category_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cat.category_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cat.category_image ? (
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              width={40}
                              height={40}
                              src={baseUrl + cat.category_image}
                              alt={cat.category_name}
                              className="rounded-md object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cat.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {editMode ? "Edit Category" : "Add Category"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="category_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category Name
                  </label>
                  <input
                    id="category_name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"
                    placeholder="Enter category name"
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
                    Category Image
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
                      src={baseUrl+previewImage}
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
                    Cancel
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

export default CategoryPage;
