require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const settingRoutes = require("./routes/settingRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const contentRoutes = require("./routes/contentRoutes");
const featuredProductRoutes = require("./routes/featuredProductRoutes");
const headerSlideRoutes = require("./routes/headerSlideRoutes");
const loginBannerRoutes = require("./routes/loginBannerRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

// Cron job
const {
  startScheduledJobs,
  checkAndRefreshTokenOnStart,
} = require("./cron/scheduler");
const tiktokRoutes = require("./routes/tiktokRoutes");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/kamo", (req, res) => {
  res.status(200).send("OK");
});

app.use("/kamo/auth", authRoutes);
app.use("/kamo/products", productRoutes);
app.use("/kamo/wishlist", wishlistRoutes);
app.use("/kamo/cart", cartRoutes);
app.use("/kamo/orders", orderRoutes);
app.use("/kamo/dashboard", dashboardRoutes);
app.use("/kamo/chat", chatRoutes);
app.use("/kamo/reviews", reviewRoutes);

app.use("/kamo/xendit", paymentRoutes);
app.use("/kamo/destinations", destinationRoutes);
app.use("/kamo/shipping", shippingRoutes);
app.use("/kamo/settings", settingRoutes);
app.use("/kamo/payment-methods", paymentMethodRoutes);
app.use("/kamo/content", contentRoutes);
app.use("/kamo/featured-products", featuredProductRoutes);
app.use("/kamo/header-slides", headerSlideRoutes);
app.use("/kamo/login-banners", loginBannerRoutes);
app.use("/kamo/tiktok", tiktokRoutes);
app.use("/kamo/analytics", analyticsRoutes);

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await checkAndRefreshTokenOnStart();

    startScheduledJobs();

    server.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();
