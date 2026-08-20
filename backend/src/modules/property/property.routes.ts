import { Router } from 'express';
import { propertyController } from './property.controller.js';
import { authenticateJwt } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validate.js';
import { propertyListingSchema } from '@awtarprop/shared';
import { z } from 'zod';

const router = Router();

const createPropertyValidationSchema = z.object({
  body: propertyListingSchema,
});

router.get('/', propertyController.getAll);
router.get('/user/my-listings', authenticateJwt, propertyController.getMyListings);
router.get('/:id', propertyController.getById);

router.post(
  '/',
  authenticateJwt,
  validateRequest(createPropertyValidationSchema),
  propertyController.create
);

export default router;
