"use client";
import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import Link from "next/link";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/service/api";
import {
  FaSearch,
  FaSignOutAlt,
  FaHeart,
  FaShoppingCart,
  FaTimes,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user, profile, userLogout } = useUserAuth();
  const { admin, logoutAdmin } = useAuth();
  const { cartCount } = useCart();
  // State untuk settings logo
  const [settings, setSettings] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/all-products?search=${encodeURIComponent(searchTerm.trim())}`
      );
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        setSettings(res.data);
      } catch (error) {
        // Tidak perlu error toast di navbar
        console.error("Gagal memuat pengaturan navbar:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 md:px-8 lg:px-32 py-4 bg-white text-gray-700 shadow-sm relative">
      {/* Logo */}
      <Image
        className="cursor-pointer w-34 md:w-32 lg:w-36"
        onClick={() => {
          router.push("/");
          setMenuOpen(false);
        }}
        src={
          settings?.footer?.logo_url
            ? `${baseUrl}${settings.footer.logo_url}`
            : assets.logo_accent
        }
        alt="logo"
        priority
        width={144}
        height={48}
      />

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex lg:flex items-center gap-6 font-medium text-sm text-gray-500">
        <Link href="/" className="hover:text-accent transition-colors">
          Beranda
        </Link>
        <Link
          href="/all-products"
          className="hover:text-accent transition-colors"
        >
          Belanja
        </Link>
        <Link href="/about-us" className="hover:text-accent transition-colors">
          Tentang Kami
        </Link>
        <Link href="/contact" className="hover:text-accent transition-colors">
          Kontak
        </Link>
      </div>

      {/* Desktop Search and User Actions */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 relative">
        {/* Search Input - Modified to look like mobile */}
        <div className="">
          <button
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            className="p-1 z-20 cursor-pointer"
          >
            {mobileSearchOpen ? (
              <FaTimes className="w-5 h-5 text-gray-500" />
            ) : (
              <FaSearch className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Search Dropdown Panel - Similar to mobile */}
          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute top-14 right-0 w-96 bg-white shadow-lg p-4 z-0 border rounded-lg border-transparent"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="w-full flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari produk..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      autoFocus
                    />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Actions */}
        {user || admin ? (
          <div className="flex items-center gap-3">
            {/* Show wishlist and cart only on desktop (hidden on iPad) */}
            <div className="hidden lg:flex items-center gap-3">
              {user && (
                <Link href="/profile?tab=wishlist" className="relative">
                  <FaHeart className="w-5 h-5 text-gray-500 hover:text-red-500" />
                </Link>
              )}
              {user && (
                <Link href="/cart" className="relative">
                  <FaShoppingCart className="w-5 h-5 text-gray-500 hover:text-accent" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Profile picture - shown on both iPad and desktop */}
            {user && (
              <Link href="/profile" className="flex items-center gap-2">
                <Image
                  src={profile?.user_photo || user.image || assets.user_icon}
                  alt={profile?.user_name || user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 hidden xl:block">
                  Hi, {user.name.split(" ")[0]}
                </span>
              </Link>
            )}

            {/* Logout button - hidden on iPad (md: hidden), shown on desktop (lg: flex) */}
            <button
              onClick={user ? userLogout : logoutAdmin}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
            >
              <FaSignOutAlt />
              <span>Keluar</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/account")}
            className="bg-accent text-white px-4 py-2 rounded-full text-sm hover:bg-accent/90"
          >
            Masuk
          </button>
        )}
      </div>

      {/* Mobile Icons */}
      <div className="flex md:hidden items-center gap-4">
        {/* Search Icon */}
        <button
          onClick={() => {
            setMobileSearchOpen((prev) => !prev);
            setMenuOpen(false); // Tutup menu saat membuka pencarian
          }}
          className="p-1 z-20"
        >
          {mobileSearchOpen ? (
            <FaTimes className="w-5 h-5 text-gray-600" />
          ) : (
            <FaSearch className="w-5 h-5 text-gray-600" />
          )}
        </button>
        {/* Hamburger Icon */}
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            setMobileSearchOpen(false); // Tutup pencarian saat membuka menu
          }}
          className="z-20"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
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

      {/* Mobile Search Dropdown Panel */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute top-full left-0 right-0 bg-white shadow-lg p-4 md:hidden z-10 border-t"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full right-0 w-full bg-white shadow-lg md:hidden flex flex-col items-center text-gray-500 font-medium text-lg">
          <Link
            href="/"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent"
          >
            Beranda
          </Link>
          <Link
            href="/all-products"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent"
          >
            Belanja
          </Link>
          <Link
            href="/about-us"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent"
          >
            Tentang Kami
          </Link>
          <Link
            href="/contact"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent"
          >
            Kontak
          </Link>

          {/* Additional mobile-only menu items */}
          {user && (
            <>
              <Link
                href="/profile"
                className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent md:hidden"
              >
                Profil
              </Link>
            </>
          )}

          <div className="w-full px-4 pt-2 pb-4 mt-2 border-t border-gray-200">
            {user || admin ? (
              <button
                onClick={user ? userLogout : logoutAdmin}
                className="w-full bg-red-500 text-white flex justify-center gap-2 px-5 py-2.5 rounded-full text-base hover:bg-red-600"
              >
                <FaSignOutAlt />
                <span>Keluar</span>
              </button>
            ) : (
              <button
                onClick={() => router.push("/account")}
                className="w-full bg-accent text-white flex justify-center gap-2 px-5 py-2.5 rounded-full text-base hover:bg-accent/90"
              >
                Masuk
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
