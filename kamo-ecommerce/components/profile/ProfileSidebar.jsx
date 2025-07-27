"use client";

import { useUserAuth } from "@/contexts/UserAuthContext";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaUser,
  FaMapMarkerAlt,
  FaHeart,
  FaBoxOpen,
  FaSignOutAlt,
} from "react-icons/fa";
import { assets } from "@/assets/assets";

const navItems = [
  { name: "Profil", tab: "profile", icon: <FaUser /> },
  { name: "Alamat", tab: "address", icon: <FaMapMarkerAlt /> },
  { name: "Wishlist", tab: "wishlist", icon: <FaHeart /> },
  { name: "Pesanan Saya", tab: "orders", icon: <FaBoxOpen /> },
];

const ProfileSidebar = () => {
  const { user, profile, userLogout } = useUserAuth();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex flex-col items-center mb-6 pb-6 border-b">
        <Image
          src={profile?.user_photo || user?.image || assets.user_icon}
          alt={profile?.user_name || "User"}
          width={80}
          height={80}
          className="rounded-full object-cover mb-3"
        />
        <h2 className="font-bold text-lg text-gray-800">
          {profile?.user_name || user?.name}
        </h2>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.tab}
            href={`/profile?tab=${item.tab}`}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === item.tab
                ? "bg-accent text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t">
          <button
            onClick={userLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="w-5 h-5">
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default ProfileSidebar;
