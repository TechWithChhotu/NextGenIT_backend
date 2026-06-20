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

// 🔥 FIX 1: CORS fallback ko "*" se hata kar localhost kiya taaki credentials crash na ho
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
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

// ⚡ Cyber Attack Protection: Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests from this IP layer. Infrastructure protected.",
  },
});
// FIX 2: Slash issue avoid karne ke liye routing standardize ki
app.use("/api", limiter);

// API Routes Mounting
app.use("/api", apiRoutes);

// Global Error Catchment Pipeline
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Localhost ke liye server listen karega (Vercel is block ko ignore kar deta hai)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`⚡ NextGen Cyber Backend running on port ${PORT}`);
  });
}

// 🔥 FIX 3: Vercel Serverless Architecture ke liye app ko export karna MANDATORY hai
export default app;
