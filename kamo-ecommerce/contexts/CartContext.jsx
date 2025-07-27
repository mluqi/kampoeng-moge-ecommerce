"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useUserAuth } from "./UserAuthContext";
import api from "@/service/api";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useUserAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      const cartData = res.data || [];
      setCartItems(cartData);
      // Secara default, pilih semua item yang stoknya tersedia saat keranjang dimuat
      const inStockItems = cartData.filter(item => item.product.product_stock > 0);
      setSelectedItems(inStockItems.map((item) => item.product_id));
    } catch (error) {
      console.error("Failed to fetch cart", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Silakan login untuk menambahkan produk ke keranjang.");
      return;
    }
    const promise = api.post("/cart", { productId, quantity });
    toast.promise(promise, {
      loading: "Menambahkan ke keranjang...",
      success: (res) => {
        fetchCart();
        return res.data.message || "Produk ditambahkan ke keranjang!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menambahkan ke keranjang.",
    });
  };

  const updateCartItem = async (productId, quantity) => {
    const promise = api.put(`/cart/${productId}`, { quantity });
    toast.promise(promise, {
      loading: "Memperbarui keranjang...",
      success: (res) => {
        fetchCart();
        return res.data.message || "Keranjang diperbarui!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal memperbarui keranjang.",
    });
  };

  const removeFromCart = async (productId) => {
    const promise = api.delete(`/cart/${productId}`);
    toast.promise(promise, {
      loading: "Menghapus dari keranjang...",
      success: (res) => {
        fetchCart();
        return res.data.message || "Produk dihapus dari keranjang!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menghapus dari keranjang.",
    });
  };

  const toggleSelectItem = (productId) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (item && item.product.product_stock <= 0) {
      toast.error("Produk ini kehabisan stok.");
      return; // Mencegah pemilihan item yang stoknya habis
    }
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    // Hanya pilih semua item yang stoknya tersedia
    const inStockIds = cartItems
      .filter((item) => item.product.product_stock > 0)
      .map((item) => item.product_id);
    setSelectedItems(inStockIds);
  };

  const deselectAllItems = () => {
    setSelectedItems([]);
  };

  const clearCartState = () => {
    setCartItems([]);
    setSelectedItems([]);
  };

  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((total, item) => total + item.product.product_price * item.quantity, 0), [cartItems]);

  const selectedCartTotal = useMemo(
    () =>
      cartItems
        .filter((item) => selectedItems.includes(item.product_id))
        .reduce(
          (total, item) =>
            total + item.product.product_price * item.quantity,
          0
        ),
    [cartItems, selectedItems]
  );

  const value = {
    cartItems, loading, fetchCart, addToCart, updateCartItem, removeFromCart, cartCount, cartTotal,
    selectedItems, toggleSelectItem, selectAllItems, deselectAllItems, clearCartState,
    selectedCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
