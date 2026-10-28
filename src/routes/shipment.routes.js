
const express = require("express");
const router = express.Router();

const {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus
} = require("../controllers/shipment.controller");

const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/auth.middleware");

// Tất cả API yêu cầu JWT
router.use(authenticateToken);

// ADMIN xem danh sách giao hàng
router.get(
  "/",
  authorizeRoles("ADMIN"),
  getShipments
);

// ADMIN và CUSTOMER xem chi tiết
router.get(
  "/:id",
  authorizeRoles("ADMIN", "CUSTOMER"),
  getShipmentById
);

// ADMIN tạo Shipment
router.post(
  "/",
  authorizeRoles("ADMIN"),
  createShipment
);

// ADMIN cập nhật trạng thái Shipment
router.put(
  "/:id",
  authorizeRoles("ADMIN"),
  updateShipmentStatus
);

module.exports = router;
