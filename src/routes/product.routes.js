
const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth.middleware");

// GET - Ai cũng có thể xem sản phẩm
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// POST - Chỉ ADMIN được thêm sản phẩm
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createProduct
);

// PUT - Chỉ ADMIN được cập nhật
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateProduct
);

// DELETE - Chỉ ADMIN được xóa
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN"),
  deleteProduct
);

module.exports = router;
