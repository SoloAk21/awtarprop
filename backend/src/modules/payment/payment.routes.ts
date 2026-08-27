import { Router } from "express";
import { paymentController } from "./payment.controller.js";
import { authenticateJwt } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validate.js";
import { z } from "zod";

const router = Router();

const initializeChapaSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid("Valid property ID required"),
  }),
});

const verifyChapaSchema = z.object({
  body: z.object({
    txRef: z.string().min(1, "Transaction reference required"),
  }),
});

router.post(
  "/initialize-chapa",
  authenticateJwt,
  validateRequest(initializeChapaSchema),
  paymentController.initializeChapa,
);

router.post(
  "/verify-chapa",
  authenticateJwt,
  validateRequest(verifyChapaSchema),
  paymentController.verifyChapa,
);

export default router;
