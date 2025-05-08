const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const morganBody = require("morgan-body");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const auth = require("./routes/auth");
const logger = require("./utils/logger");
const performance = require("./routes/performance");
const seo = require("./routes/seo");
const security = require("./routes/security");
const accessibility = require("./routes/accessibility");
const ai = require("./routes/ai");
const aiInsights = require("./routes/ai-insights");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const uptimeRoutes = require("./routes/uptime");
const websiteAnalysis = require("./routes/website-analysis");
const uptimeMonitor = require("./services/uptimeMonitor");
const mongoose = require("mongoose");
const userRoutes = require('./routes/user');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Security headers
app.use(helmet());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  morganBody(app);
}

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/website-analysis", websiteAnalysis);
app.use("/api/v1/performance", performance);
app.use("/api/v1/seo", seo);
app.use("/api/v1/security", security);
app.use("/api/v1/accessibility", accessibility);
app.use("/api/v1/ai", ai);
app.use("/api/v1/ai-insights", aiInsights);
app.use("/api/v1/uptime", uptimeRoutes);
app.use("/api/v1/user", userRoutes);

// Health Check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
