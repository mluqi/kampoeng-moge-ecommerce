const express = require("express");
const router = express.Router();
const {
  getContentByKey,
  getAllContents,
  updateContent,
} = require("../controllers/contentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint admin harus didefinisikan terlebih dahulu
router.get("/", authMiddleware, getAllContents);
router.put("/:id", authMiddleware, updateContent);

// Endpoint publik (tidak memerlukan auth) didefinisikan terakhir
router.get("/:key", getContentByKey);

module.exports = router;
