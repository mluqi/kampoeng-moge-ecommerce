"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";

const PRODUCTS_PER_PAGE = 12;

const AllProducts = () => {
  const { products, loading, fetchProducts } = useProduct();
  const { categories, fetchCategories } = useCategory();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search input untuk mengurangi request API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset ke halaman 1 setiap kali ada pencarian baru
    }, 500); // Delay 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch data dari server ketika filter berubah
  useEffect(() => {
    fetchProducts({
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      category: selectedCategory === "All" ? "" : selectedCategory,
      search: debouncedSearchTerm,
    });
  }, [currentPage, selectedCategory, debouncedSearchTerm, fetchProducts]);

  // Fetch kategori saat komponen dimuat
  useEffect(() => {
    if (!categories || categories.length === 0) fetchCategories();
  }, [categories, fetchCategories]);

  // Reset ke halaman 1 saat filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const displayedProducts = products.data;
  const totalPages = products.totalPages;

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
        {/* Header */}
        <div className="flex flex-col items-start pt-12 w-full">
          <p className="text-2xl font-medium">Semua Produk</p>
          <div className="w-16 h-0.5 bg-accent rounded-full"></div>
        </div>

        {/* Search Bar */}
        <div className="w-full mt-8">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Filter Kategori */}
        <div className="flex flex-wrap justify-start gap-3 mt-6 w-full">
          <button
            key="All"
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-1.5 rounded-full text-sm transition ${
              selectedCategory === "All"
                ? "bg-accent text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => setSelectedCategory(cat.category_id)}
              className={`px-4 py-1.5 rounded-full text-sm transition ${
                selectedCategory === cat.category_id
                  ? "bg-accent text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {cat.category_name}
            </button>
          ))}
        </div>

        {/* Daftar Produk */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-10 pb-8 w-full">
          {loading ? (
            <div className="col-span-full">
              <Loading />
            </div>
          ) : displayedProducts && displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center mt-12">
              Tidak ada produk ditemukan.
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
      <Footer />
    </>
  );
};

export default AllProducts;