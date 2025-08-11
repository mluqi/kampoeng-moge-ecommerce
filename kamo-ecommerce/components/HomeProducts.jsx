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
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Produk populer</p>

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
          <p className="col-span-full text-center">Memuat produk...</p>
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
