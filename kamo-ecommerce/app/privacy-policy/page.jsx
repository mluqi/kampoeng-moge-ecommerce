/* eslint-disable react/no-unescaped-entities */
"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const KebijakanPrivasi = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 md:pb-18">
        <div className="flex flex-col items-start">
          <div className="flex flex-col items-end pt-8 md:pt-12">
            <p className="text-2xl md:text-3xl font-medium">
              Kebijakan Privasi
            </p>
            <div className="w-16 h-0.5 bg-accent rounded-full mt-1"></div>
          </div>

          <div className="mt-8 md:mt-12 text-gray-700 space-y-4">
            <section>
              <h2 className="text-xl font-medium">1. Pengumpulan Informasi</h2>
              <p>
                Kami mengumpulkan informasi pribadi seperti nama, email, nomor
                telepon, dan alamat pengiriman saat Anda mendaftar, memesan,
                atau menghubungi layanan kami.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium">2. Penggunaan Informasi</h2>
              <p>
                Data yang dikumpulkan digunakan untuk memproses pesanan,
                memberikan layanan pelanggan, mengirim promo, dan meningkatkan
                pengalaman pengguna.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium">3. Perlindungan Data</h2>
              <p>
                Kami menggunakan protokol keamanan seperti enkripsi dan
                pembatasan akses untuk menjaga data Anda.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium">4. Pihak Ketiga</h2>
              <p>
                Informasi Anda tidak dibagikan kecuali ke mitra pengiriman,
                pembayaran, atau untuk keperluan hukum.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium">5. Cookie</h2>
              <p>
                Situs ini menggunakan cookie untuk meningkatkan pengalaman
                pengguna dan analitik. Anda dapat menonaktifkannya lewat
                pengaturan browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium">6. Persetujuan</h2>
              <p>
                Dengan menggunakan situs ini, Anda menyetujui kebijakan privasi
                kami.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default KebijakanPrivasi;
