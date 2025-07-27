"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react"; // Import useSession dan signOut
import toast from "react-hot-toast";
import api from "@/service/api";

const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user || null;
  const [profile, setProfile] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const loading = status === "loading";

  useEffect(() => {
    if (user) {
      userProfile();
      fetchWishlist();
      fetchOrders();
    } else {
      setProfile(null);
      setWishlist([]);
      setOrders([]);
    }
  }, [user]);

  const userLogout = async () => {
    await signOut({ callbackUrl: "/account" });
  };

  const userProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data.user);
      return {
        success: true,
        message: "Profile fetched successfully",
        data: res.data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch user profile",
        data: null,
      };
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlist(res.data);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      setWishlist([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
      setOrders([]);
    }
  };

  const addToWishlist = async (productId) => {
    const promise = api.post("/wishlist", { productId });

    toast.promise(promise, {
      loading: "Menambahkan ke wishlist...",
      success: (res) => {
        fetchWishlist(); // Refresh wishlist on success
        return res.data.message || "Produk ditambahkan ke wishlist!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menambahkan ke wishlist.",
    });
  };

  const removeFromWishlist = async (productId) => {
    const promise = api.delete(`/wishlist/${productId}`);

    toast.promise(promise, {
      loading: "Menghapus dari wishlist...",
      success: (res) => {
        fetchWishlist(); // Refresh wishlist on success
        return res.data.message || "Produk dihapus dari wishlist!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menghapus dari wishlist.",
    });
  };

  const cancelOrder = async (orderId, cancelReason) => {
    const promise = api.put(`/orders/${orderId}/cancel`, {
      cancel_reason: cancelReason,
    });

    toast.promise(promise, {
      loading: "Membatalkan pesanan...",
      success: (res) => {
        fetchOrders(); // Refresh daftar pesanan
        return res.data.message || "Pesanan berhasil dibatalkan!";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal membatalkan pesanan.",
    });
    return promise; // Kembalikan promise agar bisa di-await di komponen
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        userProfile,
        setUser: null,
        userLogout,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        orders,
        fetchOrders,
        cancelOrder,
        loading,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => useContext(UserAuthContext);
