"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useUserAuth } from "./UserAuthContext";
import api from "@/service/api";
import toast from "react-hot-toast";

const CartContext = createContext();

const CART_SELECTION_KEY = "kamo_cart_selection";

export const CartProvider = ({ children }) => {
  const { user } = useUserAuth();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const item = window.sessionStorage.getItem(CART_SELECTION_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Gagal membaca item terpilih dari sessionStorage", error);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      // Jangan reset selectedItems di sini agar pilihan tetap ada saat re-login
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/cart");
      const cartData = res.data || [];
      setCartItems(cartData);
      // Validasi item yang dipilih: hapus item yang sudah tidak ada di keranjang atau stoknya habis
      const validInStockIds = new Set(
        cartData
          .filter((item) => item.product.product_stock > 0)
          .map((item) => item.product_id)
      );
      setSelectedItems((currentSelected) =>
        currentSelected.filter((id) => validInStockIds.has(id))
      );
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

  // Simpan item yang dipilih ke sessionStorage setiap kali berubah
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(CART_SELECTION_KEY, JSON.stringify(selectedItems));
      } catch (error) {
        console.error("Gagal menyimpan item terpilih ke sessionStorage", error);
      }
    }
  }, [selectedItems]);

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

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const priceToUse = item.product.product_is_discount
        ? item.product.product_discount_price
        : item.product.product_price;
      return total + priceToUse * item.quantity;
    }, 0);
  }, [cartItems]);

  const selectedCartTotal = useMemo(() => {
    return selectedItems.reduce((total, productId) => {
      const item = cartItems.find(
        (cartItem) => cartItem.product_id === productId
      );
      if (item) {
        // Tentukan harga yang akan digunakan
        const priceToUse = item.product.product_is_discount
          ? item.product.product_discount_price
          : item.product.product_price;

        // Gunakan priceToUse untuk kalkulasi
        return total + priceToUse * item.quantity;
      }
      return total;
    }, 0);
  }, [selectedItems, cartItems]);

  const value = {
    cartItems,
    loading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartCount,
    cartTotal,
    selectedItems,
    toggleSelectItem,
    selectAllItems,
    deselectAllItems,
    clearCartState,
    selectedCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
