import { Router } from "express";
import { propertyController } from "./property.controller.js";
import { authenticateJwt } from "../../middleware/authMiddleware.js";
import { validateRequest } from "../../middleware/validate.js";
import { uploadPropertyImagesMiddleware } from "../../middleware/upload.js";
import { propertyListingSchema } from "@awtarprop/shared";
import { z } from "zod";

const router = Router();

const createPropertyValidationSchema = z.object({
  body: propertyListingSchema,
});

const generateAiAdValidationSchema = z.object({
  body: z.object({
    prompt: z.string().min(5, "Prompt must be at least 5 characters").max(1000),
    preferredLanguage: z.enum(["EN", "AM"]).optional(),
  }),
});

/* Protected routes before /:id */
router.get(
  "/user/my-listings",
  authenticateJwt,
  propertyController.getMyListings,
);

router.post(
  "/",
  authenticateJwt,
  validateRequest(createPropertyValidationSchema),
  propertyController.create,
);

router.post(
  "/ai-generate-ad",
  authenticateJwt,
  validateRequest(generateAiAdValidationSchema),
  propertyController.generateAiAd,
);

router.post(
  "/:id/images",
  authenticateJwt,
  uploadPropertyImagesMiddleware.array("photos", 5),
  propertyController.uploadImages,
);

/* Public routes */
router.get("/", propertyController.getAll);
router.get("/:id", propertyController.getById);

export default router;
