"use client";
import React, { useState, useEffect, Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import ProductFilterBarOld from "@/components/ProductFilterBarOld";
import { useSearchParams } from "next/navigation";

const PRODUCTS_PER_PAGE = 20;

// Komponen terpisah yang menggunakan useSearchParams
const DiscountProductsContent = () => {
  const { products, loading, fetchPublicProducts } = useProduct();
  const { categories, fetchCategories } = useCategory();
  const searchParams = useSearchParams();

  // Mengambil search term dari URL parameter
  const urlSearchTerm = searchParams.get("search") || "";

  // Mengubah state awal agar konsisten dengan value di filter bar
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearchTerm);
  const [selectedSort, setSelectedSort] = useState("newest");

  // Debounce search input dan reset halaman ke-1 saat filter berubah
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Delay 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Set initial search term from URL when component mounts
  useEffect(() => {
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
      setDebouncedSearchTerm(urlSearchTerm);
    }
  }, [urlSearchTerm]);

  // Reset ke halaman 1 setiap kali ada filter yang berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearchTerm, selectedSort]);

  // Fetch data dari server ketika filter berubah
  useEffect(() => {
    fetchPublicProducts({
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      category: selectedCategory,
      search: debouncedSearchTerm,
      status: "active",
      sort: selectedSort,
      isDiscounted: "true", // Parameter kunci untuk mengambil produk diskon
    });
  }, [
    currentPage,
    selectedCategory,
    debouncedSearchTerm,
    selectedSort,
    fetchPublicProducts,
  ]);

  // Scroll ke atas setiap kali halaman berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Fetch kategori saat komponen dimuat
  useEffect(() => {
    if (!categories || categories.length === 0) fetchCategories();
  }, [categories, fetchCategories]);

  const displayedProducts = products.data;
  const totalPages = products.totalPages;

  return (
    <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
      {/* Header */}
      <div className="flex flex-col items-start pt-12 w-full">
        <p className="text-2xl font-medium">Produk Diskon</p>
        <div className="w-16 h-0.5 bg-accent rounded-full"></div>
      </div>

      {/* Search Bar */}
      <div className="w-full mt-8">
        <input
          type="text"
          placeholder="Cari produk diskon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Filter Bar */}
      <div className="mt-6 w-full">
        <ProductFilterBarOld
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
        />
      </div>

      {/* Daftar Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10 pb-8 w-full">
        {loading ? (
          [...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
            <div key={i} className="w-full">
              <div
                className="aspect-square bg-accent/20 rounded-xl animate-pulse"
                style={{ animationDuration: "1.2s" }}
              />
              <div className="mt-3 space-y-3">
                <div
                  className="h-4 bg-accent/20 rounded w-full animate-pulse"
                  style={{ animationDuration: "1.2s" }}
                />
                <div
                  className="h-4 bg-accent/20 rounded w-2/3 animate-pulse"
                  style={{ animationDuration: "1.2s" }}
                />
                <div
                  className="h-5 bg-accent/20 rounded w-1/2 animate-pulse"
                  style={{ animationDuration: "1.2s" }}
                />
              </div>
            </div>
          ))
        ) : displayedProducts && displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center mt-12 min-h-[340px]">
            Tidak ada produk diskon ditemukan.
          </p>
        )}
      </div>

      {/* Pagination */}
      {products.data && (
        <div className="flex justify-center items-center gap-2 mt-4 mb-16 w-full flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &laquo;
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1
                  ? "bg-accent text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

// Loading fallback component
const ProductsLoadingFallback = () => {
  return (
    <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
      <div className="flex flex-col items-start pt-12 w-full">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="w-16 h-0.5 bg-accent rounded-full mt-2"></div>
      </div>
      <div className="w-full md:w-1/2 h-10 bg-gray-200 rounded-md mt-8 animate-pulse"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-16 pb-8 w-full">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-full">
            <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            <div className="mt-3 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main component dengan Suspense wrapper
const DiscountPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={<ProductsLoadingFallback />}>
        <DiscountProductsContent />
      </Suspense>
      <Footer />
    </>
  );
};

export default DiscountPage;
