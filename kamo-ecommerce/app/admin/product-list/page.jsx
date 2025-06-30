"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import { useProduct } from "@/contexts/ProductContext";
import { useCategory } from "@/contexts/CategoryContext";

const PRODUCTS_PER_PAGE = 10;
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductList = () => {
  const router = useRouter();
  const { products, loading, error, fetchProducts } = useProduct();
  const { categories, fetchCategories } = useCategory();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset ke halaman 1 saat ada pencarian baru
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts({
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      search: debouncedSearchTerm,
      category: selectedCategory === "All" ? "" : selectedCategory,
    });
  }, [fetchProducts, currentPage, debouncedSearchTerm, selectedCategory]);

  return (
    <div className="flex-1 min-h-screen">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold w-full md:w-auto">
              Product List
            </h2>
            <div className="flex items-center gap-4 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {/* Search Input */}
              <div className="w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex flex-col items-center max-w-full w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-1/3 md:w-1/5 px-4 py-3 font-medium truncate">
                    ID
                  </th>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">
                    Product
                  </th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium truncate">Price</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {products.data?.map((product) => (
                  <tr
                    key={product.product_id}
                    className="border-t border-gray-500/20"
                  >
                    <td className="px-4 py-3">{product.product_id}</td>
                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                      <div className="bg-gray-500/10 rounded p-2">
                        <Image
                          src={
                            product.product_pictures &&
                            product.product_pictures.length > 0
                              ? baseUrl + product.product_pictures[0]
                              : assets.product_placeholder
                          }
                          alt="product Image"
                          className="w-16"
                          width={1280}
                          height={720}
                        />
                      </div>
                      <span className="truncate w-full">
                        {product.product_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {product.category?.category_name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      Rp {(product.product_price || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/product-list/${product.product_id}`
                          )
                        }
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md mr-2"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/product/${product.product_id}`)
                        }
                        className="flex items-center gap-1 px-1.5 md:px-3.5 py-2 bg-accent text-white rounded-md"
                      >
                        <span className="hidden md:block">Visit</span>
                        <Image
                          className="h-3.5"
                          src={assets.redirect_icon}
                          alt="redirect_icon"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.data?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {products.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 w-full flex-wrap">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                &laquo;
              </button>

              {[...Array(products.totalPages)].map((_, i) => (
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
                disabled={currentPage === products.totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                &raquo;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
