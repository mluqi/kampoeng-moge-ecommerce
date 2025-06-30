import { createContext, useContext, useState, useCallback } from "react";
import api from "@/service/api";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products/categories");
      setCategories(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal mengambil kategori");
    }
    setLoading(false);
  }, []);

  // Add category
  const addCategory = async (data) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/products/categories", data);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal tambah kategori");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id, data) => {
    setLoading(true);
    setError("");
    try {
      await api.put(`/products/categories/${id}`, data);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal update kategori");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/products/categories/${id}`);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal hapus kategori");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        setCategories,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);
