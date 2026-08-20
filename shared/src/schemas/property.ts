import { z } from 'zod';
import { ETHIOPIAN_REGIONS, ADDIS_ABABA_SUBCITIES } from '../constants/locations.js';

export const propertyListingSchema = z.object({
  titleEn: z.string().min(5, 'Title must be at least 5 characters').max(150),
  titleAm: z.string().min(5, 'Title in Amharic must be at least 5 characters').max(150),
  descriptionEn: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  descriptionAm: z.string().min(10, 'Description must be at least 10 characters').max(3000),
  category: z.enum([
    'RESIDENTIAL_HOUSE',
    'CONDOMINIUM',
    'APARTMENT',
    'VILLA',
    'STUDIO',
    'COMMERCIAL_SPACE',
    'OFFICE',
    'SHOP',
    'WAREHOUSE',
    'BUILDING',
    'HOTEL',
    'RESIDENTIAL_LAND',
    'COMMERCIAL_LAND',
    'AGRICULTURAL_LAND'
  ]),
  purpose: z.enum(['FOR_SALE', 'FOR_RENT', 'LOOKING_TO_BUY', 'LOOKING_TO_RENT']),
  priceETB: z.number().positive('Price in ETB must be greater than 0'),
  areaSqMeters: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  floors: z.number().int().min(0).optional(),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'NEEDS_RENOVATION', 'UNDER_CONSTRUCTION']).optional(),
  isFurnished: z.boolean().optional(),
  amenities: z.array(z.string()).default([]),
  region: z.enum(ETHIOPIAN_REGIONS),
  subCity: z.enum(ADDIS_ABABA_SUBCITIES).optional(),
  woreda: z.string().optional(),
  kebele: z.string().optional(),
  areaName: z.string().min(2, 'Area name/landmark is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  providerType: z.enum(['OWNER', 'BROKER', 'AGENT', 'AGENCY', 'DEVELOPER'])
});

export type CreatePropertyInput = z.infer<typeof propertyListingSchema>;
