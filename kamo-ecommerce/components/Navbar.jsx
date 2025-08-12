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
} from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const { user, profile, userLogout } = useUserAuth();
  const { admin, logoutAdmin } = useAuth();
  const { cartCount } = useCart();
  // State untuk settings logo
  const [settings, setSettings] = useState(null);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Debounce untuk menunda pencarian API
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setLoadingSearch(true);
    setShowResults(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/products?search=${searchTerm}&limit=5`);
        setSearchResults(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/all-products?search=${encodeURIComponent(searchTerm.trim())}`
      );
      setShowResults(false);
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
          Home
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
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-48 lg:w-64">
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
          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 bg-white w-96 shadow-lg border rounded-md z-50">
              {loadingSearch ? (
                <p className="p-3 text-gray-500 text-sm text-center">
                  Mencari...
                </p>
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
                        product.product_pictures &&
                        product.product_pictures.length > 0
                          ? process.env.NEXT_PUBLIC_BACKEND_URL +
                            product.product_pictures[0]
                          : assets.product_placeholder
                      }
                      alt={product.product_name}
                      width={50}
                      height={50}
                      className="rounded-md object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {product.product_name}
                      </p>
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
        </form>

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
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/account")}
            className="bg-accent text-white px-4 py-2 rounded-full text-sm hover:bg-accent/90"
          >
            Masuk / Daftar
          </button>
        )}
      </div>

      {/* Mobile Menu Button (shown on mobile and iPad) */}
      <div className="flex md:hidden items-center gap-4">
        {/* Profile button only on mobile (hidden on iPad) */}
        {user && (
          <Link href="/profile" className="md:hidden hidden">
            <Image
              src={profile?.user_photo || user.image || assets.user_icon}
              alt="Profil"
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
          </Link>
        )}

        {/* Toggle search icon */}
        <div className="flex items-center gap-2">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center"
            style={{ minWidth: 0 }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk..."
              className={`
        transition-all duration-300
        bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm
        focus:outline-none focus:ring-1 focus:ring-accent
        ${mobileSearchOpen ? "w-40 ml-2 opacity-100" : "w-0 ml-0 opacity-0"}
      `}
              style={{
                minWidth: 0,
                paddingLeft: mobileSearchOpen ? undefined : 0,
                paddingRight: mobileSearchOpen ? undefined : 0,
              }}
              autoFocus={mobileSearchOpen}
              onBlur={() => setMobileSearchOpen(false)}
            />
            <FaSearch
              className="w-4 h-4 text-gray-500 cursor-pointer ml-2 font-regular"
              onClick={() => setMobileSearchOpen((v) => !v)}
            />
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full mt-2 bg-white w-96 shadow-lg border rounded-md z-50 right-2">
                {loadingSearch ? (
                  <p className="p-3 text-gray-500 text-sm text-center">
                    Mencari...
                  </p>
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
                          product.product_pictures &&
                          product.product_pictures.length > 0
                            ? process.env.NEXT_PUBLIC_BACKEND_URL +
                              product.product_pictures[0]
                            : assets.product_placeholder
                        }
                        alt={product.product_name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {product.product_name}
                        </p>
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
          </form>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
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

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-full right-0 w-full bg-white shadow-lg md:hidden flex flex-col items-center text-gray-500 font-medium text-lg">
          <Link
            href="/"
            className="w-full text-center py-4 hover:bg-gray-100 hover:text-accent"
          >
            Home
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
                Profile
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
                <span>Logout</span>
              </button>
            ) : (
              <button
                onClick={() => router.push("/account")}
                className="w-full bg-accent text-white flex justify-center gap-2 px-5 py-2.5 rounded-full text-base hover:bg-accent/90"
              >
                Masuk / Daftar
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
