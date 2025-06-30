"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Loading from "@/components/Loading";
import Navbar from "../../components/admin/Navbar";

export default function AdminLayout({ children }) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/account");
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    return <Loading />;
  }

  // Jika terautentikasi, tampilkan layout admin dengan children (halaman sebenarnya)
  return (
    <>
      <Navbar/>
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
    </>
  );
}