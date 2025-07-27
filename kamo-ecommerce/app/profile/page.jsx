"use client";
import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileTab from "@/components/profile/ProfileTab";
import AddressTab from "@/components/profile/AddressTab";
import WishlistTab from "@/components/profile/WishlistTab";
import OrdersTab from "@/components/profile/OrdersTab";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaBoxOpen,
  FaChevronDown,
  FaSignOutAlt,
} from "react-icons/fa";

const navItems = [
  { name: "Profil", tab: "profile", icon: <FaUser /> },
  { name: "Alamat", tab: "address", icon: <FaMapMarkerAlt /> },
  { name: "Wishlist", tab: "wishlist", icon: <FaHeart /> },
  { name: "Pesanan Saya", tab: "orders", icon: <FaBoxOpen /> },
];

const ProfileContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading, userLogout } = useUserAuth();
  const activeTab = searchParams.get("tab") || "profile";
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeNavItem =
    navItems.find((item) => item.tab === activeTab) || navItems[0];

  if (loading) {
    return <Loading />;
  }

  if (!user && !loading) {
    router.replace("/account");
    return <Loading />;
  }

  const handleTabChange = (tab) => {
    router.push(`/profile?tab=${tab}`);
    setIsMobileNavOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "address":
        return <AddressTab />;
      case "wishlist":
        return <WishlistTab />;
      case "orders":
        return <OrdersTab />;
      case "profile":
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block lg:col-span-1">
        <ProfileSidebar />
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {/* Mobile Navigation Dropdown */}
        <div className="lg:hidden mb-6 relative">
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-accent">{activeNavItem.icon}</span>
              <span className="font-medium">{activeNavItem.name}</span>
            </div>
            <FaChevronDown
              className={`transition-transform duration-200 ${
                isMobileNavOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isMobileNavOpen && (
            <div className="absolute top-full mt-1 w-full bg-white shadow-lg rounded-lg z-10 border">
              <nav className="p-2">
                {navItems.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => handleTabChange(item.tab)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-md hover:bg-gray-100"
                  >
                    <span className="w-5 h-5 text-gray-500">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>
              <div className="p-2 border-t">
                <button
                  onClick={userLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-md text-red-600 hover:bg-red-50"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Suspense fallback={<Loading />}>
            <ProfileContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Profile;
