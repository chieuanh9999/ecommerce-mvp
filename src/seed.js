
require("dotenv").config();

const prisma = require("./lib/prisma");

async function main() {
  // Tạo vai trò ADMIN
  const admin = await prisma.role.upsert({
    where: { rolename: "ADMIN" },
    update: {},
    create: { rolename: "ADMIN" }
  });

  // Tạo vai trò CUSTOMER
  const customer = await prisma.role.upsert({
    where: { rolename: "CUSTOMER" },
    update: {},
    create: { rolename: "CUSTOMER" }
  });

  // Tạo hạng thành viên BASIC nếu chưa có
  let basic = await prisma.memberShip.findFirst({
    where: { membership: "BASIC" }
  });

  if (!basic) {
    basic = await prisma.memberShip.create({
      data: {
        membership: "BASIC",
        point: 0
      }
    });
  }

  console.log("Seed dữ liệu thành công!");
  console.log("ADMIN:", admin);
  console.log("CUSTOMER:", customer);
  console.log("BASIC:", basic);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
