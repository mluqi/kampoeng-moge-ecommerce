"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/service/api";
import Loading from "@/components/Loading";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilter, FaServer, FaCopy } from "react-icons/fa";
import { TbApi } from "react-icons/tb";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

const LOGS_PER_PAGE = 10;

const ApiLogPage = () => {
  const { admin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    service_name: "",
    status: "",
    startDate: null,
    endDate: null,
  });

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
      const res = await api.get("/logs/api", { params });
      setLogs(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotalLogs(res.data.totalLogs);
    } catch (error) {
      console.error("Gagal memuat log API:", error);
      toast.error("Gagal memuat data log API.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    if (!authLoading) {
      if (!admin || admin.email !== "superadmin@kampoengmoge.com") {
        toast.error("Akses ditolak. Hanya superadmin yang diizinkan.");
        router.replace("/admin");
      } else {
        fetchLogs();
      }
    }
  }, [admin, authLoading, router, fetchLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({
      service_name: "",
      status: "",
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
    navigator.clipboard.writeText(detailsString).then(
      () => toast.success("Payload berhasil disalin."),
      () => toast.error("Gagal menyalin payload.")
    );
  };

  const renderPayloadButton = (payload) => {
    if (!payload) return "-";
    return (
      <button
        onClick={() => handleCopyDetails(payload)}
        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs flex items-center gap-1 hover:bg-gray-300 transition-colors"
        title="Salin Payload"
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
        <TbApi className="text-2xl text-accent" />
        <h1 className="text-2xl font-bold text-gray-800">Log API Eksternal</h1>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="w-full">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Layanan
            </label>
            <select
              name="service_name"
              value={filters.service_name}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Semua Layanan</option>
              <option value="JNE">JNE</option>
              <option value="TIKTOK_SHOP">TikTok Shop</option>
              <option value="XENDIT">Xendit</option>
            </select>
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Semua Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
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
              className="w-full bg-accent text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-accent/90"
            >
              <FaFilter /> Terapkan
            </button>
            <button
              onClick={handleResetFilters}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
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
                  Layanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Durasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Response
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
                      {new Date(log.createdAt).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {log.service_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          log.status === "SUCCESS"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {log.duration_ms ? `${log.duration_ms} ms` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {renderPayloadButton(log.request_payload)}
                    </td>
                    <td className="px-6 py-4">
                      {renderPayloadButton(log.response_payload)}
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

export default ApiLogPage;
