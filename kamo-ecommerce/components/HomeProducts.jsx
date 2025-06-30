"use client";
import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { useCategory } from "@/contexts/CategoryContext";
import { useRouter } from "next/navigation";
import api from "@/service/api";

const HOME_PRODUCTS_LIMIT = 20;

const HomeProducts = () => {
  const { categories, fetchCategories } = useCategory();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [homeProducts, setHomeProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch kategori saat komponen dimuat
  useEffect(() => {
    if (!categories || categories.length === 0) fetchCategories();
  }, [categories, fetchCategories]);

  // Fetch produk setiap kali kategori yang dipilih berubah
  useEffect(() => {
    const fetchHomeProducts = async () => {
      setLoading(true);
      try {
        const params = {
          limit: HOME_PRODUCTS_LIMIT,
          category: selectedCategory === "All" ? "" : selectedCategory,
        };
        const query = new URLSearchParams(params).toString();
        const res = await api.get(`/products?${query}`);
        setHomeProducts(res.data.data); // Kita hanya butuh array datanya
      } catch (error) {
        console.error("Gagal mengambil produk untuk homepage:", error);
        setHomeProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();
  }, [selectedCategory]);

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Produk populer</p>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 flex-col items-center gap-6 mt-6 pb-14 w-full">
        {loading ? (
          <p className="col-span-full text-center">Memuat produk...</p>
        ) : homeProducts.length > 0 ? (
          homeProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center">
            Tidak ada produk ditemukan.
          </p>
        )}
      </div>
      <button
        onClick={() => {
          router.push("/all-products");
        }}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        Lihat Selengkapnya
      </button>
    </div>
  );
};

export default HomeProducts;