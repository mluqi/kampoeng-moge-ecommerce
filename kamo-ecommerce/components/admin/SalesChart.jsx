"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SalesChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        Memuat data grafik...
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            tickFormatter={(value) =>
              new Intl.NumberFormat("id-ID", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value)
            }
          />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(value)
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Pendapatan"
            stroke="#ff8c00"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
