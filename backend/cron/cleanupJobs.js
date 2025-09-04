const cron = require("node-cron");
const fs = require("fs/promises"); // Menggunakan fs berbasis Promise untuk kode yang lebih bersih
const path = require("path");

const chatUploadsDir = path.join(__dirname, "../uploads/chat");

/**
 * Fungsi ini membaca direktori uploads/chat, memeriksa tanggal pembuatan setiap file,
 * dan menghapus file yang lebih tua dari 30 hari.
 */
const cleanupOldChatFiles = async () => {
  console.log("Running scheduled job: Cleaning up old chat files...");
  try {
    const files = await fs.readdir(chatUploadsDir);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const file of files) {
      const filePath = path.join(chatUploadsDir, file);
      try {
        const stats = await fs.stat(filePath);
        // Gunakan `birthtime` (waktu pembuatan file) untuk perbandingan
        if (stats.birthtime < thirtyDaysAgo) {
          await fs.unlink(filePath);
          console.log(`Successfully deleted old file: ${filePath}`);
        }
      } catch (statErr) {
        console.error(`Could not process file ${filePath}:`, statErr);
      }
    }
    console.log("Chat file cleanup job finished.");
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`Directory not found, skipping cleanup: ${chatUploadsDir}`);
    } else {
      console.error("Error during chat file cleanup job:", err);
    }
  }
};

const scheduleChatCleanup = () => {
  // Menjadwalkan tugas untuk berjalan setiap hari Minggu pukul 02:00.
  // Format cron: 'menit jam hari-dalam-bulan bulan hari-dalam-minggu'
  cron.schedule("0 2 * * 0", cleanupOldChatFiles, { // 0 = Sunday
    timezone: "Asia/Jakarta", // Sesuaikan dengan zona waktu server Anda
  });
  console.log("✅ Scheduled job: Clean up old chat files every Sunday at 2 AM.");
};

module.exports = { scheduleChatCleanup };
