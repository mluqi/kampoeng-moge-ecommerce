const cron = require("node-cron");
const { refreshToken: refreshTokenTiktok } = require("../services/tiktokShop");
const { syncAndCompareStock } = require("../services/stockSyncService");
const { integration_tokens: TiktokToken } = require("../models");
const { TIKPED_SHOP_CIPHER: SHOP_CIPHER } = process.env;

const checkAndRefreshTokenOnStart = async () => {
  console.log(
    "🚀 Running initial check for TikTok token refresh on server start..."
  );
  try {
    if (!SHOP_CIPHER) {
      console.error(
        "TIKPED_SHOP_CIPHER is not defined in .env. Skipping token refresh check."
      );
      return;
    }

    const tokenRecord = await TiktokToken.findOne({
      where: { shop_cipher: SHOP_CIPHER },
    });

    if (!tokenRecord) {
      console.log("No TikTok token record found. Skipping refresh check.");
      return;
    }

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (tokenRecord.expires_at < oneDayFromNow) {
      console.log(
        "TikTok access token is expiring soon. Refreshing now..."
      );
      await refreshTokenTiktok();
    } else {
      console.log("✅ TikTok access token is valid. No refresh needed.");
    }
  } catch (error) {
    console.error("❌ Initial TikTok token refresh failed:", error.message);
  }
};

/**
 * Initializes and starts all scheduled cron jobs for the application.
 */
const startScheduledJobs = () => {
  // Jadwalkan sinkronisasi stok dari TikTok Shop setiap 3 jam.
  cron.schedule("0 */3 * * *", async () => {
    console.log("Running scheduled TikTok stock synchronization...");
    try {
      await syncAndCompareStock();
    } catch (error) {
      console.error(
        "Scheduled TikTok stock synchronization failed:",
        error.message
      );
    }
  });

  console.log("🕒 Cron jobs scheduled successfully.");
};

module.exports = { startScheduledJobs, checkAndRefreshTokenOnStart };
