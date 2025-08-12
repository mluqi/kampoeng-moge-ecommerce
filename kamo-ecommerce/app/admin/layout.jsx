"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Loading from "@/components/Loading";
import Navbar from "../../components/admin/Navbar";
import { AdminChatProvider } from "../../contexts/AdminChatContext";
import { TiktokOrderProvider } from "@/contexts/TiktokOrderContext";

export default function AdminLayout({ children }) {
  const { admin, loading } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/account");
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    return <Loading />;
  }

  // Margin left untuk navbar & main content di desktop
  const desktopMargin = sidebarExpanded ? "md:ml-64" : "md:ml-16";

  return (
    <AdminChatProvider>
      <TiktokOrderProvider>
        <div className="flex h-screen bg-gray-50/50">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            isExpanded={sidebarExpanded}
            setIsExpanded={setSidebarExpanded}
          />

          <div
            className={`flex-1 flex flex-col transition-all duration-300 ${desktopMargin}`}
          >
            <Navbar onOpenSidebar={() => setMobileSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </TiktokOrderProvider>
    </AdminChatProvider>
  );
}
