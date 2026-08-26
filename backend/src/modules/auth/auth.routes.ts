import { Router } from "express";
import { authController } from "./auth.controller.js";
import {
  telegramAuthSchema,
  updatePhoneSchema,
  updateLanguageSchema,
  updateProviderTypeSchema,
} from "./auth.schema.js";
import { validateRequest } from "../../middleware/validate.js";
import { authenticateJwt } from "../../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/telegram",
  validateRequest(telegramAuthSchema),
  authController.authenticateTelegram,
);

router.get("/status/:telegramId", authController.checkUserStatus);

router.post(
  "/phone",
  validateRequest(updatePhoneSchema),
  authController.updatePhone,
);

router.post(
  "/language",
  validateRequest(updateLanguageSchema),
  authController.updateLanguage,
);

router.post(
  "/provider-type",
  validateRequest(updateProviderTypeSchema),
  authController.updateProviderType,
);

router.get("/me", authenticateJwt, authController.getMe);

export default router;
