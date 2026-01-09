const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const connectDB = require("./database/connection");
const errorHandler = require("./middleware/errorHandler");

//Import Routes
const authRoutes = require("./routes/authRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const productRoutes = require("./routes/productRoutes");
const blogRoutes = require("./routes/blogRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

//Connect to Database
connectDB();

//Security Middleware
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// General Middleware
//app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/homepage", homepageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/admin/categories", categoryRoutes);

// 404 Handler - Must come before error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error Handler - Must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FlySolarStore Backend Server running on port ${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
