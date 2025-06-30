"use client";
import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import Link from "next/link";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/service/api";
import {
  FaSearch,
  FaSignOutAlt,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const { user, profile, userLogout } = useUserAuth();
  const { admin, logoutAdmin } = useAuth();

  // Debounce untuk menunda pencarian API
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoadingSearch(true);
    setShowResults(true); // Tampilkan dropdown saat mulai mengetik
    const delayDebounceFn = setTimeout(async () => {
      try {
        // Panggil API dengan parameter search dan limit
        const res = await api.get(`/products?search=${searchTerm}&limit=5`);
        setSearchResults(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300); // Delay 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/all-products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowResults(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-32 py-4 bg-white text-gray-700 shadow-sm relative">
      <Image
        className="cursor-pointer w-32 md:w-36"
        onClick={() => {
          router.push("/");
          setMenuOpen(false);
        }}
        src={assets.logo_accent}
        alt="logo"
        priority
      />
      <div className="flex items-center gap-4 lg:gap-8 max-md:hidden font-medium text-sm text-gray-500">
        <Link
          href="/"
          className="hover:text-accent transition-colors duration-200"
        >
          Home
        </Link>
        <Link
          href="/all-products"
          className="hover:text-accent transition-colors duration-200"
        >
          Belanja
        </Link>
        <Link
          href="/about-us"
          className="hover:text-accent transition-colors duration-200"
        >
          Tentang Kami
        </Link>
        <Link
          href="/contact"
          className="hover:text-accent transition-colors duration-200"
        >
          Kontak
        </Link>

        {/* {isSeller && <button onClick={() => router.push('/admin')} className="text-xs border border-gray-300 px-4 py-1.5 rounded-full hover:bg-accent/90 hover:text-white transition-colors">Admin Dashboard</button>} */}
      </div>

      <div className="hidden md:flex items-center gap-6 relative">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <FaSearch />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => setTimeout(() => setShowResults(false), 150)}
            onFocus={() => searchTerm.trim() && setShowResults(true)}
            placeholder="Cari produk..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </form>

        {/* Search Result Preview */}
        {showResults && (
          <div className="absolute top-full mt-2 bg-white w-96 shadow-lg border rounded-md z-50">
            {loadingSearch ? (
              <p className="p-3 text-gray-500 text-sm text-center">Mencari...</p>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div
                  key={product.product_id}
                  onClick={() => {
                    router.push(`/product/${product.product_id}`);
                    setShowResults(false);
                  }}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer transition"
                >
                  <Image
                    src={
                      product.product_pictures && product.product_pictures.length > 0
                        ? process.env.NEXT_PUBLIC_BACKEND_URL + product.product_pictures[0]
                        : assets.product_placeholder
                    }
                    alt={product.product_name}
                    width={50}
                    height={50}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{product.product_name}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {product.product_description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-3 text-gray-500 text-sm text-center">
                Produk tidak ditemukan
              </p>
            )}
          </div>
        )}

        {/* Sign In */}
        {user || admin ? (
          <div className="flex items-center gap-4">
            {user && ( // Tampilkan jika user login (baik dari NextAuth atau profile sudah dimuat)
              <FaHeart className="w-5 h-5 text-gray-200 cursor-pointer hover:text-red-500 transition-colors duration-200" />
            )}
            {user && (
              <FaShoppingCart className="w-5 h-5 text-gray-200 cursor-pointer hover:text-accent transition-colors duration-200" />
            )}
            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Image
                  src={profile?.user_photo || user.image || assets.user_icon} // Gunakan profile.user_photo, fallback ke user.image, lalu default
                  alt={profile?.user_name || user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 hidden lg:block">
                  Hi, {user.name.split(" ")[0]}
                </span>
              </Link>
            )}
            <button
              onClick={user ? userLogout : logoutAdmin}
              className="bg-red-500 text-white flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors duration-200"
            >
              <FaSignOutAlt />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/account")}
            className="bg-accent/90 text-white flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium hover:bg-accent transition-colors duration-200"
          >
            Masuk / Daftar
          </button>
        )}
      </div>

      <div className="flex items-center md:hidden gap-4">
        {user || admin ? (
          user && profile?.user_photo ? ( // Jika user login dan punya foto profil dari backend
            <Link
              href="/profile"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Image
                src={profile.user_photo}
                alt={profile.user_name}
                width={24}
                height={24}
                className="rounded-full"
              />
            </Link>
          ) : (
            // Jika admin login atau user tanpa foto profil, tampilkan ikon logout
            <button
              onClick={user ? userLogout : logoutAdmin}
              className="flex items-center gap-2"
            >
              <FaSignOutAlt className="w-5 h-5 text-gray-700" />
            </button>
          )
        ) : (
          <button
            onClick={() => router.push("/account")}
            className="flex items-center gap-2"
          >
            <Image src={assets.user_icon} alt="user icon" />
          </button>
        )}
        {/* Hamburger Menu Button */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="z-20">
          {menuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          className="absolute top-full right-0 w-full bg-white shadow-lg md:hidden flex flex-col items-center text-gray-500 font-medium text-lg"
          onClick={() => setMenuOpen(false)} // Close menu on link click
        >
          <Link
            href="/"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/all-products"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent transition-colors duration-200"
          >
            Belanja
          </Link>
          <Link
            href="/about-us"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent transition-colors duration-200"
          >
            Tentang Kami
          </Link>
          <Link
            href="/contact"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent transition-colors duration-200"
          >
            Kontak
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
