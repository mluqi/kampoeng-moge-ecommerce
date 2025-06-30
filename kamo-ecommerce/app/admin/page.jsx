"use client";
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Footer from "@/components/admin/Footer";

const Dashboard = () => {
  const { admin, loading } = useAuth();
  const router = useRouter();
  // Data dummy
  const stats = [
    { label: "Total Products", value: 120 },
    { label: "Total Orders", value: 45 },
    { label: "Total Users", value: 30 },
    { label: "Revenue", value: "Rp 12.000.000" },
  ];
  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/account");
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <p>Authenticating...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-accent/10 border border-accent/30 rounded-lg p-6 flex flex-col items-center"
            >
              <div className="text-3xl font-bold text-accent mb-2">
                {stat.value}
              </div>
              <div className="text-lg text-gray-700">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
