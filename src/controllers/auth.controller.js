
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// API đăng ký tài khoản
const register = async (req, res) => {
  try {
    const {
      username,
      password,
      fullname,
      email,
      address,
      phone
    } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (
      typeof username !== "string" ||
      !/^[a-z0-9_]{3,30}$/i.test(username.trim())
    ) {
      return res.status(400).json({
        message: "Username phải có 3-30 ký tự chữ, số hoặc _"
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 8 ký tự và tối đa 72 byte"
      });
    }

    if (typeof fullname !== "string" || !fullname.trim()) {
      return res.status(400).json({
        message: "Họ tên không hợp lệ"
      });
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Email không hợp lệ"
      });
    }

    if (
      (address != null && typeof address !== "string") ||
      (phone != null && typeof phone !== "string")
    ) {
      return res.status(400).json({
        message: "Địa chỉ hoặc số điện thoại không hợp lệ"
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Tìm role CUSTOMER
    const customerRole = await prisma.role.findUnique({
      where: { rolename: "CUSTOMER" }
    });

    // 3. Tìm membership BASIC
    const basicMembership = await prisma.memberShip.findFirst({
      where: { membership: "BASIC" }
    });

    if (!customerRole || !basicMembership) {
      return res.status(500).json({
        message: "Chưa có dữ liệu Role hoặc MemberShip"
      });
    }

    // 4. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Tạo người dùng
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
        fullname: fullname.trim(),
        email: normalizedEmail,
        address: address ?? null,
        phone: phone ?? null,
        roleid: customerRole.roleid,
        mid: basicMembership.mid
      },
      select: {
        uid: true,
        username: true,
        fullname: true,
        email: true,
        roleid: true,
        mid: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      message: "Đăng ký tài khoản thành công",
      data: user
    });

  } catch (error) {
    // Username hoặc email đã tồn tại
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Username hoặc email đã tồn tại"
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      message: "Lỗi khi đăng ký tài khoản"
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (
      typeof username !== "string" ||
      !username.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập username và password"
      });
    }

    // 2. Tìm người dùng
    const user = await prisma.user.findUnique({
      where: {
        username: username.trim().toLowerCase()
      },
      include: {
        role: true
      }
    });

    // 3. Kiểm tra username và mật khẩu
    if (!user) {
      return res.status(401).json({
        message: "Sai tài khoản hoặc mật khẩu"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Sai tài khoản hoặc mật khẩu"
      });
    }

    // 4. Kiểm tra JWT_SECRET
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      console.error("JWT_SECRET chưa được cấu hình an toàn");

      return res.status(500).json({
        message: "Lỗi cấu hình bảo mật"
      });
    }

    // 5. Tạo JWT Token
    const token = jwt.sign(
      {
        uid: user.uid
      },
      secret,
      {
        algorithm: "HS256",
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    // 6. Trả kết quả
    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role.rolename
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Lỗi khi đăng nhập"
    });
  }
};

module.exports = {
  register,
  login
};
