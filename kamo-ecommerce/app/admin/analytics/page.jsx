"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import Loading from "@/components/Loading";
import Image from "next/image";
import {
  FaEye,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PERIOD_OPTIONS = [
  { key: "24h", label: "24 Jam" },
  { key: "3d", label: "3 Hari" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
];

const ProductAnalyticsPage = () => {
  const [period, setPeriod] = useState("7d");
  const [topProducts, setTopProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchTopProducts = useCallback(async (currentPeriod, page) => {
    setLoading(true);
    try {
      const response = await api.get("/analytics/top-products", {
        params: {
          period: currentPeriod,
          limit: 10,
          page: page,
        },
      });
      setTopProducts(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error("Gagal mengambil data analitik:", error);
      setTopProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopProducts(period, currentPage);
  }, [period, currentPage, fetchTopProducts]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

const chartData = topProducts
  .slice(0, 5)
  .map((p) => ({
    name:
      p.product_name.substring(0, 15) +
      (p.product_name.length > 15 ? "..." : ""),
    views: p.view_count,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaChartLine className="text-2xl text-accent" />
        <h1 className="text-2xl font-bold text-gray-800">
          Analitik Produk Terpopuler
        </h1>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-lg">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => {
              setPeriod(option.key);
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
      </div>

      {/* Chart Section */}
      {!loading && topProducts.length > 0 && (
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Top 5 Produk Dilihat
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#f0f0f0"
              />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12, fill: "#4b5563" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(249, 174, 24, 0.1)" }}
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`${value} kali`, "Jumlah Dilihat"]}
                labelStyle={{ fontWeight: "bold", color: "#111827" }}
              />
              <Bar
                dataKey="views"
                fill="#F9AE18"
                name="Jumlah Dilihat"
                radius={[0, 4, 4, 0]} // Rounded corners on the right side
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 text-xs text-gray-500 text-center">
            * Data berdasarkan jumlah pengunjung dalam periode yang dipilih
          </div>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <Loading />
      ) : topProducts.length > 0 ? (
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {topProducts.map((product, index) => (
              <li key={product.product_id} className="p-4 hover:bg-gray-50">
                <Link
                  href={`/product/${product.product_id}`}
                  target="_blank"
                  className="flex items-center gap-4"
                >
                  <span className="text-lg font-bold text-gray-400 w-8 text-center">
                    {index + 1}
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
                    <p className="font-semibold text-gray-800">
                      {product.product_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.product_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-bold text-accent">
                    <FaEye />
                    <span>{product.view_count}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border rounded-lg">
          <p className="text-gray-500">
            Tidak ada data produk yang dilihat untuk periode ini.
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductAnalyticsPage;
