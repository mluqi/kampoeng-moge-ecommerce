"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddDiscountModal from "./AddDiscountModal";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const PRODUCTS_PER_PAGE = 10;

const ProductDiscountPage = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editingCell, setEditingCell] = useState({ rowId: null, field: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [editValue, setEditValue] = useState(""); // For percentage
  const [editDateRange, setEditDateRange] = useState({
    start_date: null,
    end_date: null,
  });

  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    return String(value)
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchDiscountedProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: {
          limit: PRODUCTS_PER_PAGE,
          page: currentPage,
          discountStatus: "true",
          search: debouncedSearchTerm,
          discountActivity: activityFilter === "all" ? "" : activityFilter,
        },
      });
      setDiscountedProducts(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalProducts);
    } catch (error) {
      toast.error("Gagal memuat produk diskon.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, activityFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchDiscountedProducts();
  }, [fetchDiscountedProducts]);

  const handleToggleStatus = async (product) => {
    const newStatus = !product.product_discount_status;
    const promise = api.put(
      `/products/admin/discount-status/${product.product_id}`,
      { discount_status: newStatus }
    );

    toast.promise(promise, {
      loading: "Memperbarui status...",
      success: () => {
        fetchDiscountedProducts();
        return `Diskon berhasil di${newStatus ? "aktifkan" : "nonaktifkan"}.`;
      },
      error: (err) =>
        err.response?.data?.message || "Gagal memperbarui status.",
    });
  };

  const handleDoubleClick = (product, field) => {
    setEditingCell({ rowId: product.product_id, field });
    if (field === "discount_percentage") {
      setEditValue(product.product_discount_percentage || "");
    } else if (field === "periode") {
      setEditDateRange({
        start_date: product.product_discount_start_date
          ? new Date(product.product_discount_start_date)
          : null,
        end_date: product.product_discount_end_date
          ? new Date(product.product_discount_end_date)
          : null,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell({ rowId: null, field: null });
    setEditValue("");
    setEditDateRange({ start_date: null, end_date: null });
  };

  const handleSaveEdit = async () => {
    const { rowId, field } = editingCell;
    if (!rowId) return;
    const productId = rowId;
    
    const currentProduct = discountedProducts.find(p => p.product_id === productId);
    if (!currentProduct) return handleCancelEdit();

    let payload = {};
    let hasChanged = false;

    if (field === "discount_percentage") {
      const newPercentage = parseFloat(editValue);
      if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
        toast.error("Diskon harus antara 0 dan 100%.");
        return; // Prevent saving invalid value
      }
      
      const originalPercentage = currentProduct.product_discount_percentage || 0;
      if (String(originalPercentage) !== String(newPercentage)) {
        hasChanged = true;
      }
      payload = { discount_percentage: newPercentage };

    } else if (field === "periode") {
      const originalStartDate = currentProduct.product_discount_start_date ? new Date(currentProduct.product_discount_start_date).getTime() : null;
      const originalEndDate = currentProduct.product_discount_end_date ? new Date(currentProduct.product_discount_end_date).getTime() : null;
      
      const newStartDate = editDateRange.start_date ? editDateRange.start_date.getTime() : null;
      const newEndDate = editDateRange.end_date ? editDateRange.end_date.getTime() : null;

      if (originalStartDate !== newStartDate || originalEndDate !== newEndDate) {
        hasChanged = true;
      }
      payload = { start_date: editDateRange.start_date, end_date: editDateRange.end_date };
    }

    if (!hasChanged) {
      return handleCancelEdit();
    }

    const promise = api.put(
      `/products/admin/discount-status/${productId}`,
      payload
    );

    toast.promise(promise, {
      loading: "Menyimpan perubahan...",
      success: () => {
        handleCancelEdit();
        fetchDiscountedProducts();
        return "Perubahan diskon berhasil disimpan.";
      },
      error: (err) =>
        err.response?.data?.message || "Gagal menyimpan perubahan.",
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") handleCancelEdit();
  };

  const handleDeleteDiscount = async (productId) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus diskon dari produk ini? Aksi ini akan menghapus semua data diskon terkait."
      )
    ) {
      return;
    }

    const promise = api.delete(`/products/admin/discount/${productId}`);

    toast.promise(promise, {
      loading: "Menghapus diskon...",
      success: () => {
        fetchDiscountedProducts(); // Refresh the list
        return "Diskon berhasil dihapus.";
      },
      error: (err) => err.response?.data?.message || "Gagal menghapus diskon.",
    });
  };

  const handleDiscountsAdded = () => {
    setIsModalOpen(false);
    fetchDiscountedProducts();
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Diskon Produk
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan {discountedProducts.length} dari {totalItems} produk
            diskon.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-accent/90 transition-colors"
        >
          <FaPlus /> Tambah Diskon Produk
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk (nama atau SKU)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          {/* Discount Activity Filter */}
          <div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
            >
              <option value="all">Semua Status Diskon</option>
              <option value="active">Diskon Aktif</option>
              <option value="inactive">Diskon Tidak Aktif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Harga
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Diskon (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Periode Diskon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
              ) : discountedProducts.length > 0 ? (
                discountedProducts.map((product) => {
                  const isEditing = editingCell.rowId === product.product_id;
                  const originalPrice = parseFloat(product.product_price);

                  // Kalkulasi harga diskon untuk tampilan real-time saat edit
                  const calculatedDiscountPrice = isEditing
                    ? editingCell.field === "discount_percentage"
                      ? originalPrice * (1 - (parseFloat(editValue) || 0) / 100)
                      : product.product_discount_price
                    : product.product_discount_price;

                  return (
                    <tr key={product.product_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Image
                            src={
                              product.product_pictures?.[0]
                                ? baseUrl + product.product_pictures[0]
                                : "/placeholder.png"
                            }
                            width={40}
                            height={40}
                            alt={product.product_name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.product_name.length > 60
                                ? `${product.product_name.substring(0, 60)}...`
                                : product.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.product_sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 line-through">
                            Rp {formatNumber(product.product_price)}
                          </span>
                          <span className="text-sm font-semibold text-[#F84B62]">
                            Rp {formatNumber(calculatedDiscountPrice)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing &&
                        editingCell.field === "discount_percentage" ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-20 px-2 py-1 border border-accent rounded-md text-sm"
                            placeholder="%"
                          />
                        ) : (
                          <div
                            onDoubleClick={() =>
                              handleDoubleClick(product, "discount_percentage")
                            }
                            className="text-sm text-[#F84B62] bg-[#F84B62]/10 px-2 py-1 rounded-md font-semibold cursor-pointer hover:bg-[#F84B62]/20 w-fit"
                            title="Double-click untuk edit"
                          >
                            {product.product_discount_percentage || 0}%
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.product_stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing && editingCell.field === "periode" ? (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <DatePicker
                                selected={editDateRange.start_date}
                                onChange={(date) =>
                                  setEditDateRange({
                                    ...editDateRange,
                                    start_date: date,
                                  })
                                }
                                className="w-32 px-2 py-1 border border-accent rounded-md text-sm"
                                placeholderText="Mulai"
                                dateFormat="dd/MM/yyyy"
                                autoFocus
                              />
                              <DatePicker
                                selected={editDateRange.end_date}
                                onChange={(date) =>
                                  setEditDateRange({
                                    ...editDateRange,
                                    end_date: date,
                                  })
                                }
                                className="w-32 px-2 py-1 border border-accent rounded-md text-sm"
                                placeholderText="Selesai"
                                dateFormat="dd/MM/yyyy"
                                minDate={editDateRange.start_date}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-green-600"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-500"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDoubleClick={() =>
                              handleDoubleClick(product, "periode")
                            }
                            className="text-sm text-gray-900 p-1 rounded-md cursor-pointer hover:bg-gray-100"
                            title="Double-click untuk edit"
                          >
                            {formatDate(product.product_discount_start_date)} -{" "}
                            {formatDate(product.product_discount_end_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.product_discount_status}
                            onChange={() => handleToggleStatus(product)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-accent after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-4">
                          {isEditing ? // Show nothing here, as save/cancel are handled inline
                          null : (
                            <>
                              <button
                                onClick={() =>
                                  handleDeleteDiscount(product.product_id)
                                }
                                className="text-red-600 hover:text-red-800"
                                title="Hapus Diskon"
                              >
                                <FaTrash />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Belum ada produk yang didiskon.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Halaman {currentPage} dari {totalPages}
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
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      <AddDiscountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDiscountsAdded={handleDiscountsAdded}
      />
    </div>
  );
};

export default ProductDiscountPage;
