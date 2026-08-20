import { Router } from 'express';
import { authController } from './auth.controller.js';
import { telegramAuthSchema } from './auth.schema.js';
import { validateRequest } from '../../middleware/validate.js';
import { authenticateJwt } from '../../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/telegram',
  validateRequest(telegramAuthSchema),
  authController.authenticateTelegram
);

router.get(
  '/me',
  authenticateJwt,
  authController.getMe
);

export default router;
