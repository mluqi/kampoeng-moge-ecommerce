const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileMiddleware");
const {
  getAllProducts,
  getAllProductsWithoutOutOfStock,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  reorderCategories,
  deleteCategory,
  getProductsByCategory,
  getAllCategoryOnTiktokShop,
  getCategoryAttributesOnTiktokShop,
  activateTiktokProduct,
  deactivateTiktokProduct,
  partialUpdateTiktokProduct,
  getProductStatusTiktok,
  recordProductView,
  updateProductInline,
  updateDiscountStatus,
  updateMultipleDiscountStatus,
  deleteDiscount,
  getProductsByIds,
} = require("../controllers/productController");
const multer = require("multer");
const fs = require("fs");

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = "uploads/category";
    fs.mkdirSync(dest, { recursive: true }); // Pastikan direktori ada
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`);
  },
});
const uploadCategory = multer({ storage: categoryStorage });

router.put("/admin/inline-edit/:id", authMiddleware, updateProductInline);
router.put(
  "/admin/discount-status/bulk",
  authMiddleware,
  updateMultipleDiscountStatus
);
router.put("/admin/discount-status/:id", authMiddleware, updateDiscountStatus);
router.delete("/admin/discount/:id", authMiddleware, deleteDiscount);
router.post("/admin/by-ids", authMiddleware, getProductsByIds);

// TikTok Routes
router.get("/tiktok/:id/status", authMiddleware, getProductStatusTiktok);
router.post("/tiktok/activate", authMiddleware, activateTiktokProduct);
router.post("/tiktok/deactivate", authMiddleware, deactivateTiktokProduct);

router.get("/tiktok/categories", getAllCategoryOnTiktokShop);
router.get(
  "/tiktok/categories/:categoryId/attributes",
  getCategoryAttributesOnTiktokShop
);

// Category Routes
router.get("/categories", getAllCategories);
router.get("/categories/:id/products", getProductsByCategory);
router.post(
  "/categories",
  authMiddleware,
  uploadCategory.fields([{ name: "pictures", maxCount: 1 }]),
  addCategory
);
router.post("/categories/reorder", authMiddleware, reorderCategories);
router.get("/categories/:id", getCategoryById);
router.put(
  "/categories/:id",
  authMiddleware,
  uploadCategory.fields([{ name: "pictures", maxCount: 1 }]),
  updateCategory
);
router.delete("/categories/:id", authMiddleware, deleteCategory);

// Product Routes
router.get("/", getAllProducts);
router.get("/all-products", getAllProductsWithoutOutOfStock);
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "pictures" }]),
  createProduct
);
router.get("/:id", getProductById);
router.put("/:id/status", authMiddleware, updateProductStatus);
router.put(
  "/:id",
  authMiddleware,
  upload.fields([{ name: "pictures" }]),
  updateProduct
);
router.post("/:id/view", recordProductView); // Route baru untuk mencatat view
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
