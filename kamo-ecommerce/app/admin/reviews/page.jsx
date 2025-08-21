"use client";
import React, { useEffect, useState } from "react";
import api from "@/service/api";
import Image from "next/image";
import { FiRefreshCw, FiEye, FiEyeOff, FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews/admin/all");
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      await api.patch(`/reviews/admin/${reviewId}/status`, { status });
    } catch (error) {
      throw error;
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleStatus = async (reviewId, currentStatus) => {
    const newStatus = currentStatus === "show" ? "hide" : "show";
    try {
      await updateReviewStatus(reviewId, newStatus);
      toast.success(`Review status updated to ${newStatus}`);
      loadReviews();
    } catch (error) {
      toast.error("Failed to update review status");
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user?.user_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.product?.product_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Kelola Ulasan Produk
        </h1>
        <button
          onClick={loadReviews}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          disabled={loading}
        >
          <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Muat Ulang
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reviews..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          )}
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="show">Tampilkan</option>
          <option value="hide">Sembunyikan</option>
        </select>

        <div className="flex items-center justify-end text-sm text-gray-500">
          Menampilkan {filteredReviews.length} dari {reviews.length} ulasan
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== "all"
              ? "No reviews match your criteria"
              : "No reviews found"}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Hilangkan filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan & Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Komentar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <Image
                            width={40}
                            height={40}
                            src={review.user?.user_photo || "/default-user.png"}
                            alt="User"
                            className="rounded-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {review.user?.user_name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500 max-w-[600px] truncate">
                            {review.product?.product_name &&
                            review.product.product_name.length > 100
                              ? review.product.product_name.substring(0, 100) +
                                "..."
                              : review.product?.product_name || review.product_id}
                            {review.product?.product_name || review.product_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderRatingStars(review.rating)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          review.status === "show"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          handleToggleStatus(review.id, review.status)
                        }
                        className={`flex items-center gap-1 px-3 py-1 rounded-md ${
                          review.status === "show"
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {review.status === "show" ? (
                          <>
                            <FiEyeOff className="w-4 h-4" />
                            Hide
                          </>
                        ) : (
                          <>
                            <FiEye className="w-4 h-4" />
                            Show
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
