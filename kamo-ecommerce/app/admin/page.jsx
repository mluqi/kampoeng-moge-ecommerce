"use client";
import React, { useState, useEffect, useCallback } from "react";
import api from "@/service/api";
import Loading from "@/components/Loading";
import {
  FaBoxOpen,
  FaDollarSign,
  FaShoppingCart,
  FaUserPlus,
  FaChartLine,
  FaBoxes,
  FaUsers,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/admin/StatusBadge";
import SalesChart from "@/components/admin/SalesChart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatCard = ({ icon, title, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-lg shadow flex items-center gap-6 border-l-4 ${color} ${
      onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
    }`}
  >
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const router = useRouter();

  // Transform best selling products data for chart
  const getProductPerformanceData = () => {
    console.log("stats", stats);
    if (!stats?.bestSellingProducts || stats.bestSellingProducts.length === 0) {
      return {
        labels: ["Tidak ada data"],
        datasets: [
          {
            label: "Penjualan",
            data: [0],
            backgroundColor: ["rgba(156, 163, 175, 0.6)"],
            borderColor: ["rgba(156, 163, 175, 1)"],
            borderWidth: 1,
          },
        ],
      };
    }

    return {
      labels: stats.bestSellingProducts.map(
        (product) => `Produk ${product.product_id}`
      ),
      datasets: [
        {
          label: "Total Terjual",
          data: stats.bestSellingProducts.map(
            (product) => product.totalQuantity
          ),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Transform payment methods data for chart
  const getPaymentMethodsData = () => {
    if (
      !stats?.favoritePaymentMethods ||
      stats.favoritePaymentMethods.length === 0
    ) {
      return {
        labels: ["Tidak ada data"],
        datasets: [
          {
            label: "Metode Pembayaran",
            data: [0],
            backgroundColor: ["rgba(156, 163, 175, 0.6)"],
            borderWidth: 1,
          },
        ],
      };
    }

    return {
      labels: stats.favoritePaymentMethods.map((method) => {
        const methodNames = {
          bank_transfer: "Transfer Bank",
          credit_card: "Kartu Kredit",
          e_wallet: "E-Wallet",
          qris: "QRIS",
          virtual_account: "Virtual Account",
          cash_on_delivery: "COD",
        };
        return methodNames[method.payment_method] || method.payment_method;
      }),
      datasets: [
        {
          label: "Jumlah Penggunaan",
          data: stats.favoritePaymentMethods.map((method) =>
            parseInt(method.count)
          ),
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setChartLoading(true);

    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());

    try {
      // Fetch stats and chart data in parallel
      const [statsRes, chartRes] = await Promise.all([
        api.get(`/dashboard/stats?${params.toString()}`),
        api.get(`/dashboard/sales-chart?${params.toString()}`),
      ]);
      setStats(statsRes.data);
      setChartData(chartRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !stats) {
    return <Loading />;
  }

  if (!stats) {
    return <div className="p-8 text-center">Gagal memuat data dashboard.</div>;
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-2">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
            }}
            isClearable={true}
            placeholderText="Pilih rentang tanggal"
            className="p-2 border rounded-md text-sm w-64"
          />
          <button
            onClick={fetchDashboardData}
            className="p-2 border rounded-md bg-white text-sm hover:bg-gray-50 transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FaDollarSign className="text-green-500" />}
          title="Total Pendapatan"
          value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`}
          color="border-green-500"
          onClick={() => router.push("/admin/orders")}
        />
        <StatCard
          icon={<FaShoppingCart className="text-blue-500" />}
          title="Total Pesanan"
          value={stats.totalOrders}
          color="border-blue-500"
          onClick={() => router.push("/admin/orders")}
        />
        <StatCard
          icon={<FaBoxOpen className="text-yellow-500" />}
          title="Pesanan Baru (Hari Ini)"
          value={stats.newOrdersToday}
          color="border-yellow-500"
          onClick={() => router.push("/admin/orders")}
        />
        <StatCard
          icon={<FaUserPlus className="text-purple-500" />}
          title="Pengguna Baru (Hari Ini)"
          value={stats.newUsersToday}
          color="border-purple-500"
          onClick={() => router.push("/admin/users")}
        />
        <StatCard
          icon={<FaBoxes className="text-orange-500" />}
          title="Total Produk Terjual"
          value={stats.totalProductSold || "125"}
          color="border-orange-500"
          onClick={() => router.push("/admin/product-list")}
        />
        <StatCard
          icon={<FaUsers className="text-teal-500" />}
          title="Total Pelanggan"
          value={stats.totalCustomers}
          color="border-teal-500"
          onClick={() => router.push("/admin/users")}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Pendapatan 7 Hari Terakhir
          </h3>
          <SalesChart data={chartData} loading={chartLoading} />
        </div>

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold p-6 border-b">
            Pesanan Terbaru
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.order_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/orders/${order.order_id}`)
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      Rp {order.total_amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {stats.recentOrders.length === 0 && (
              <p className="text-center p-6 text-gray-500">
                Tidak ada pesanan terbaru.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Produk Terlaris
          </h3>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : (
              <Bar
                data={getProductPerformanceData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "5 Produk Terlaris",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Metode Pembayaran Favorit
          </h3>
          <div className="h-80">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : (
              <Pie
                data={getPaymentMethodsData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "right",
                    },
                    title: {
                      display: true,
                      text: "Distribusi Metode Pembayaran",
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
