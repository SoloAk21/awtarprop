import { Router } from 'express';
import { propertyController } from './property.controller.js';
import { authenticateJwt } from '../../middleware/authMiddleware.js';
import { validateRequest } from '../../middleware/validate.js';
import { uploadPropertyImagesMiddleware } from '../../middleware/upload.js';
import { propertyListingSchema } from '@awtarprop/shared';
import { z } from 'zod';

const router = Router();

const createPropertyValidationSchema = z.object({
  body: propertyListingSchema,
});

/* Protected routes before /:id */
router.get(
  '/user/my-listings',
  authenticateJwt,
  propertyController.getMyListings
);

router.post(
  '/',
  authenticateJwt,
  validateRequest(createPropertyValidationSchema),
  propertyController.create
);

router.post(
  '/:id/images',
  authenticateJwt,
  uploadPropertyImagesMiddleware.array('photos', 5),
  propertyController.uploadImages
);

/* Public routes */
router.get('/', propertyController.getAll);
router.get('/:id', propertyController.getById);

export default router;
