
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const orderRoutes = require("./routes/order.routes");
const prisma = require("./lib/prisma");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const shipmentRoutes = require("./routes/shipment.routes");
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);
// API Health Check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      database: "disconnected"
    });
  }
});

module.exports = app;
