"use client";

import { useState, useEffect, Suspense } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import api from "@/service/api";
import Loading from "@/components/Loading";
import { useSearchParams } from "next/navigation";

// Komponen terpisah yang menggunakan useSearchParams
const AccountContent = () => {
  const { router } = useAppContext();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { admin, loading: adminLoading } = useAuth();
  const [role, setRole] = useState("user");
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sliderImages, setSliderImages] = useState([
    assets.login_banner_1,
    assets.login_banner_2,
    assets.login_banner_3,
  ]);

  useEffect(() => {
    const fetchLoginBanners = async () => {
      try {
        const response = await api.get("/login-banners");
        if (response.data && response.data.length > 0) {
          const dynamicImages = response.data.map(
            (banner) => `${process.env.NEXT_PUBLIC_BACKEND_URL}${banner.images}`
          );
          setSliderImages(dynamicImages);
        }
        // console.log(response.data)
      } catch (error) {
        console.error(
          "Failed to fetch login banners, using static images.",
          error
        );
      }
    };
    fetchLoginBanners();
  }, []);

  const { loginAdmin } = useAuth();
  const { user, loading: userLoading } = useUserAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    // Setelah loading selesai, periksa status login
    if (!adminLoading && !userLoading) {
      if (admin) router.replace("/admin");
      if (user) router.replace(callbackUrl || "/");
    }
  }, [admin, user, adminLoading, userLoading, router, callbackUrl]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    const result = await loginAdmin(data);
    if (!result.success) {
      setError(result.message);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % sliderImages.length
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: callbackUrl || "/" }); // Memulai alur autentikasi Google OAuth
  };

  if (adminLoading || userLoading) {
    return <Loading />; // Show loading screen while checking auth status
  }

  return (
    <div className="min-h-screen w-full flex bg-white relative">
      {/* Left Column: Image Slider */}
      <div className="hidden md:block w-1/2 relative aspect-[16/9]">
        {sliderImages.map((imageSrc, index) => (
          <Image
            key={index}
            src={imageSrc}
            alt={`Kampoeng Moge gallery image ${index + 1}`}
            fill
            style={{ objectFit: "cover" }}
            sizes="50vw"
            priority
            className={`transition-opacity duration-1000 ease-in-out absolute inset-0 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Right Column: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        {" "}
        {/* Centering content within this half */}
        <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-10 ">
          {/* The actual form card */}
          <div>
            <Image
              className="mx-auto h-12 w-auto cursor-pointer"
              src={assets.logo_accent}
              alt="Logo"
              width={100}
              height={100}
              priority
              onClick={() => router.push("/")}
            />
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-700">
              {role === "user" ? "Selamat Datang!" : "Admin Panel"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Pilih peran Anda untuk melanjutkan
            </p>
          </div>
          {/* Role Selector */}
          <div
            className="flex justify-center p-1.5 bg-gray-100 rounded-full"
            role="group"
          >
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-full transition-colors duration-300 ${
                role === "user"
                  ? "bg-white text-accent shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Pengguna
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`w-full py-2 px-4 text-sm font-semibold rounded-full transition-colors duration-300 ${
                role === "admin"
                  ? "bg-white text-accent shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Admin
            </button>
          </div>
          {/* Conditional Content */}
          {role === "user" ? (
            // User Login (Google)
            <div className="text-center pt-2">
              <p className="text-gray-600 mb-6 text-sm">
                Masuk dengan akun Google Anda untuk melanjutkan.
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer hover:bg-accent/90 hover:text-white"
              >
                <span className="mr-2 text-lg">
                  <FcGoogle />
                </span>
                Masuk dengan Google
              </button>
            </div>
          ) : (
            // Admin Login (Form)
            <form className="space-y-5 pt-2" onSubmit={handleAdminLogin}>
              <div>
                <label htmlFor="email-address" className="text-accent">
                  Email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={data.email}
                  onChange={handleInputChange}
                  className="appearance-none mt-2 rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm "
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-accent">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={data.password}
                  onChange={handleInputChange}
                  className="appearance-none mt-2 rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-accent focus:border-accent focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-accent hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Masuk sebagai Admin
                </button>
              </div>
            </form>
          )}
          <button
            onClick={() => router.push("/")}
            className="group relative w-full flex justify-center py-2 px-4 text-gray-500 hover:text-accent cursor-pointer"
          >
            &larr; Kembali ke Beranda
          </button>{" "}
        </div>
      </div>
    </div>
  );
};

// Loading fallback component khusus untuk Account
const AccountLoadingFallback = () => {
  return (
    <div className="min-h-screen w-full flex bg-white relative">
      {/* Left Column: Image Placeholder */}
      <div className="hidden md:block w-1/2 relative">
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      </div>

      {/* Right Column: Form Placeholder */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-10">
          {/* Logo placeholder */}
          <div className="mx-auto h-12 w-24 bg-gray-200 rounded animate-pulse" />

          {/* Title placeholders */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
          </div>

          {/* Role selector placeholder */}
          <div className="h-12 bg-gray-100 rounded-full animate-pulse" />

          {/* Form placeholders */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Back button placeholder */}
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Main component dengan Suspense wrapper
const Account = () => {
  return (
    <Suspense fallback={<AccountLoadingFallback />}>
      <AccountContent />
    </Suspense>
  );
};

export default Account;
