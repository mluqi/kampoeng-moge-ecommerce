"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import Loading from "@/components/Loading";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "highest-price", label: "Harga Tertinggi" },
  { value: "lowest-price", label: "Harga Terendah" },
  { value: "most-sold", label: "Terlaris" },
];

const BrandPage = () => {
  const { brandName } = useParams();
  const router = useRouter();
  const { products, loading, fetchPublicProducts } = useProduct();
  const { categories, fetchCategories } = useCategory();

  const [page, setPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("newest");

  // Decode nama brand dari URL (misal: "Harley%20Davidson" -> "Harley Davidson")
  const decodedBrandName = decodeURIComponent(brandName || "");

  // Fetch products whenever brand, category, or page changes
  useEffect(() => {
    if (decodedBrandName) {
      fetchPublicProducts({
        brand: decodedBrandName,
        limit: 20,
        page: page,
        status: "active",
        sort: selectedSort,
      });
    }
  }, [decodedBrandName, page, fetchPublicProducts, selectedSort]);

  // Scroll ke atas setiap kali halaman berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const displayedProducts = products.data || [];
  const totalPages = products.totalPages || 1;
  const currentPage = products.currentPage || 1;

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-8 lg:px-16 pt-8 pb-16 max-w-7xl mx-auto min-h-screen">
        {/* Breadcrumb dan Judul */}
        <div className="flex flex-col items-start w-full mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500 mb-4 hover:text-accent"
          >
            <FiChevronLeft className="mr-1" /> Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">
            Brand: <span className="text-accent">{decodedBrandName}</span>
          </h1>
          <div className="w-24 h-1 bg-accent rounded-full"></div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex justify-end w-full mb-6">
          <div className="relative min-w-[200px]">
            <label htmlFor="sort-by" className="sr-only">
              Urutkan
            </label>
            <select
              id="sort-by"
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full px-4 py-2 pr-8 rounded-lg border border-gray-300 bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Grid Produk */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
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
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600">
              Tidak ada produk yang ditemukan untuk brand ini.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiChevronLeft />
              Sebelumnya
            </button>
            <span className="text-gray-700 font-medium">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Berikutnya
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BrandPage;
