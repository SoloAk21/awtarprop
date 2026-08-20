import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { NotFoundError } from "./errors/AppError.js";
import { ETHIOPIAN_REGIONS } from "@awtarprop/shared";

const app: Express = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", limiter);

// Health Check Endpoint (Includes DB ping)
app.get("/api/v1/health", async (req: Request, res: Response, next) => {
  try {
    let dbStatus = "disconnected";
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (dbErr) {
      dbStatus = "error";
    }

    res.status(200).json({
      status: "success",
      service: "awtarprop-backend",
      environment: env.NODE_ENV,
      database: dbStatus,
      regionsSupportedCount: ETHIOPIAN_REGIONS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// 404 Handler
app.use((req: Request, res: Response, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(
    `🚀 AwtarProp Backend API running on port ${env.PORT} in ${env.NODE_ENV} mode`,
  );
});
