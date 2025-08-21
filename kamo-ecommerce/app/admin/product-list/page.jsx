"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";
import toast from "react-hot-toast";
import ProductTiktokActions from "@/components/admin/ProductTiktokActions";
import api from "@/service/api";

const PRODUCTS_PER_PAGE = 10;
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductList = () => {
  const router = useRouter();
  const { products, loading, error, fetchProducts, updateProductStatus } =
    useProduct();
  const [tiktokStatuses, setTiktokStatuses] = useState({});

  const { categories, fetchCategories } = useCategory();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts({
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      search: debouncedSearchTerm,
      category: selectedCategory === "All" ? "" : selectedCategory,
      status: statusFilter === "all" ? "" : statusFilter,
    });
  }, [
    fetchProducts,
    currentPage,
    debouncedSearchTerm,
    selectedCategory,
    statusFilter,
  ]);

  const handleCheckTiktokStatus = async (product) => {
    try {
      const res = await api.get(
        `/products/tiktok/${product.product_tiktok_id}/status`
      );

      setTiktokStatuses((prev) => ({
        ...prev,
        [product.product_id]: res.data.status,
      }));
    } catch (e) {
      toast.error("Gagal mengambil status TikTok");
      setTiktokStatuses((prev) => ({
        ...prev,
        [product.product_id]: null,
      }));
    }
  };

  const handleToggleStatus = async (product) => {
    const newStatus =
      product.product_status === "active" ? "inactive" : "active";
    try {
      await updateProductStatus(product.product_id, newStatus);
      toast.success(
        `Produk berhasil diubah menjadi ${
          newStatus === "active" ? "Aktif" : "Tidak Aktif"
        }`
      );
      fetchProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        search: debouncedSearchTerm,
        category: selectedCategory === "All" ? "" : selectedCategory,
        status: statusFilter === "all" ? "" : statusFilter,
      });
    } catch (err) {
      toast.error("Gagal mengubah status produk.");
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="w-full p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Daftar Produk
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-gray-600">
              Menampilkan {products.data?.length || 0} dari{" "}
              {products.totalItems || 0} produk
            </p>
            <button
              onClick={() => router.push("/admin/add-product")}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                />
              </div>
            </div>

            {/* Category Filter - Preserved the same options and onChange handler */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              >
                <option value="All">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter - Preserved the same options and onChange handler */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message - Preserved the same error display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Table - Preserved all data rendering logic */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Harga Tiktok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Tiktok
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-8 w-28 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <div className="h-5 w-5 bg-gray-200 rounded"></div>
                          <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : products.data?.length > 0 ? (
                  products.data.map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Image
                              src={
                                product.product_pictures &&
                                product.product_pictures.length > 0
                                  ? baseUrl + product.product_pictures[0]
                                  : assets.product_placeholder
                              }
                              alt="product"
                              width={40}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.product_name.length > 25
                                ? `${product.product_name.substring(0, 25)}...`
                                : product.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {product.product_id} || SKU:{" "}
                              {product.product_sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {product.category?.category_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          Rp{" "}
                          {(product.product_price || 0).toLocaleString("id-ID")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900 font-medium">
                          Rp{" "}
                          {(product.product_price_tiktok || 0).toLocaleString(
                            "id-ID"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-900">
                          {product.product_stock ?? 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              product.product_status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {product.product_status === "active"
                              ? "Aktif"
                              : "Tidak Aktif"}
                          </span>

                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={product.product_status === "active"}
                              onChange={() => handleToggleStatus(product)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Kolom Status Tiktok */}
                        {typeof tiktokStatuses[product.product_id] ===
                        "undefined" ? (
                          product.product_tiktok_id ? (
                            <button
                              className="px-3 py-1 bg-accent text-white rounded text-xs cursor-pointer hover:bg-accent/90 transition-colors"
                              onClick={() => handleCheckTiktokStatus(product)}
                            >
                              Cek Status TikTok
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Tidak terhubung TikTok
                            </span>
                          )
                        ) : (
                          <ProductTiktokActions
                            product={{
                              ...product,
                              tiktok_status: tiktokStatuses[product.product_id],
                            }}
                            onActionComplete={() =>
                              handleCheckTiktokStatus(product)
                            }
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* Preserved the detail button with original navigation */}
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/product-list/${product.product_id}`
                              )
                            }
                            className="text-accent hover:text-accent/80"
                            title="Detail"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          {/* Preserved the visit button with original navigation */}
                          <button
                            onClick={() =>
                              router.push(`/product/${product.product_id}`)
                            }
                            className="text-gray-600 hover:text-gray-900"
                            title="Lihat di Toko"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Tidak ada produk yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination - Preserved the same pagination logic */}
        {products.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Halaman {currentPage} dari {products.totalPages}
              </p>
            </div>
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Sebelumnya
              </button>
              <div className="hidden md:flex">
                {Array.from({ length: products.totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? "bg-accent text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } ${i === 0 ? "rounded-l-md" : ""} ${
                      i === products.totalPages - 1 ? "rounded-r-md" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(prev + 1, products.totalPages)
                  )
                }
                disabled={currentPage === products.totalPages}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  currentPage === products.totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
