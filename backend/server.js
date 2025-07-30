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
const bannerRoutes = require("./routes/promoBannerRoutes");
const loginBannerRoutes = require("./routes/loginBannerRoutes");


// Cron job
const {
  startScheduledJobs,
  checkAndRefreshTokenOnStart,
} = require("./cron/scheduler");
const tiktokRoutes = require("./routes/tiktokRoutes");

const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Listener utama untuk koneksi Socket.IO
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    if (roomId) {
      socket.join(roomId.toString());
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    } else {
      console.warn(`Socket ${socket.id} tried to join an invalid (null) room.`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware untuk membuat `io` bisa diakses di controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: "http://192.168.10.33:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/xendit", paymentRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/featured-products", featuredProductRoutes);
app.use("/api/header-slides", headerSlideRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/login-banners", loginBannerRoutes);
app.use("/api/tiktok", tiktokRoutes);

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
