import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaArrowLeft } from "react-icons/fa";

const NotFoundPage = () => {
  return (
    <>
      <Navbar />
      <main className="flex items-center justify-center min-h-[70vh] bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-accent">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Maaf, kami tidak dapat menemukan halaman yang Anda cari.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <FaArrowLeft />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFoundPage;
