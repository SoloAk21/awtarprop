import { EthiopianRegion, AddisAbabaSubCity } from '../constants/locations.js';
import { ProviderType } from './user.js';

export type ListingPurpose = 'FOR_SALE' | 'FOR_RENT' | 'LOOKING_TO_BUY' | 'LOOKING_TO_RENT';

export type PropertyCategory =
  | 'RESIDENTIAL_HOUSE'
  | 'CONDOMINIUM'
  | 'APARTMENT'
  | 'VILLA'
  | 'STUDIO'
  | 'COMMERCIAL_SPACE'
  | 'OFFICE'
  | 'SHOP'
  | 'WAREHOUSE'
  | 'BUILDING'
  | 'HOTEL'
  | 'RESIDENTIAL_LAND'
  | 'COMMERCIAL_LAND'
  | 'AGRICULTURAL_LAND';

export type PropertyCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'NEEDS_RENOVATION' | 'UNDER_CONSTRUCTION';

export type PublicationStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED' | 'EXPIRED' | 'ARCHIVED';

export interface PropertyImage {
  id: string;
  url: string;
  publicId: string;
  isMain: boolean;
  order: number;
}

export interface PropertyListing {
  id: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  category: PropertyCategory;
  purpose: ListingPurpose;
  priceETB: number;
  areaSqMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  condition?: PropertyCondition;
  isFurnished?: boolean;
  amenities: string[];

  region: EthiopianRegion;
  subCity?: AddisAbabaSubCity;
  woreda?: string;
  kebele?: string;
  areaName: string;
  latitude?: number;
  longitude?: number;

  images: PropertyImage[];
  providerId: string;
  providerType: ProviderType;

  publicationStatus: PublicationStatus;
  listingFeeETB: number;
  isFeePaid: boolean;

  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
}
