
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

// 1. Kiểm tra JWT Token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Bạn chưa cung cấp JWT Token"
    });
  }

  const token = authHeader.slice(7).trim();

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });
  } catch (error) {
    return res.status(401).json({
      message: "JWT Token không hợp lệ hoặc đã hết hạn"
    });
  }

  if (
    !decoded ||
    !Number.isSafeInteger(decoded.uid) ||
    decoded.uid <= 0
  ) {
    return res.status(401).json({
      message: "JWT Token không hợp lệ"
    });
  }

  try {
    // Tìm người dùng và quyền hiện tại
    const user = await prisma.user.findUnique({
      where: { uid: decoded.uid },
      include: { role: true }
    });

    if (!user) {
      return res.status(401).json({
        message: "Tài khoản không tồn tại"
      });
    }

    req.user = {
      uid: user.uid,
      username: user.username,
      role: user.role.rolename
    };

    next();

  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Lỗi xác thực hệ thống"
    });
  }
};

// 2. Kiểm tra quyền truy cập
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Bạn chưa đăng nhập"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện chức năng này"
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
