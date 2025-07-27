const cron = require("node-cron");
const { refreshToken: refreshTokenTiktok } = require("../services/tiktokShop");

/**
 * Initializes and starts all scheduled cron jobs for the application.
 */
const startScheduledJobs = () => {
  // Jadwalkan refresh token TikTok setiap 6 hari sekali pada jam 2 pagi.
  // Ini penting untuk menjaga refresh_token tetap aktif, bahkan jika tidak ada aktivitas API.
  cron.schedule("0 2 */6 * *", async () => {
    console.log("Running scheduled TikTok token refresh...");
    try {
      await refreshTokenTiktok();
    } catch (error) {
      console.error("Scheduled TikTok token refresh failed:", error.message);
    }
  });

  console.log("🕒 Cron jobs scheduled successfully.");
};

module.exports = { startScheduledJobs };
