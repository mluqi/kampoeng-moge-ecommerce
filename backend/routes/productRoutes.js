const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileMiddleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
  getAllCategoryOnTiktokShop,
  getCategoryAttributesOnTiktokShop,
  activateTiktokProduct,
  deactivateTiktokProduct,
  partialUpdateTiktokProduct,
} = require("../controllers/productController");

// TikTok Routes
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
router.post("/categories", authMiddleware, addCategory);
router.put("/categories/:id", authMiddleware, updateCategory);
router.delete("/categories/:id", authMiddleware, deleteCategory);

// Product Routes
router.get("/", getAllProducts);
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
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
