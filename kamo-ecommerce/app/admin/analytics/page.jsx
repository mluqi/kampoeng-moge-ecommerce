"use client";
import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "@/service/api";
import Loading from "@/components/Loading";
import Image from "next/image";
import {
  FaEye,
  FaChartLine,
  FaShoppingCart,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PERIOD_OPTIONS = [
  { key: "24h", label: "24 Jam" },
  { key: "3d", label: "3 Hari" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
];

const SORT_OPTIONS = [
  { key: "combined", label: "Skor Gabungan" },
  { key: "views", label: "Paling Dilihat" },
  { key: "carts", label: "Paling di Keranjang" },
];

const ProductAnalyticsPage = () => {
  const [period, setPeriod] = useState("24h");
  const [sortType, setSortType] = useState("combined");
  const [topProducts, setTopProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState({
    id: null,
    type: null,
  });
  const [accordionData, setAccordionData] = useState([]);
  const [accordionLoading, setAccordionLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    const baseParams = {};
    if (period === "custom" && customStartDate && customEndDate) {
      baseParams.startDate = customStartDate.toISOString();
      baseParams.endDate = customEndDate.toISOString();
    } else {
      baseParams.period = period;
    }

    try {
      // Fetch data for the main table
      const tablePromise = api.get("/analytics/top-products", {
        params: { ...baseParams, limit: 10, page: currentPage, sort: sortType },
      });

      // Fetch data for the chart (always top 5 combined)
      const chartPromise = api.get("/analytics/top-products", {
        params: { ...baseParams, limit: 5, page: 1, sort: "combined" },
      });

      const [tableResponse, chartResponse] = await Promise.all([
        tablePromise,
        chartPromise,
      ]);

      // Process table data
      setTopProducts(tableResponse.data.data);
      setTotalPages(tableResponse.data.totalPages);
      setCurrentPage(tableResponse.data.currentPage);

      // Process chart data
      const formatName = (p) =>
        p.product_name.substring(0, 15) +
        (p.product_name.length > 15 ? "..." : "");
      const formattedChartData = chartResponse.data.data.map((p) => ({
        name: formatName(p),
        Dilihat: p.view_count,
        Keranjang: p.cart_add_count,
      }));
      setChartData(formattedChartData);
    } catch (error) {
      console.error("Gagal mengambil data analitik:", error);
      setTopProducts([]);
      setChartData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [period, customStartDate, customEndDate, currentPage, sortType]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAccordionToggle = async (productId, type) => {
    if (expandedProduct.id === productId && expandedProduct.type === type) {
      setExpandedProduct({ id: null, type: null });
      setAccordionData([]);
      return;
    }

    setAccordionLoading(true);
    setExpandedProduct({ id: productId, type });

    const endpoint =
      type === "views"
        ? `/analytics/top-products/${productId}/viewers`
        : `/analytics/top-products/${productId}/cart-adds`;

    const params = {};
    if (period === "custom" && customStartDate && customEndDate) {
      params.startDate = customStartDate.toISOString();
      params.endDate = customEndDate.toISOString();
    } else {
      params.period = period;
    }

    try {
      const response = await api.get(endpoint, { params });
      setAccordionData(response.data);
    } catch (error) {
      console.error(`Gagal mengambil data detail untuk ${type}:`, error);
      setAccordionData([]);
    } finally {
      setAccordionLoading(false);
    }
  };

  const handleApplyCustomDate = () => {
    if (customStartDate && customEndDate) {
      setPeriod("custom");
      setCurrentPage(1);
    }
  };

  const renderProductTable = (products) => {
    return (
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
            <FaChartLine className="text-gray-500" />
            Peringkat Produk
          </h3>
        </div>

        {products.length > 0 ? (
          <>
            <ul className="divide-y divide-gray-200">
              {products.map((product, index) => (
                <li key={product.product_id} className="flex flex-col">
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50/80">
                    <span className="text-sm font-bold text-gray-400 w-8 text-center">
                      {(currentPage - 1) * 10 + index + 1}
                    </span>
                    <Image
                      src={
                        product.product_pictures?.[0]
                          ? baseUrl + product.product_pictures[0]
                          : "/placeholder.png"
                      }
                      alt={product.product_name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-md bg-gray-100"
                    />
                    <div className="flex-grow">
                      <a
                        href={`/product/${product.product_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-xs text-gray-800 hover:text-accent hover:underline truncate max-w-[200px]"
                        title={product.product_name} // Menampilkan nama lengkap saat hover
                      >
                        {product.product_name.length > 60
                          ? `${product.product_name.substring(0, 60)}...`
                          : product.product_name}
                      </a>
                      <p className="text-xs text-gray-500">
                        {product.product_id} || {product.product_sku}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          handleAccordionToggle(product.product_id, "views")
                        }
                        className="flex items-center gap-2 text-sm font-bold text-accent transition-transform hover:scale-110 cursor-pointer"
                        title="Lihat detail pengunjung"
                      >
                        <FaEye />
                        <span>{product.view_count}</span>
                      </button>
                      <button
                        onClick={() =>
                          handleAccordionToggle(product.product_id, "carts")
                        }
                        className="flex items-center gap-2 text-sm font-bold text-emerald-500 transition-transform hover:scale-110 cursor-pointer"
                        title="Lihat siapa yang menambahkan ke keranjang"
                      >
                        <FaShoppingCart />
                        <span>{product.cart_add_count}</span>
                      </button>
                    </div>
                  </div>
                  {/* Accordion Content */}
                  {expandedProduct.id === product.product_id &&
                    expandedProduct.type && (
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                        {accordionLoading ? (
                          <div className="flex justify-center items-center h-24">
                            <Loading />
                          </div>
                        ) : accordionData.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              {expandedProduct.type === "views"
                                ? "Daftar Pengunjung"
                                : "Ditambahkan ke Keranjang oleh"}
                            </h4>
                            <ul className="space-y-2">
                              {accordionData.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex justify-between items-center text-sm p-2 rounded-md bg-white"
                                >
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {item.User?.user_name || "Guest"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {item.User?.user_email ||
                                        "Pengunjung tidak login"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {expandedProduct.type === "carts" && (
                                      <p className="text-xs text-gray-600">
                                        Jumlah:{" "}
                                        <span className="font-bold">
                                          {item.quantity}
                                        </span>
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                      {new Date(
                                        item.viewed_at || item.updateAt
                                      ).toLocaleString("id-ID", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500">
                              Tidak ada data pengguna yang tercatat untuk aksi
                              ini pada periode yang dipilih.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center p-4 border-t bg-gray-50 gap-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft />
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Berikutnya
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto text-4xl text-gray-300 mb-4">
              <FaChartLine />
            </div>
            <p className="text-gray-500">
              Tidak ada data produk untuk periode yang dipilih.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaChartLine className="text-2xl text-accent" />
        <h1 className="text-2xl font-bold text-gray-800">
          Analitik Produk Terpopuler
        </h1>
      </div>

      {/* Period Selector */}
      <div className="mb-8 bg-gray-100 p-3 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => {
                setPeriod(option.key);
                setCustomStartDate(null);
                setCustomEndDate(null);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                period === option.key
                  ? "bg-accent text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            <DatePicker
              selected={customStartDate}
              onChange={(date) => setCustomStartDate(date)}
              selectsStart
              startDate={customStartDate}
              endDate={customEndDate}
              placeholderText="Tanggal Mulai"
              className="w-full md:w-36 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
              dateFormat="dd/MM/yyyy"
            />
            <DatePicker
              selected={customEndDate}
              onChange={(date) => setCustomEndDate(date)}
              selectsEnd
              startDate={customStartDate}
              endDate={customEndDate}
              minDate={customStartDate}
              placeholderText="Tanggal Akhir"
              className="w-full md:w-36 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
              dateFormat="dd/MM/yyyy"
            />
            <button
              onClick={handleApplyCustomDate}
              disabled={!customStartDate || !customEndDate}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                period === "custom"
                  ? "bg-accent text-white shadow"
                  : "bg-white text-gray-600 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>

      {/* Chart & Table Section */}
      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loading />
        </div>
      ) : (
        <>
          {/* Chart Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Top 5 Produk Berdasarkan Skor Gabungan
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(200, 200, 200, 0.1)" }}
                    contentStyle={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="Dilihat"
                    fill="#F9AE18"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                  <Bar
                    dataKey="Keranjang"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-gray-500">
                Tidak ada data untuk ditampilkan di chart.
              </div>
            )}
          </div>

          {/* Sort and Table Section */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-600">Urutkan:</span>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSortType(option.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  sortType === option.key
                    ? "bg-accent text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {renderProductTable(topProducts)}
        </>
      )}

      {/* Footer Note */}
      {!loading && topProducts.length > 0 && (
        <div className="mt-6 text-xs text-gray-500 text-center">
          * Data berdasarkan interaksi pengguna dalam periode yang dipilih
        </div>
      )}
    </div>
  );
};

export default ProductAnalyticsPage;
