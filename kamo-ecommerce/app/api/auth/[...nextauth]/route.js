/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

// Membuat instance Axios khusus untuk komunikasi server-to-server.
// Ini tidak menggunakan interceptor localStorage dari api.ts karena kode ini berjalan di server.
const backendApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`, // Tambahkan /api di sini
});
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Hanya izinkan login jika provider-nya adalah Google dan emailnya terverifikasi
      if (account.provider === "google") {
        return profile.email_verified;
      }
      return false; // Tolak provider lain
    },
    async jwt({ token, user, account, profile }) {
      // 'user', 'account', dan 'profile' hanya ada saat pertama kali login.
      // Ini adalah tempat yang tepat untuk memanggil backend dan memperkaya token.
      if (account && profile) {
        try {
          // Kirim data pengguna ke backend untuk disimpan/diperbarui
          const backendResponse = await backendApi.post("/auth/google-callback", {
            googleId: profile.sub,
            name: profile.name,
            email: profile.email,
            photo: profile.picture,
          });

          if (backendResponse.data.success) {
            // Jika backend berhasil, tambahkan ID dan peran dari database kita ke token
            const backendUser = backendResponse.data.user;
            token.id = backendUser.id; // Ini adalah user_id dari database Anda
            token.role = backendUser.role; // Ini adalah peran dari backend Anda
            token.name = backendUser.name; // Perbarui nama di token
            token.email = backendUser.email; // Perbarui email di token
          } else {
            console.error("Backend user processing failed:", backendResponse.data.message);
            // Jika backend gagal, Anda bisa memutuskan untuk tidak melanjutkan login
            // atau mengembalikan token tanpa data tambahan.
          }
        } catch (error) {
          console.error("Error in JWT callback contacting backend:", error.message);
          // Jika terjadi error, kembalikan token asli tanpa modifikasi
        }
      }
      // Untuk request selanjutnya, token akan dikembalikan seperti apa adanya.
      return token;
    },
    async session({ session, token }) {
      // Tambahkan ID dari database dan peran ke objek session di sisi klien
      session.user.id = token.id; // ID dari database kita
      session.user.role = token.role;
      // Pastikan nama dan email juga diperbarui di sesi jika ada perubahan
      session.user.name = token.name || session.user.name;
      session.user.email = token.email || session.user.email;
      return session;
    },
  },
  pages: {
    signIn: "/account", // Arahkan ke halaman login kustom Anda
    error: "/account", // Arahkan ke halaman login kustom pada error
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret diperlukan untuk NextAuth.js
});

export { handler as GET, handler as POST };
