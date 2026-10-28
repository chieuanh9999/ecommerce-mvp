
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrderById
} = require("../controllers/order.controller");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth.middleware");

// Tất cả Order API đều yêu cầu JWT
router.use(authenticateToken);

// GET danh sách đơn hàng
router.get(
  "/",
  authorizeRoles("CUSTOMER", "ADMIN"),
  getOrders
);

// GET chi tiết đơn hàng
router.get(
  "/:id",
  authorizeRoles("CUSTOMER", "ADMIN"),
  getOrderById
);

// POST tạo đơn hàng: chỉ CUSTOMER
router.post(
  "/",
  authorizeRoles("CUSTOMER"),
  createOrder
);

module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsImlhdCI6MTc5Mjk1NDgzMiwiZXhwIjoxNzkzMDQxMjMyfQ.-RITjMw7PvLQRp4FdaEeU62XOiCLUqBWnktqd4uWUYo