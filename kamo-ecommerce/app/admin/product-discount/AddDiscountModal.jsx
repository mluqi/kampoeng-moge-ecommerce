"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import Image from "next/image";
import { FaSave, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const AddDiscountModal = ({ isOpen, onClose, onDiscountsAdded }) => {
  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    return String(value)
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [modalView, setModalView] = useState("select"); // 'select' or 'configure'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [configuredDiscounts, setConfiguredDiscounts] = useState({});

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchNonDiscountedProducts = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    try {
      const res = await api.get("/products", {
        params: {
          limit: 5,
          page: currentPage,
          search: debouncedSearchTerm,
          discountStatus: "false",
        },
      });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, [isOpen, currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetchNonDiscountedProducts();
  }, [fetchNonDiscountedProducts]);

  const handleCheckboxChange = (productId) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        // Hapus konfigurasi saat checkbox tidak dicentang
        setConfiguredDiscounts((currentConfigs) => {
          const newConfigs = { ...currentConfigs };
          delete newConfigs[productId];
          return newConfigs;
        });
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleConfigurationChange = (productId, field, value) => {
    setConfiguredDiscounts((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIdsOnPage = products.map((p) => p.product_id);
      setSelectedProductIds((prev) => new Set([...prev, ...allIdsOnPage]));
    } else {
      const idsOnPageSet = new Set(products.map((p) => p.product_id));
      setSelectedProductIds((prev) => {
        const newSet = new Set(prev);
        idsOnPageSet.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedProductIds.size === 0) {
      return toast.error("Pilih setidaknya satu produk untuk diberi diskon.");
    }

    // Final validation before submitting
    for (const productId of selectedProductIds) {
      const config = configuredDiscounts[productId];
      if (config && config.discount_percentage) {
        const percentage = parseFloat(config.discount_percentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          const product = products.find((p) => p.product_id === productId);
          toast.error(
            `Diskon untuk "${
              product?.product_name || "produk"
            }" harus antara 0 dan 100.`
          );
          return;
        }
      }
    }

    const updatePromises = Array.from(selectedProductIds).map((productId) => {
      const config = configuredDiscounts[productId];
      if (config && config.discount_percentage) {
        const payload = {
          is_discount: true,
          discount_percentage: config.discount_percentage,
          start_date: config.start_date,
          end_date: config.end_date,
        };
        return api.put(`/products/admin/discount-status/${productId}`, payload);
      }
      return Promise.resolve();
    });

    const promise = Promise.all(updatePromises);

    toast.promise(promise, {
      loading: "Menyimpan diskon...",
      success: () => {
        onDiscountsAdded();
        return "Diskon berhasil diterapkan pada produk terpilih.";
      },
      error: (err) => err.response?.data?.message || "Gagal menerapkan diskon.",
    });
  };

  const handleClose = () => {
    setSelectedProductIds(new Set());
    setModalView("select");
    setConfiguredDiscounts({});

    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  const areAllSelected =
    products.length > 0 &&
    products.every((p) => selectedProductIds.has(p.product_id));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4">Tambah Diskon Produk</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Cari produk (nama atau SKU)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center p-8">
                  <Loading />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={areAllSelected}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Produk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Harga
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Diskon (%)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Periode
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.length > 0 ? (
                      products.map((product) => {
                        const isSelected = selectedProductIds.has(
                          product.product_id
                        );
                        const config =
                          configuredDiscounts[product.product_id] || {};
                        const discountPercentage =
                          config.discount_percentage || 0;
                        const previewPrice =
                          discountPercentage > 0
                            ? Math.round(
                                product.product_price *
                                  (1 - discountPercentage / 100)
                              )
                            : product.product_price;

                        return (
                          <tr
                            key={product.product_id}
                            className={
                              isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                            }
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleCheckboxChange(product.product_id)
                                }
                              />
                            </td>
                            <td className="px-4 py-2">
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
                                      ? `${product.product_name.substring(
                                          0,
                                          60
                                        )}...`
                                      : product.product_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    SKU: {product.product_sku}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex flex-col">
                                {isSelected && (
                                  <span className="text-xs text-gray-500 line-through">
                                    Rp {formatNumber(product.product_price)}
                                  </span>
                                )}
                                {!isSelected && (
                                  <span className="text-sm font-semibold text-gray-900"> 
                                    Rp {formatNumber(previewPrice)}
                                  </span>
                                )}
                                {isSelected && (<span className="text-sm font-semibold text-[#F84B62]">
                                  Rp {formatNumber(previewPrice)}
                                </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                placeholder="%"
                                disabled={!isSelected}
                                value={config.discount_percentage || ""}
                                onChange={(e) =>
                                  handleConfigurationChange(
                                    product.product_id,
                                    "discount_percentage",
                                    e.target.value
                                  )
                                }
                                className="w-20 p-1 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-col gap-1">
                                <DatePicker
                                  selected={config.start_date || null}
                                  disabled={!isSelected}
                                  onChange={(date) =>
                                    handleConfigurationChange(
                                      product.product_id,
                                      "start_date",
                                      date
                                    )
                                  }
                                  className="w-32 p-1 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  placeholderText="Mulai"
                                  dateFormat="dd/MM/yy"
                                />
                                <DatePicker
                                  selected={config.end_date || null}
                                  disabled={!isSelected}
                                  onChange={(date) =>
                                    handleConfigurationChange(
                                      product.product_id,
                                      "end_date",
                                      date
                                    )
                                  }
                                  className="w-32 p-1 border rounded-md text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  placeholderText="Selesai"
                                  dateFormat="dd/MM/yy"
                                  minDate={config.start_date || null}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-8 text-gray-500"
                        >
                          Tidak ada produk yang bisa ditambahkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div className="flex justify-end items-center mt-6">
          <button
            onClick={handleSubmit}
            className="bg-accent text-white px-6 py-2 rounded-md hover:bg-accent/90 transition-colors font-bold flex items-center gap-2"
          >
            <FaSave /> Terapkan Diskon ({selectedProductIds.size} produk)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDiscountModal;
