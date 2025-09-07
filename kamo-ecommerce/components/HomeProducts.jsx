"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import { useRouter } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import ProductFilterBar from "./ProductFilterBar";

const HOME_PRODUCTS_LIMIT = 20; // Mengurangi limit untuk homepage agar lebih ringan

const HomeProducts = () => {
  const { products, loading, fetchPublicProducts } = useProduct();
  const { categories, fetchCategories } = useCategory();
  const router = useRouter();

  // State untuk filter, default sort adalah produk terlaris
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSort, setSelectedSort] = useState("newest");

  // Fetch kategori saat komponen dimuat
  useEffect(() => {
    if (!categories || categories.length === 0) fetchCategories();
  }, [categories, fetchCategories]);

  // Fetch produk setiap kali filter berubah
  useEffect(() => {
    fetchPublicProducts({
      limit: HOME_PRODUCTS_LIMIT,
      category: selectedCategory,
      status: "active",
      sort: selectedSort,
    });
  }, [selectedCategory, selectedSort, fetchPublicProducts]);

  const displayedProducts = products.data || [];

  return (
    <div className="flex flex-col items-center ">
      <p className="text-2xl font-medium text-left w-full">Kategori</p>
      {/* Filter Bar */}
      <div className="mt-6 w-full">
        <ProductFilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="w-full">
              <div
                className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                style={{ animationDuration: "1.2s" }}
              />
              <div className="mt-3 space-y-3">
                <div
                  className="h-4 bg-gray-200 rounded w-full animate-pulse"
                  style={{ animationDuration: "1.2s" }}
                />
                <div
                  className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"
                  style={{ animationDuration: "1.2s" }}
                />
                <div
                  className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"
                  style={{ animationDuration: "1.2s" }}
                />
              </div>
            </div>
          ))
        ) : displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center">
            Tidak ada produk ditemukan.
          </p>
        )}
      </div>
      <button
        onClick={() => router.push("/all-products")}
        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
      >
        Lihat Semua Produk <FiChevronRight />
      </button>
    </div>
  );
};

export default HomeProducts;
