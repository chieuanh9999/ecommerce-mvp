-- CreateTable
CREATE TABLE "Role" (
    "roleid" SERIAL NOT NULL,
    "rolename" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("roleid")
);

-- CreateTable
CREATE TABLE "MemberShip" (
    "mid" SERIAL NOT NULL,
    "membership" TEXT NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MemberShip_pkey" PRIMARY KEY ("mid")
);

-- CreateTable
CREATE TABLE "User" (
    "uid" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "roleid" INTEGER NOT NULL,
    "mid" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "Product" (
    "pid" SERIAL NOT NULL,
    "pname" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("pid")
);

-- CreateTable
CREATE TABLE "Order" (
    "oid" SERIAL NOT NULL,
    "uid" INTEGER NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("oid")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "oid" INTEGER NOT NULL,
    "pid" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("oid","pid")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "sid" SERIAL NOT NULL,
    "oid" INTEGER NOT NULL,
    "recipientName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_rolename_key" ON "Role"("rolename");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleid_fkey" FOREIGN KEY ("roleid") REFERENCES "Role"("roleid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mid_fkey" FOREIGN KEY ("mid") REFERENCES "MemberShip"("mid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_uid_fkey" FOREIGN KEY ("uid") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_oid_fkey" FOREIGN KEY ("oid") REFERENCES "Order"("oid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_pid_fkey" FOREIGN KEY ("pid") REFERENCES "Product"("pid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_oid_fkey" FOREIGN KEY ("oid") REFERENCES "Order"("oid") ON DELETE CASCADE ON UPDATE CASCADE;
