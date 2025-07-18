"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react"; // Import signIn dari NextAuth.js
import { useAuth } from "@/contexts/AuthContext";
import { useUserAuth } from "@/contexts/UserAuthContext";
import Loading from "@/components/Loading";

const Account = () => {
  const { router } = useAppContext();
  const { admin, loading: adminLoading } = useAuth();
  const [role, setRole] = useState("user");
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const sliderImages = [
    assets.login_banner_1,
    assets.login_banner_2,
    assets.login_banner_3,
  ];

  const { loginAdmin } = useAuth();
  const { user, loading: userLoading } = useUserAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    // Setelah loading selesai, periksa status login
    if (!adminLoading && !userLoading) {
      if (admin) router.replace("/admin");
      if (user) router.replace("/");
    }
  }, [admin, user, adminLoading, userLoading, router]);

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
    await signIn("google"); // Memulai alur autentikasi Google OAuth
  };
  
  if (adminLoading || userLoading) {
    return <Loading />; // Show loading screen while checking auth status
  }

  return (
    <div className="min-h-screen w-full flex bg-white relative">
      {/* Back to Home Button */}

      {/* Added a subtle background to the whole page */}
      {/* Left Column: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        {" "}
        {/* Centering content within this half */}
        <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-10 ">
          {" "}
          {/* The actual form card */}
          <div>
            <Image
              className="mx-auto h-12 w-auto cursor-pointer"
              src={assets.logo_accent}
              alt="Logo"
              onClick={() => router.push("/")}
            />
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-700">
              {role === "user" ? "Welcome!" : "Admin Sign In"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please select your role to continue
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
              User
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
                Sign in or create an account securely with your Google account.
              </p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer hover:bg-accent/90 hover:text-white"
              >
                <span className="mr-2 text-lg">
                  <FcGoogle />
                </span>
                Sign In with Google
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
                  Sign In
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
      {/* Right Column: Image Slider */}
      <div className="hidden md:block w-1/2 relative">
        {sliderImages.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Kampoeng Moge gallery image ${index + 1}`}
            layout="fill"
            objectFit="cover"
            className={`transition-opacity duration-1000 ease-in-out absolute inset-0 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            priority={index === 0} // Prioritize loading the first image
          />
        ))}
      </div>
    </div>
  );
};

export default Account;
