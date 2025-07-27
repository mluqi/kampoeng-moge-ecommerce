"use client";
import React, { useEffect, useState } from "react";
import { useCategory } from "@/contexts/CategoryContext";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";

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
  const [form, setForm] = useState({ category_name: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddModal = () => {
    setEditMode(false);
    setForm({ category_name: "" });
    setSelectedId(null);
    setShowModal(true);
    setMsg("");
  };

  const openEditModal = (cat) => {
    setEditMode(true);
    setForm({ category_name: cat.category_name });
    setSelectedId(cat.category_id);
    setShowModal(true);
    setMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (editMode) {
      success = await updateCategory(selectedId, form);
      setMsg(success ? "Kategori berhasil diupdate" : "Gagal update kategori");
    } else {
      success = await addCategory(form);
      setMsg(success ? "Kategori berhasil ditambah" : "Gagal tambah kategori");
    }
    if (success) setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus kategori ini?")) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="flex-1 min-h-screen">
      <div className="w-full p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Category List</h2>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-accent text-white rounded"
          >
            + Add Category
          </button>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="flex flex-col items-center max-w-full w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 text-sm text-left">
              <tr className="bg-gray-100">
                <th className="w-1/4 px-4 py-3 font-medium truncate">ID</th>
                <th className="w-2/4 px-4 py-3 font-medium truncate">
                  Category Name
                </th>
                <th className="w-1/4 px-4 py-3 font-medium truncate">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {categories.map((cat) => (
                <tr
                  key={cat.category_id}
                  className="border-t border-gray-500/20"
                >
                  <td className="px-4 py-3">{cat.category_id}</td>
                  <td className="px-4 py-3">{cat.category_name}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="px-2 py-1 text-accent rounded mr-2 hover:text-accent/80 cursor-pointer"
                    >
                      <FaPencilAlt className="inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.category_id)}
                      className="px-2 py-1 text-accent rounded hover:text-accent/80 cursor-pointer"
                    >
                      <FaTrashAlt className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md min-w-[300px]">
            <h3 className="font-bold mb-3">
              {editMode ? "Edit Category" : "Add Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                className="border px-3 py-2 rounded w-full"
                placeholder="Category Name"
                value={form.category_name}
                onChange={(e) =>
                  setForm({ ...form, category_name: e.target.value })
                }
                required
              />
              {msg && <div className="text-sm text-accent">{msg}</div>}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded"
                >
                  {editMode ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
