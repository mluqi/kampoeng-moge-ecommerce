const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileMiddleware");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/productController");

router.get("/categories", getAllCategories);
router.post("/categories", authMiddleware, addCategory);
router.put("/categories/:id", authMiddleware, updateCategory);
router.delete("/categories/:id", authMiddleware, deleteCategory);


router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "pictures" }]),
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  upload.fields([{ name: "pictures" }]),
  updateProduct
);
router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
