import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { authenticateJwt } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const createCheckoutSchema = z.object({
  body: z.object({
    propertyId: z.string().uuid('Valid property ID required'),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    transactionId: z.string().uuid('Valid transaction ID required'),
  }),
});

router.post(
  '/create-checkout',
  authenticateJwt,
  validateRequest(createCheckoutSchema),
  paymentController.createCheckout
);

router.post(
  '/verify',
  authenticateJwt,
  validateRequest(verifyPaymentSchema),
  paymentController.verifyPayment
);

export default router;
