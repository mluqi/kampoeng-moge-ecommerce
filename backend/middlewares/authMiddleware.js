const jwt = require("jsonwebtoken");
const { admin_akses } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Tidak ada token, otorisasi ditolak." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await admin_akses.findByPk(decoded.id);

    if (!admin || admin.token !== token) {
      return res.status(401).json({ message: "Token tidak valid." });
    }

    req.user = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token kedaluwarsa." });
    }
    console.error(error);
    res.status(401).json({ message: "Token tidak valid." });
  }
};

module.exports = authMiddleware;
