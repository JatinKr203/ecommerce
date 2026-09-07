const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Core Application Route Modules
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");

// Destructured Error Handlers
const { notFound, errorHandler } = require("./middleware/error.middleware");

const app = express();

// Global Middlewares Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server Health Verification Endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API is running smoothly" });
});

// Mounted Application API Modules
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Fallback Route Interceptor (Triggers for unhandled paths)
app.use(notFound);

// Central Operational Exception Interceptor (Must be registered LAST)
app.use(errorHandler);

module.exports = app;
