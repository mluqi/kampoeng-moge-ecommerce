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

const ProductAnalyticsPage = () => {
  const [period, setPeriod] = useState("24h");
  const [activeTab, setActiveTab] = useState("views"); // "views" atau "carts"
  const [topViewedProducts, setTopViewedProducts] = useState([]);
  const [topCartProducts, setTopCartProducts] = useState([]);
  const [viewChartData, setViewChartData] = useState([]);
  const [cartChartData, setCartChartData] = useState([]);
  const [currentViewPage, setCurrentViewPage] = useState(1);
  const [currentCartPage, setCurrentCartPage] = useState(1);
  const [totalViewPages, setTotalViewPages] = useState(1);
  const [totalCartPages, setTotalCartPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState({
    id: null,
    type: null,
  });
  const [accordionData, setAccordionData] = useState([]);
  const [accordionLoading, setAccordionLoading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchChartData = useCallback(
    async (currentPeriod) => {
      setLoadingChart(true);
      const params = {
        limit: 5,
        page: 1,
      };

      if (currentPeriod === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate.toISOString();
        params.endDate = customEndDate.toISOString();
      } else {
        params.period = currentPeriod;
      }

      try {
        // Fetch data untuk chart views
        const viewResponse = await api.get("/analytics/top-products", {
          params: { ...params, sort: "views" },
        });

        // Fetch data untuk chart carts
        const cartResponse = await api.get("/analytics/top-products", {
          params: { ...params, sort: "carts" },
        });

        const formatName = (p) =>
          p.product_name.substring(0, 15) +
          (p.product_name.length > 15 ? "..." : "");

        const viewsData = viewResponse.data.data.map((p) => ({
          name: formatName(p),
          Dilihat: p.view_count,
        }));

        const cartsData = cartResponse.data.data.map((p) => ({
          name: formatName(p),
          Keranjang: p.cart_add_count,
        }));

        setViewChartData(viewsData);
        setCartChartData(cartsData);
      } catch (error) {
        console.error("Gagal mengambil data chart:", error);
      } finally {
        setLoadingChart(false);
      }
    },
    [customStartDate, customEndDate]
  );

  const fetchTopProducts = useCallback(
    async (currentPeriod, sortType, page) => {
      setLoading(true);
      const params = {
        limit: 10,
        page: page,
        sort: sortType, // "views" atau "carts"
      };

      if (currentPeriod === "custom" && customStartDate && customEndDate) {
        params.startDate = customStartDate.toISOString();
        params.endDate = customEndDate.toISOString();
      } else {
        params.period = currentPeriod;
      }

      try {
        const response = await api.get("/analytics/top-products", {
          params,
        });

        if (sortType === "views") {
          setTopViewedProducts(response.data.data);
          setTotalViewPages(response.data.totalPages);
          setCurrentViewPage(response.data.currentPage);
        } else {
          setTopCartProducts(response.data.data);
          setTotalCartPages(response.data.totalPages);
          setCurrentCartPage(response.data.currentPage);
        }
      } catch (error) {
        console.error("Gagal mengambil data analitik:", error);
        if (sortType === "views") {
          setTopViewedProducts([]);
          setTotalViewPages(1);
        } else {
          setTopCartProducts([]);
          setTotalCartPages(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [customStartDate, customEndDate]
  );

  useEffect(() => {
    // Fetch data untuk kedua tabel
    fetchTopProducts(period, "views", currentViewPage);
    fetchTopProducts(period, "carts", currentCartPage);
  }, [period, currentViewPage, currentCartPage, fetchTopProducts]);

  useEffect(() => {
    fetchChartData(period);
  }, [period, fetchChartData]);

  const handlePageChange = (newPage, type) => {
    if (type === "views" && newPage >= 1 && newPage <= totalViewPages) {
      setCurrentViewPage(newPage);
    } else if (type === "carts" && newPage >= 1 && newPage <= totalCartPages) {
      setCurrentCartPage(newPage);
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
      setCurrentViewPage(1);
      setCurrentCartPage(1);
    }
  };

  const renderProductTable = (products, type, currentPage, totalPages) => {
    const isViews = type === "views";
    const iconComponent = isViews ? <FaEye /> : <FaShoppingCart />;
    const iconColor = isViews ? "text-accent" : "text-emerald-500";
    const countKey = isViews ? "view_count" : "cart_add_count";
    const title = isViews
      ? "Produk Paling Sering Dilihat"
      : "Produk Paling Sering Ditambah ke Keranjang";

    return (
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-2">
            <span className={iconColor}>{iconComponent}</span>
            {title}
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
                    <button
                      onClick={() =>
                        handleAccordionToggle(product.product_id, type)
                      }
                      className={`flex items-center gap-2 text-sm font-bold ${iconColor} transition-transform hover:scale-110 cursor-pointer`}
                      title={
                        isViews
                          ? "Lihat detail pengunjung"
                          : "Lihat siapa yang menambahkan ke keranjang"
                      }
                    >
                      {iconComponent}
                      <span>{product[countKey]}</span>
                    </button>
                  </div>
                  {/* Accordion Content */}
                  {expandedProduct.id === product.product_id &&
                    expandedProduct.type === type && (
                      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                        {accordionLoading ? (
                          <div className="flex justify-center items-center h-24">
                            <Loading />
                          </div>
                        ) : accordionData.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              {type === "views"
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
                                    {type === "carts" && (
                                      <p className="text-xs text-gray-600">
                                        Jumlah:{" "}
                                        <span className="font-bold">
                                          {item.quantity}
                                        </span>
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                      {new Date(
                                        item.viewed_at || item.createdAt
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
                  onClick={() => handlePageChange(currentPage - 1, type)}
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
                  onClick={() => handlePageChange(currentPage + 1, type)}
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
            <div className={`mx-auto text-4xl text-gray-300 mb-4 ${iconColor}`}>
              {iconComponent}
            </div>
            <p className="text-gray-500">
              Tidak ada data produk untuk kategori ini pada periode yang
              dipilih.
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
                setCurrentViewPage(1);
                setCurrentCartPage(1);
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

      {/* Chart Section */}
      {loadingChart ? (
        <div className="mb-8 flex h-[350px] items-center justify-center rounded-lg border bg-white p-4 shadow-sm">
          <Loading />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Chart Dilihat */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Top 5 Produk Dilihat
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={viewChartData}
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
                  cursor={{ fill: "rgba(249, 174, 24, 0.1)" }}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
                <Bar
                  dataKey="Dilihat"
                  fill="#F9AE18"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Keranjang */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Top 5 Produk Ditambahkan ke Keranjang
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cartChartData}
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
                  cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.375rem",
                  }}
                />
                <Bar
                  dataKey="Keranjang"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab Navigation - Only show on mobile */}
      <div className="mb-6 lg:hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("views")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "views"
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <FaEye />
                Produk Paling Sering Dilihat
              </div>
            </button>
            <button
              onClick={() => setActiveTab("carts")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "carts"
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 text-xs">
                <FaShoppingCart />
                Produk Paling Sering Ditambah ke Keranjang
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tables Section */}
      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table Views */}
          <div
            className={`${activeTab === "views" ? "block" : "hidden"} lg:block`}
          >
            {renderProductTable(
              topViewedProducts,
              "views",
              currentViewPage,
              totalViewPages
            )}
          </div>

          {/* Table Carts */}
          <div
            className={`${activeTab === "carts" ? "block" : "hidden"} lg:block`}
          >
            {renderProductTable(
              topCartProducts,
              "carts",
              currentCartPage,
              totalCartPages
            )}
          </div>
        </div>
      )}

      {/* Footer Note */}
      {((activeTab === "views" && topViewedProducts.length > 0) ||
        (activeTab === "carts" && topCartProducts.length > 0)) && (
        <div className="mt-6 text-xs text-gray-500 text-center">
          * Data berdasarkan interaksi pengguna dalam periode yang dipilih
        </div>
      )}
    </div>
  );
};

export default ProductAnalyticsPage;
