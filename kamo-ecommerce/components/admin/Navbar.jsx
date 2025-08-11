import { assets } from "../../assets/assets";
import Image from "next/image";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { router } = useAppContext();
  const { logoutAdmin } = useAuth();

  const handleAdminLogout = async () => {
    const result = await logoutAdmin();
    if (result.success) {
      router.push("/account");
    }
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm md:px-8">
      <Image
        onClick={() => router.push("/")}
        className="w-28 lg:w-32 cursor-pointer"
        src={assets.logo_accent}
        alt="logo"
        priority
      />
      <button
        className="bg-red-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm cursor-pointer hover:bg-red-700"
        onClick={handleAdminLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
