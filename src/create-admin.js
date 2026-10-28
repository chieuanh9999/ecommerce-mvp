
require("dotenv").config();

const prisma = require("./lib/prisma");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

async function main() {
  // 1. Tìm Role ADMIN
  const adminRole = await prisma.role.findUnique({
    where: { rolename: "ADMIN" }
  });

  // 2. Tìm Membership BASIC
  const basicMembership = await prisma.memberShip.findFirst({
    where: { membership: "BASIC" }
  });

  if (!adminRole || !basicMembership) {
    throw new Error(
      "Chưa có Role ADMIN hoặc MemberShip BASIC. Hãy chạy seed trước."
    );
  }

  // 3. Thông tin tài khoản ADMIN
  const username = "adminmvp";
  const email = "adminmvp@example.test";

  // 4. Kiểm tra tài khoản đã tồn tại
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  });

  if (existingUser) {
    console.log("Tài khoản ADMIN đã tồn tại hoặc thông tin bị trùng.");
    console.log("Không tạo lại tài khoản.");
    return;
  }

  // 5. Tạo mật khẩu ngẫu nhiên
  const password = crypto.randomBytes(24).toString("base64url");

  // 6. Băm mật khẩu
  const hashedPassword = await bcrypt.hash(password, 12);

  // 7. Tạo tài khoản ADMIN
  const admin = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      fullname: "MVP Administrator",
      email,
      roleid: adminRole.roleid,
      mid: basicMembership.mid
    },
    select: {
      uid: true,
      username: true,
      email: true,
      role: {
        select: { rolename: true }
      }
    }
  });

  console.log("Tạo tài khoản ADMIN thành công!");
  console.log("Thông tin:", admin);
  console.log("Mật khẩu ADMIN (chỉ hiển thị lần này):", password);
}

main()
  .catch((error) => {
    console.error("Create ADMIN error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });