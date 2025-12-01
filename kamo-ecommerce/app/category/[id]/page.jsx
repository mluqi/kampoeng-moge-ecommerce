"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import { FiChevronLeft } from "react-icons/fi";

const PRODUCTS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "highest-price", label: "Harga Tertinggi" },
  { value: "lowest-price", label: "Harga Terendah" },
  { value: "most-sold", label: "Terlaris" },
];

const CategoryProductPage = () => {
  const { id: categoryId } = useParams();
  const router = useRouter();

  const {
    products,
    loading: loadingProducts,
    fetchPublicProducts,
  } = useProduct();
  const { fetchCategoryById } = useCategory();

  const [category, setCategory] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState("newest");

  // Fetch category details
  useEffect(() => {
    if (categoryId) {
      const getCategoryDetails = async () => {
        setLoadingCategory(true);
        const catDetails = await fetchCategoryById(categoryId);
        setCategory(catDetails);
        setLoadingCategory(false);
      };
      getCategoryDetails();
    }
  }, [categoryId, fetchCategoryById]);

  // Reset halaman ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSort]);

  // Fetch products when categoryId, currentPage, or sort changes
  useEffect(() => {
    if (categoryId) {
      fetchPublicProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        category: categoryId,
        sort: selectedSort,
        status: "active",
      });
    }
  }, [categoryId, currentPage, selectedSort, fetchPublicProducts]);

  // Scroll ke atas setiap kali halaman berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const displayedProducts = products.data || [];
  const totalPages = products.totalPages || 1;

  if (loadingCategory) {
    return <Loading />;
  }

  return (
    <>
      <Navbar />
      <div className="px-4 md:px-8 lg:px-16 pt-8 pb-16 max-w-7xl mx-auto min-h-screen">
        {/* Header */}
        <div className="flex flex-col items-start w-full mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500 mb-4 hover:text-accent"
          >
            <FiChevronLeft className="mr-1" /> Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-medium text-gray-800 mb-2">
            Kategori:{" "}
            <span className="text-accent">
              {category?.category_name || "..."}
            </span>
          </h1>
          <div className="w-24 h-1 bg-accent rounded-full"></div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex justify-end w-full mb-6">
          <div className="relative min-w-[200px]">
            <label htmlFor="sort-by" className="sr-only">Urutkan</label>
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
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Product List */}
        {loadingProducts && currentPage === 1 ? (
          <Loading />
        ) : displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
              {displayedProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
 
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12 w-full flex-wrap">
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
          </>
        ) : (
          <div className="text-center py-16 min-h-[30vh]">
            <p className="text-gray-500">
              Tidak ada produk yang ditemukan dalam kategori ini.
            </p>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CategoryProductPage;
