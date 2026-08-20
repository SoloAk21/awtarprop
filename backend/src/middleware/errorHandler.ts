import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../errors/AppError.js";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors,
      });
    }

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  logger.error(`Unhandled Error: ${err.message}\nStack: ${err.stack}`);

  return res.status(500).json({
    status: "error",
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
};
