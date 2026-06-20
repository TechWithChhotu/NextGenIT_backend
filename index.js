import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.config.js";
import apiRoutes from "./routes/api.routes.js";
import errorHandler from "./middleware/errorHandler.middleware.js";
// Configuration Initializer
dotenv.config();
const app = express();

// Database Pool Boot
connectDB();

// 🛡️ High-End Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Traffic Analytics Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Global Parser
app.use(express.json());

// ⚡ Cyber Attack Protection: Rate Limiter (Max 100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests from this IP layer. Infrastructure protected.",
  },
});
app.use("/api/", limiter);

// API Routes Mounting
app.use("/api", apiRoutes);

// Global Error Catchment Pipeline
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `⚡ NextGen Cyber Backend running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
