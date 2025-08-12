import { assets } from "../../assets/assets";
import Image from "next/image";
import { useAppContext } from "@/contexts/AppContext";
import { FaBars } from "react-icons/fa";

const Navbar = ({ onOpenSidebar }) => {
  const { router } = useAppContext();

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:px-8">
      <div className="flex items-center gap-3">
        {/* Hamburger menu for mobile */}
        <button
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={onOpenSidebar}
        >
          <FaBars size={22} />
        </button>
        <Image
          onClick={() => router.push("/")}
          className="w-28 lg:w-32 cursor-pointer"
          src={assets.logo_accent}
          alt="logo"
          priority
        />
      </div>
      {/* Logout button removed, replaced by collapse/expand in Sidebar */}
    </div>
  );
};

export default Navbar;
