import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError, ZodIssue } from "zod";
import { ValidationError } from "../errors/AppError.js";

export const validateRequest = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};

        error.issues.forEach((issue: ZodIssue) => {
          const path = issue.path.join(".");
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(issue.message);
        });

        return next(new ValidationError(formattedErrors));
      }
      next(error);
    }
  };
};
