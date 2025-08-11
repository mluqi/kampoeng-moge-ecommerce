import { createContext, useContext, useState, useCallback } from "react";
import api from "@/service/api";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState({
    data: [],
    totalPages: 1,
    currentPage: 1,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastFetchParams, setLastFetchParams] = useState({});

  // Fetch all products
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    setLastFetchParams(params);
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/products?${query}`);
      setProducts(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal mengambil produk");
      setProducts({
        data: [],
        totalPages: 1,
        currentPage: 1,
        totalProducts: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/products/all-products?${query}`);
      setProducts(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal mengambil produk");
      setProducts({
        data: [],
        totalPages: 1,
        currentPage: 1,
        totalProducts: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = async (id) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/products/${id}`);
      console.log(res.data);
      return res.data;
    } catch (error) {
      setError(error?.response?.data?.message || "Gagal mengambil produk");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tambah produk
  const addProduct = async (formData) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProducts(lastFetchParams);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal tambah produk");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update produk
  const updateProduct = async (id, formData) => {
    setLoading(true);
    setError("");
    try {
      await api.put(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProducts(lastFetchParams);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal update produk");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (id, status) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.put(`/products/${id}/status`, { status });
      await fetchProducts(lastFetchParams);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal update status produk");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Hapus produk
  const deleteProduct = async (id) => {
    setLoading(true);
    setError("");
    try {
      await api.delete(`/products/${id}`);
      await fetchProducts(lastFetchParams);
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || "Gagal hapus produk");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        fetchPublicProducts,
        fetchProductById,
        addProduct,
        updateProduct,
        updateProductStatus,
        deleteProduct,
        setProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => useContext(ProductContext);
