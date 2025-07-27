"use client";

import React from "react";

const TiktokStatusBadge = ({ status }) => {
  if (!status) {
    return <span className="text-xs text-gray-400 italic">-</span>;
  }

  const statusStyles = {
    ACTIVATE: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    DRAFT: "bg-blue-100 text-blue-800",
    SELLER_DEACTIVATED: "bg-gray-100 text-gray-800",
    PLATFORM_DEACTIVATED: "bg-gray-100 text-gray-800",
    FREEZE: "bg-cyan-100 text-cyan-800",
    FAILED: "bg-red-100 text-red-800",
    DELETED: "bg-red-100 text-red-800",
    FETCH_ERROR: "bg-orange-100 text-orange-800",
  };

  const style = statusStyles[status] || "bg-gray-100 text-gray-800";
  const formattedStatus = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());

  return (
    <span
      className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}
    >
      {formattedStatus}
    </span>
  );
};

export default TiktokStatusBadge;
