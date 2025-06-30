/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SyaratKetentuan = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 md:pb-18">
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-end pt-8 md:pt-12">
            <p className="text-2xl md:text-3xl font-medium">
              Syarat dan Ketentuan
            </p>
            <div className="w-16 h-0.5 bg-accent rounded-full mt-1"></div>
          </div>

          <div className="mt-8 md:mt-12 text-gray-700 space-y-4">
            {" "}
            <h2 className="text-xl font-medium">1. Umum</h2>
            <p>
              Dengan mengakses situs ini, Anda menyetujui syarat dan ketentuan
              yang berlaku. Jika tidak setuju, mohon untuk tidak menggunakan
              layanan kami.
            </p>
            <h2 className="text-xl font-medium">2. Akun Pengguna</h2>
            <p>
              Anda bertanggung jawab atas aktivitas di akun Anda dan menjaga
              keamanan informasi login Anda.
            </p>
            <h2 className="text-xl font-medium">3. Pembelian Produk</h2>
            <p>
              Transaksi diproses setelah pembayaran diterima. Harga dan
              ketersediaan produk dapat berubah sewaktu-waktu.
            </p>
            <h2 className="text-xl font-medium">4. Pengiriman</h2>
            <p>
              Estimasi waktu pengiriman tergantung lokasi. Keterlambatan dari
              pihak kurir bukan tanggung jawab kami.
            </p>
            <h2 className="text-xl font-medium">5. Pengembalian & Penukaran</h2>
            <p>
              Berlaku hanya jika produk rusak atau tidak sesuai. Klaim maksimal
              3 hari sejak barang diterima.
            </p>
            <h2 className="text-xl font-medium">6. Hak Kekayaan Intelektual</h2>
            <p>
              Semua konten situs ini dilindungi hukum dan tidak boleh digunakan
              tanpa izin.
            </p>
            <h2 className="text-xl font-medium">7. Perubahan</h2>
            <p>
              Kami berhak mengubah syarat & ketentuan kapan saja. Perubahan akan
              dipublikasikan di halaman ini.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SyaratKetentuan;
