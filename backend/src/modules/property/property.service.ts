import { propertyRepository } from "./property.repository.js";
import { prisma } from "../../config/db.js";
import { NotFoundError, ForbiddenError } from "../../errors/AppError.js";
import { CreatePropertyInput } from "@awtarprop/shared";
import { Prisma } from "@prisma/client";

export class PropertyService {
  /**
   * Calculates publication fee in ETB based on category and provider type.
   */
  public calculateListingFee(category: string, providerType: string): number {
    let baseFee = 100;

    if (providerType === "BROKER" || providerType === "AGENT") {
      baseFee = 150;
    } else if (providerType === "AGENCY" || providerType === "DEVELOPER") {
      baseFee = 300;
    }

    if (
      category.includes("LAND") ||
      category === "BUILDING" ||
      category === "HOTEL"
    ) {
      baseFee += 100;
    }

    return baseFee;
  }

  /**
   * Creates a new property listing entry.
   */
  public async createListing(userId: string, input: CreatePropertyInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User account not found");

    const listingFeeETB = this.calculateListingFee(
      input.category,
      user.providerType,
    );

    const listingData: Prisma.PropertyListingCreateInput = {
      titleEn: input.titleEn,
      titleAm: input.titleAm,
      descriptionEn: input.descriptionEn,
      descriptionAm: input.descriptionAm,
      category: input.category as any,
      purpose: input.purpose as any,
      priceETB: new Prisma.Decimal(input.priceETB),
      areaSqMeters: input.areaSqMeters
        ? new Prisma.Decimal(input.areaSqMeters)
        : null,
      bedrooms: input.bedrooms || null,
      bathrooms: input.bathrooms || null,
      floors: input.floors || null,
      condition: (input.condition as any) || null,
      isFurnished: input.isFurnished || false,
      amenities: input.amenities || [],
      region: input.region,
      subCity: input.subCity || null,
      woreda: input.woreda || null,
      kebele: input.kebele || null,
      areaName: input.areaName,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      listingFeeETB: new Prisma.Decimal(listingFeeETB),
      publicationStatus: "DRAFT",
      isFeePaid: false,
      provider: { connect: { id: userId } },
      providerType: user.providerType,
    };

    return propertyRepository.create(listingData);
  }

  /**
   * Searches published listings and fetches associated Cloudinary images.
   */
  public async searchListings(query: {
    category?: string;
    purpose?: string;
    region?: string;
    subCity?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.PropertyListingWhereInput = {
      publicationStatus: "PUBLISHED", // Only display active published properties
    };

    if (query.category) where.category = query.category as any;
    if (query.purpose) where.purpose = query.purpose as any;
    if (query.region) where.region = query.region;
    if (query.subCity) where.subCity = query.subCity;

    if (query.minPrice || query.maxPrice) {
      where.priceETB = {};
      if (query.minPrice) where.priceETB.gte = query.minPrice;
      if (query.maxPrice) where.priceETB.lte = query.maxPrice;
    }

    if (query.search) {
      where.OR = [
        { titleEn: { contains: query.search, mode: "insensitive" } },
        { titleAm: { contains: query.search, mode: "insensitive" } },
        { areaName: { contains: query.search, mode: "insensitive" } },
        { descriptionEn: { contains: query.search, mode: "insensitive" } },
      ];
    }

    return propertyRepository.findMany(
      where,
      query.limit || 20,
      query.offset || 0,
    );
  }

  public async getListingById(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) throw new NotFoundError("Property listing not found");

    await propertyRepository.incrementViews(id);
    return property;
  }

  public async getMyListings(userId: string) {
    return propertyRepository.findByProviderId(userId);
  }
}

export const propertyService = new PropertyService();
