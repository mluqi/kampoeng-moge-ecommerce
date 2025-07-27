"use client";
import React from "react";

const StatusBadge = ({ status }) => {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize";
  let specificClasses = "";

  switch (status) {
    case "completed":
      specificClasses = "bg-green-100 text-green-800";
      break;
    case "processing":
    case "shipped":
      specificClasses = "bg-yellow-100 text-yellow-800";
      break;
    case "cancelled":
      specificClasses = "bg-red-100 text-red-800";
      break;
    default: // pending
      specificClasses = "bg-gray-100 text-gray-800";
      break;
  }

  return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};

export default StatusBadge;
