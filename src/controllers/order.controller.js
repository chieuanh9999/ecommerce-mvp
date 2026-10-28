
const prisma = require("../lib/prisma");
const { Prisma } = require("@prisma/client");

// API tạo đơn hàng
const createOrder = async (req, res) => {
  const items = req.body?.items;

  // 1. Kiểm tra danh sách sản phẩm
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Đơn hàng phải có ít nhất một sản phẩm"
    });
  }

  // 2. Kiểm tra pid, quantity và sản phẩm trùng
  const productIds = new Set();

  for (const item of items) {
    if (
      !item ||
      !Number.isSafeInteger(item.pid) ||
      item.pid <= 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > 2147483647
    ) {
      return res.status(400).json({
        message: "ID hoặc số lượng sản phẩm không hợp lệ"
      });
    }

    if (productIds.has(item.pid)) {
      return res.status(400).json({
        message: "Không được gửi trùng sản phẩm"
      });
    }

    productIds.add(item.pid);
  }

  try {
    // 3. Transaction: tất cả thành công hoặc rollback
    const order = await prisma.$transaction(async (tx) => {
      let total = new Prisma.Decimal(0);
      const details = [];

      // Sắp xếp để xử lý sản phẩm theo thứ tự cố định
      const sortedItems = [...items].sort(
        (a, b) => a.pid - b.pid
      );

      for (const item of sortedItems) {
        const product = await tx.product.findUnique({
          where: { pid: item.pid }
        });

        if (!product) {
          const error = new Error(
            `Không tìm thấy sản phẩm ${item.pid}`
          );
          error.statusCode = 404;
          throw error;
        }

        // Chỉ trừ kho khi còn đủ số lượng
        const updated = await tx.product.updateMany({
          where: {
            pid: item.pid,
            quantity: { gte: item.quantity }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        if (updated.count === 0) {
          const error = new Error(
            `Sản phẩm ${item.pid} không đủ hàng`
          );
          error.statusCode = 409;
          throw error;
        }

        // Tính tiền bằng Decimal, tránh lỗi số thực
        total = total.plus(
          product.price.mul(item.quantity)
        );

        if (total.gt("9999999999.99")) {
          const error = new Error(
            "Tổng tiền vượt giới hạn cho phép"
          );
          error.statusCode = 400;
          throw error;
        }

        details.push({
          pid: item.pid,
          quantity: item.quantity,
          price: product.price
        });
      }

      // 4. Tạo Order và OrderDetail
      
      // 4. Tạo Order và OrderDetail
      const newOrder = await tx.order.create({
        data: {
          user: {
            connect: { uid: req.user.uid }
          },
          status: "PENDING",
          total,
          orderDetails: {
            create: details.map((item) => ({
              quantity: item.quantity,
              price: item.price,
              product: {
                connect: { pid: item.pid }
              }
            }))
          }
        },
        include: {
          orderDetails: true
        }
      });

      // 5. Lấy thông tin giao hàng từ CUSTOMER
      const customer = await tx.user.findUnique({
        where: { uid: req.user.uid },
        select: {
          fullname: true,
          address: true,
          phone: true
        }
      });

      if (
        !customer?.fullname?.trim() ||
        !customer?.address?.trim() ||
        !customer?.phone?.trim()
      ) {
        const error = new Error(
          "Tài khoản chưa đủ thông tin giao hàng"
        );
        error.statusCode = 400;
        throw error;
      }

      // 6. Tự động tạo Shipment
      await tx.shipment.create({
        data: {
          oid: newOrder.oid,
          recipientName: customer.fullname.trim(),
          address: customer.address.trim(),
          phone: customer.phone.trim(),
          status: "PENDING"
        }
      });

      return newOrder;

    });

    return res.status(201).json({
      message: "Tạo đơn hàng thành công",
      data: order
    });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message
      });
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Lỗi khi tạo đơn hàng"
    });
  }
};

const getOrders = async (req, res) => {
  try {
    // ADMIN xem tất cả, CUSTOMER chỉ xem của mình
    const where =
      req.user.role === "ADMIN"
        ? {}
        : { uid: req.user.uid };

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderDetails: {
          include: {
            product: {
              select: {
                pid: true,
                pname: true
              }
            }
          }
        }
      },
      orderBy: {
        orderDate: "desc"
      }
    });

    return res.status(200).json(orders);

  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      message: "Lỗi khi lấy danh sách đơn hàng"
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const oid = Number(req.params.id);

    // Kiểm tra ID
    if (
      !Number.isInteger(oid) ||
      oid <= 0 ||
      oid > 2147483647
    ) {
      return res.status(400).json({
        message: "ID đơn hàng không hợp lệ"
      });
    }

    // ADMIN xem mọi đơn, CUSTOMER chỉ xem đơn của mình
    const where = {
      oid,
      ...(req.user.role === "CUSTOMER"
        ? { uid: req.user.uid }
        : {})
    };

    const order = await prisma.order.findFirst({
      where,
      include: {
        orderDetails: {
          include: {
            product: {
              select: {
                pid: true,
                pname: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng"
      });
    }

    return res.status(200).json(order);

  } catch (error) {
    console.error("Get order detail error:", error);

    return res.status(500).json({
      message: "Lỗi khi lấy chi tiết đơn hàng"
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
