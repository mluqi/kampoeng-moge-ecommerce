"use client";
import React, { useState, useEffect, useCallback, Fragment } from "react";
import api from "@/service/api";
import Loading from "@/components/Loading";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight, FaUpload } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PlatformSelectionModal from "@/components/admin/PlatformSelectionModal";

const PRODUCTS_PER_PAGE = 10;
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const ProductsToTiktokPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        search: debouncedSearch,
      };
      const res = await api.get("/products/admin/for-tiktok-page", { params });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      toast.error("Gagal memuat produk yang belum diunggah.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allProductIds = products.map((p) => p.product_id);
      setSelectedProducts(allProductIds);
    } else {
      setSelectedProducts([]);
    }
  };

  const handleOpenPlatformModal = () => {
    if (selectedProducts.length === 0) {
      toast.error("Pilih setidaknya satu produk untuk diunggah.");
      return;
    }
    setIsPlatformModalOpen(true);
  };

  const handleConfirmBulkUpload = async (platforms) => {
    setIsPlatformModalOpen(false);
    setIsBulkUploading(true);
    const toastId = toast.loading(
      `Mengunggah ${selectedProducts.length} produk...`
    );

    try {
      const res = await api.post("/products/admin/upload-to-tiktok/bulk", {
        productIds: selectedProducts,
        listingPlatforms: platforms,
      });
      toast.success(res.data.message || "Proses unggah massal selesai.", {
        id: toastId,
      });
      fetchProducts();
      setSelectedProducts([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengunggah produk.", { id: toastId });
    } finally {
      setIsBulkUploading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Fragment>
      <PlatformSelectionModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
        onConfirm={handleConfirmBulkUpload}
        productCount={selectedProducts.length}
      />
      <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Unggah Produk ke TikTok
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleOpenPlatformModal}
            disabled={selectedProducts.length === 0 || isBulkUploading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isBulkUploading
              ? "Mengunggah..."
              : `Unggah ${selectedProducts.length} Produk Terpilih`}
          </button>
        <input
          type="text"
          placeholder="Cari nama atau SKU produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
        />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gambar
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stok
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status TikTok
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <Loading />
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.product_id}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.product_id)}
                        onChange={() => handleSelectProduct(product.product_id)}
                        className="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <Image
                        src={
                          product.product_pictures?.[0]
                            ? `${baseUrl}${product.product_pictures[0]}`
                            : "/placeholder.png"
                        }
                        alt={product.product_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {product.product_name.length > 30
                          ? `${product.product_name.substring(0, 27)}...`
                          : product.product_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.product_id}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.product_sku}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.product_stock}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.product_tiktok_id ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Sudah Diunggah
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Belum Diunggah
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/product-list/${product.product_id}`
                          )
                        }
                        className="ml-2 text-blue-600 hover:text-blue-900"
                        title="Edit Produk"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Tidak ada produk yang memenuhi syarat untuk diunggah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <FaChevronLeft /> Sebelumnya
          </button>
          <span className="text-sm text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Berikutnya <FaChevronRight />
          </button>
        </div>
      )}
    </div>
    </Fragment>
  );
};

export default ProductsToTiktokPage;
