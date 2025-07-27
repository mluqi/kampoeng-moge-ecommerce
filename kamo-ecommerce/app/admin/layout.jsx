"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Loading from "@/components/Loading";
import Navbar from "../../components/admin/Navbar";
import { AdminChatProvider } from "../../contexts/AdminChatContext";

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
    <AdminChatProvider>
      <div className="flex flex-col h-screen bg-gray-50/50">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          {/* Area konten utama sekarang bisa di-scroll secara independen */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminChatProvider>
  );
}
