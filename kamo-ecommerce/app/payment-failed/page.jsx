"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaTimesCircle } from "react-icons/fa";

export default function PaymentFailed() {
  const router = useRouter();

  useEffect(() => {
    // Redirect user back to checkout page after 3 seconds
    const timeout = setTimeout(() => {
      router.push("/checkout");
    }, 3000);

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="h-screen flex flex-col justify-center items-center gap-5 text-center p-4">
      <FaTimesCircle className="text-red-500 text-7xl" />

      <div className="text-2xl font-semibold text-red-600">
        Pembayaran Gagal
      </div>
      <p className="text-gray-600 max-w-sm">
        Terjadi masalah saat memproses pembayaran Anda. Silakan coba lagi atau
        gunakan metode pembayaran lain.
      </p>
      <p className="text-gray-500 text-sm mt-4">
        Anda akan diarahkan kembali ke halaman checkout...
      </p>
    </div>
  );
}
