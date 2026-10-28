
const prisma = require("../lib/prisma");

// 1. Lấy danh sách sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        pid: "asc"
      }
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Lỗi khi lấy danh sách sản phẩm"
    });
  }
};

// 2. Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const { pname, price, quantity, description } = req.body;

    if (typeof pname !== "string" || !pname.trim()) {
      return res.status(400).json({
        message: "Tên sản phẩm không hợp lệ"
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        message: "Giá sản phẩm phải lớn hơn 0"
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "Số lượng phải là số nguyên không âm"
      });
    }

    if (
      description != null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Mô tả phải là chuỗi"
      });
    }

    const product = await prisma.product.create({
      data: {
        pname: pname.trim(),
        price: String(price),
        quantity,
        description: description ?? null
      }
    });

    return res.status(201).json({
      message: "Thêm sản phẩm thành công",
      data: product
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Lỗi khi thêm sản phẩm"
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    // Kiểm tra ID hợp lệ
    if (!Number.isSafeInteger(pid) || pid <= 0) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ"
      });
    }

    // Tìm sản phẩm theo ID
    const product = await prisma.product.findUnique({
      where: { pid }
    });

    // Không tìm thấy sản phẩm
    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    return res.status(200).json(product);

  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      message: "Lỗi khi lấy chi tiết sản phẩm"
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    // Kiểm tra ID
    if (!Number.isSafeInteger(pid) || pid <= 0) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ"
      });
    }

    const { pname, price, quantity, description } = req.body;

    // Kiểm tra tên sản phẩm
    if (typeof pname !== "string" || !pname.trim()) {
      return res.status(400).json({
        message: "Tên sản phẩm không hợp lệ"
      });
    }

    // Kiểm tra giá theo Decimal(12,2)
    const priceText = String(price);

    if (
      !/^\d{1,10}(\.\d{1,2})?$/.test(priceText) ||
      Number(priceText) <= 0
    ) {
      return res.status(400).json({
        message: "Giá sản phẩm không hợp lệ"
      });
    }

    // Kiểm tra số lượng
    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        message: "Số lượng phải là số nguyên không âm"
      });
    }

    if (
      description != null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Mô tả sản phẩm không hợp lệ"
      });
    }

    // Cập nhật sản phẩm
    const product = await prisma.product.update({
      where: { pid },
      data: {
        pname: pname.trim(),
        price: priceText,
        quantity,
        description: description ?? null
      }
    });

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: product
    });

  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Lỗi khi cập nhật sản phẩm"
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const pid = Number(req.params.id);

    // Kiểm tra ID
    if (!Number.isSafeInteger(pid) || pid <= 0) {
      return res.status(400).json({
        message: "ID sản phẩm không hợp lệ"
      });
    }

    // Xóa sản phẩm trong PostgreSQL
    await prisma.product.delete({
      where: { pid }
    });

    return res.status(200).json({
      message: "Xóa sản phẩm thành công",
      pid
    });

  } catch (error) {
    // Không tìm thấy sản phẩm
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Không tìm thấy sản phẩm"
      });
    }

    // Sản phẩm đang được tham chiếu
    if (error.code === "P2003") {
      return res.status(409).json({
        message: "Không thể xóa sản phẩm đang thuộc đơn hàng"
      });
    }

    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Lỗi khi xóa sản phẩm"
    });
  }
};

// 3. Export các hàm ở cuối file
module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
};
