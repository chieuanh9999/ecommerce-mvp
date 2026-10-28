
const prisma = require("../lib/prisma");

// API tạo thông tin giao hàng
const createShipment = async (req, res) => {
  try {
    const {
      oid,
      recipientName,
      address,
      phone
    } = req.body;

    // 1. Kiểm tra ID đơn hàng
    if (
      !Number.isInteger(oid) ||
      oid <= 0 ||
      oid > 2147483647
    ) {
      return res.status(400).json({
        message: "ID đơn hàng không hợp lệ"
      });
    }

    // 2. Kiểm tra thông tin nhận hàng
    if (
      typeof recipientName !== "string" ||
      !recipientName.trim() ||
      typeof address !== "string" ||
      !address.trim() ||
      typeof phone !== "string" ||
      !phone.trim()
    ) {
      return res.status(400).json({
        message: "Thông tin nhận hàng không hợp lệ"
      });
    }

    // 3. Kiểm tra đơn hàng tồn tại
    const order = await prisma.order.findUnique({
      where: { oid }
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    // 4. Tạo thông tin giao hàng
    const shipment = await prisma.shipment.create({
      data: {
        oid,
        recipientName: recipientName.trim(),
        address: address.trim(),
        phone: phone.trim(),
        status: "PENDING"
      }
    });

    return res.status(201).json({
      message: "Tạo thông tin giao hàng thành công",
      data: shipment
    });

  } catch (error) {
    console.error("Create shipment error:", error);

    return res.status(500).json({
      message: "Lỗi khi tạo thông tin giao hàng"
    });
  }
};

const getShipments = async (req, res) => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: {
        order: {
          select: {
            oid: true,
            uid: true,
            status: true
          }
        }
      },
      orderBy: {
        sid: "desc"
      }
    });

    return res.status(200).json(shipments);

  } catch (error) {
    console.error("Get shipments error:", error);

    return res.status(500).json({
      message: "Lỗi khi lấy danh sách giao hàng"
    });
  }
};

const getShipmentById = async (req, res) => {
  try {
    const sid = Number(req.params.id);

    // 1. Kiểm tra ID
    if (
      !Number.isSafeInteger(sid) ||
      sid <= 0 ||
      sid > 2147483647
    ) {
      return res.status(400).json({
        message: "ID giao hàng không hợp lệ"
      });
    }

    // 2. Tìm Shipment
    const shipment = await prisma.shipment.findUnique({
      where: { sid },
      include: {
        order: {
          select: {
            oid: true,
            uid: true,
            status: true
          }
        }
      }
    });

    // 3. Không tìm thấy
    if (!shipment) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin giao hàng"
      });
    }

    // 4. CUSTOMER chỉ xem đơn hàng của mình
    if (
      req.user.role !== "ADMIN" &&
      shipment.order.uid !== req.user.uid
    ) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin giao hàng"
      });
    }

    // 5. Trả kết quả
    return res.status(200).json(shipment);

  } catch (error) {
    console.error("Get shipment detail error:", error);

    return res.status(500).json({
      message: "Lỗi khi lấy chi tiết giao hàng"
    });
  }
};

const updateShipmentStatus = async (req, res) => {
  try {
    const sid = Number(req.params.id);
    const status = req.body?.status;

    // 1. Kiểm tra Shipment ID
    if (
      !Number.isInteger(sid) ||
      sid <= 0 ||
      sid > 2147483647
    ) {
      return res.status(400).json({
        message: "ID giao hàng không hợp lệ"
      });
    }

    // 2. Kiểm tra trạng thái yêu cầu
    if (!["SHIPPED", "DELIVERED"].includes(status)) {
      return res.status(400).json({
        message: "Trạng thái phải là SHIPPED hoặc DELIVERED"
      });
    }

    // 3. Tìm Shipment
    const shipment = await prisma.shipment.findUnique({
      where: { sid }
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Không tìm thấy thông tin giao hàng"
      });
    }

    // 4. Kiểm tra thứ tự chuyển trạng thái
    const expectedStatus =
      status === "SHIPPED" ? "PENDING" : "SHIPPED";

    if (shipment.status !== expectedStatus) {
      return res.status(409).json({
        message: "Không thể chuyển trạng thái giao hàng",
        currentStatus: shipment.status
      });
    }

    // 5. Cập nhật trạng thái và thời gian
    const data = { status };

    if (status === "SHIPPED") {
      data.shippedAt = new Date();
    }

    if (status === "DELIVERED") {
      data.deliveredAt = new Date();
    }

    // Chỉ cập nhật nếu trạng thái vẫn đúng
    const result = await prisma.shipment.updateMany({
      where: {
        sid,
        status: expectedStatus
      },
      data
    });

    if (result.count === 0) {
      return res.status(409).json({
        message: "Trạng thái đã thay đổi, vui lòng thử lại"
      });
    }

    // 6. Lấy thông tin sau cập nhật
    const updatedShipment = await prisma.shipment.findUnique({
      where: { sid }
    });

    return res.status(200).json({
      message: "Cập nhật trạng thái giao hàng thành công",
      data: updatedShipment
    });

  } catch (error) {
    console.error("Update shipment error:", error);

    return res.status(500).json({
      message: "Lỗi khi cập nhật giao hàng"
    });
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus
};
