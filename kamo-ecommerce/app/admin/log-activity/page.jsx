"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/service/api";
import Loading from "@/components/Loading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilter, FaHistory, FaCopy } from "react-icons/fa";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

const LOGS_PER_PAGE = 10;

const ACTION_TYPES = {
  CREATE: "Buat Baru",
  UPDATE: "Perbarui",
  DELETE: "Hapus",
  UPDATE_STATUS: "Update Status",
  APPROVE_CANCELLATION: "Setujui Batal",
  REJECT_CANCELLATION: "Tolak Batal",
};

const ENTITY_TYPES = {
  Product: "Produk",
  Category: "Kategori",
  Order: "Pesanan",
  User: "Pengguna",
  FeaturedProduct: "Produk Unggulan",
  Discount: "Diskon",
};

const LogPage = () => {
  const { admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    action_type: "",
    admin_id: "",
    entity_type: "",
    startDate: null,
    endDate: null,
  });

  const [admins, setAdmins] = useState([]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: LOGS_PER_PAGE,
        ...filters,
        startDate: filters.startDate ? filters.startDate.toISOString() : "",
        endDate: filters.endDate ? filters.endDate.toISOString() : "",
      };
      const res = await api.get("/logs/activity", { params });
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalLogs(res.data.totalLogs);
    } catch (error) {
      console.error("Gagal memuat log:", error);
      toast.error("Gagal memuat data log.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    if (!authLoading) {
      if (!admin || admin.email !== "superadmin@kampoengmoge.com") {
        toast.error("Akses ditolak. Hanya superadmin yang diizinkan.");
        router.replace("/admin");
      }
    }
  }, [admin, authLoading, router]);

  useEffect(() => {
    // Fetch logs when component mounts or dependencies change
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await api.get("/logs/admins");
        setAdmins(res.data);
      } catch (error) {
        console.error("Gagal memuat daftar admin:", error);
      }
    };
    fetchAdmins();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page on new filter
    // fetchLogs will be called by the useEffect hook
  };

  const handleResetFilters = () => {
    setFilters({
      action_type: "",
      admin_id: "",
      entity_type: "",
      startDate: null,
      endDate: null,
    });
    setCurrentPage(1);
  };

  const handleCopyDetails = (detailsString) => {
    if (!detailsString) {
      toast.error("Tidak ada detail untuk disalin.");
      return;
    }

    let contentToCopy = detailsString;
    try {
      // Coba format JSON agar lebih rapi saat disalin
      const parsedDetails = JSON.parse(detailsString);
      contentToCopy = JSON.stringify(parsedDetails, null, 2);
    } catch (e) {
      // Jika bukan JSON, salin teks aslinya
    }

    navigator.clipboard.writeText(contentToCopy).then(
      () => {
        toast.success("Detail berhasil disalin ke clipboard.");
      },
      (err) => {
        console.error("Gagal menyalin:", err);
        toast.error("Gagal menyalin detail.");
      }
    );
  };

  const renderDetails = (log) => {
    if (!log.details) return "-";
    return (
      <button
        onClick={() => handleCopyDetails(log.details)}
        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-gray-300 transition-colors cursor-pointer"
        title="Salin Detail"
      >
        <FaCopy />
      </button>
    );
  };

  if (authLoading || !admin || admin.email !== "superadmin@kampoengmoge.com") {
    return <Loading />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <FaHistory className="text-2xl text-accent" />
        <h1 className="text-2xl font-bold text-gray-800">Log Aktivitas</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="w-full">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Admin
            </label>
            <select
              name="admin_id"
              value={filters.admin_id}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Semua Admin</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Tipe Aksi
            </label>
            <select
              name="action_type"
              value={filters.action_type}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Semua Aksi</option>
              {Object.entries(ACTION_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Tipe Entitas
            </label>
            <select
              name="entity_type"
              value={filters.entity_type}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Semua Entitas</option>
              {Object.entries(ENTITY_TYPES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Rentang Tanggal
            </label>
            <DatePicker
              selectsRange={true}
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={handleDateChange}
              isClearable={true}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
              placeholderText="Pilih tanggal"
              dateFormat="dd/MM/yyyy"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="w-full bg-accent text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors"
            >
              <FaFilter /> Terapkan
            </button>
            <button
              onClick={handleResetFilters}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Detail
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
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      <div className="font-semibold">{log.admin_name} </div>
                      <div>
                        <span className="text-gray-500 font-normal">
                          {log.admin.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.action_type === "CREATE"
                            ? "bg-green-100 text-green-800"
                            : log.action_type.startsWith("UPDATE")
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ACTION_TYPES[log.action_type] || log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.entity_type
                        ? `${
                            ENTITY_TYPES[log.entity_type] || log.entity_type
                          } (${log.entity_id})`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "SUCCESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {log.status === "SUCCESS" ? "Sukses" : "Gagal"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      {renderDetails(log)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Tidak ada data log yang cocok.
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
              Halaman {currentPage} dari {totalPages} ({totalLogs} total log)
            </p>
          </div>
          <div className="flex-1 flex justify-between sm:justify-end gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogPage;
