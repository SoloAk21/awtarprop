import { propertyRepository } from "./property.repository.js";
import { prisma } from "../../config/db.js";
import { NotFoundError, ForbiddenError } from "../../errors/AppError.js";
import { CreatePropertyInput } from "@awtarprop/shared";
import { Prisma, ProviderType } from "@prisma/client";
import { aiService } from "../../services/ai.service.js";
import { logger } from "../../utils/logger.js";

export interface SearchQueryOptions {
  category?: string;
  purpose?: string;
  providerType?: string;
  region?: string;
  subCity?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  isFurnished?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export class PropertyService {
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

  public async createListing(userId: string, input: CreatePropertyInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User account not found");

    // Allow user to set provider role per property, or fallback to user default profile type
    const effectiveProviderType =
      (input.providerType as ProviderType) || user.providerType;

    const listingFeeETB = this.calculateListingFee(
      input.category,
      effectiveProviderType,
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
      region: input.region || "Addis Ababa",
      subCity: input.subCity || null,
      woreda: input.woreda || null,
      kebele: input.kebele || null,
      areaName: input.areaName,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      listingFeeETB: new Prisma.Decimal(listingFeeETB),
      publicationStatus: "PUBLISHED", // Set default for immediate visibility in testing
      isFeePaid: true,
      provider: { connect: { id: userId } },
      providerType: effectiveProviderType,
    };

    return propertyRepository.create(listingData);
  }

  public async updateListing(
    userId: string,
    propertyId: string,
    input: Partial<CreatePropertyInput>,
  ) {
    const property = await propertyRepository.findById(propertyId);
    if (!property) throw new NotFoundError("Property listing not found");

    if (property.providerId !== userId) {
      throw new ForbiddenError(
        "You are not authorized to edit this property listing",
      );
    }

    const updateData: Prisma.PropertyListingUpdateInput = {
      ...(input.titleEn && { titleEn: input.titleEn }),
      ...(input.titleAm && { titleAm: input.titleAm }),
      ...(input.descriptionEn && { descriptionEn: input.descriptionEn }),
      ...(input.descriptionAm && { descriptionAm: input.descriptionAm }),
      ...(input.category && { category: input.category as any }),
      ...(input.purpose && { purpose: input.purpose as any }),
      ...(input.providerType && { providerType: input.providerType as any }),
      ...(input.priceETB && { priceETB: new Prisma.Decimal(input.priceETB) }),
      ...(input.areaSqMeters !== undefined && {
        areaSqMeters: input.areaSqMeters
          ? new Prisma.Decimal(input.areaSqMeters)
          : null,
      }),
      ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
      ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
      ...(input.floors !== undefined && { floors: input.floors }),
      ...(input.condition && { condition: input.condition as any }),
      ...(input.isFurnished !== undefined && {
        isFurnished: input.isFurnished,
      }),
      ...(input.amenities && { amenities: input.amenities }),
      ...(input.region && { region: input.region }),
      ...(input.subCity !== undefined && { subCity: input.subCity }),
      ...(input.areaName && { areaName: input.areaName }),
      ...(input.latitude !== undefined && { latitude: input.latitude }),
      ...(input.longitude !== undefined && { longitude: input.longitude }),
    };

    return prisma.propertyListing.update({
      where: { id: propertyId },
      data: updateData,
      include: {
        images: { orderBy: { order: "asc" } },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            phoneNumber: true,
            providerType: true,
          },
        },
      },
    });
  }

  /**
   * High-Performance AI & Multi-Filter Search Engine
   */
  public async searchListings(query: SearchQueryOptions) {
    const where: Prisma.PropertyListingWhereInput = {
      publicationStatus: "PUBLISHED",
    };

    let effectiveSearchTerm = query.search?.trim();

    // 1. Natural Language Extraction via Gemini AI
    if (effectiveSearchTerm && effectiveSearchTerm.length > 3) {
      try {
        const aiFilters = await aiService.parseSearchQuery(effectiveSearchTerm);
        logger.info(`AI Search Filter extracted: ${JSON.stringify(aiFilters)}`);

        if (aiFilters.category && !query.category)
          query.category = aiFilters.category;
        if (aiFilters.purpose && !query.purpose)
          query.purpose = aiFilters.purpose;
        if (aiFilters.providerType && !query.providerType)
          query.providerType = aiFilters.providerType;
        if (aiFilters.subCity && !query.subCity)
          query.subCity = aiFilters.subCity;
        if (aiFilters.minPrice && !query.minPrice)
          query.minPrice = aiFilters.minPrice;
        if (aiFilters.maxPrice && !query.maxPrice)
          query.maxPrice = aiFilters.maxPrice;
        if (aiFilters.bedrooms && !query.bedrooms)
          query.bedrooms = aiFilters.bedrooms;
        if (aiFilters.bathrooms && !query.bathrooms)
          query.bathrooms = aiFilters.bathrooms;
        if (
          aiFilters.isFurnished !== undefined &&
          query.isFurnished === undefined
        ) {
          query.isFurnished = aiFilters.isFurnished;
        }

        if (aiFilters.searchKeyword) {
          effectiveSearchTerm = aiFilters.searchKeyword;
        }
      } catch (err) {
        logger.warn(
          "Natural language search parsing fallback to standard text search.",
        );
      }
    }

    // 2. Structured Database Indexed Filtering
    if (query.category) where.category = query.category as any;
    if (query.purpose) where.purpose = query.purpose as any;
    if (query.providerType) where.providerType = query.providerType as any;
    if (query.region) where.region = query.region;
    if (query.subCity) where.subCity = query.subCity;
    if (query.isFurnished !== undefined) where.isFurnished = query.isFurnished;
    if (query.bedrooms) where.bedrooms = { gte: Number(query.bedrooms) };
    if (query.bathrooms) where.bathrooms = { gte: Number(query.bathrooms) };

    if (query.minPrice || query.maxPrice) {
      where.priceETB = {};
      if (query.minPrice) where.priceETB.gte = query.minPrice;
      if (query.maxPrice) where.priceETB.lte = query.maxPrice;
    }

    // 3. Keyword Sub-search across text fields
    if (effectiveSearchTerm && effectiveSearchTerm.length > 0) {
      const term = effectiveSearchTerm;
      where.OR = [
        { titleEn: { contains: term, mode: "insensitive" } },
        { titleAm: { contains: term, mode: "insensitive" } },
        { descriptionEn: { contains: term, mode: "insensitive" } },
        { descriptionAm: { contains: term, mode: "insensitive" } },
        { areaName: { contains: term, mode: "insensitive" } },
        { region: { contains: term, mode: "insensitive" } },
        { subCity: { contains: term, mode: "insensitive" } },
        { amenities: { hasSome: [term] } },
      ];
    }

    return propertyRepository.findMany(
      where,
      query.limit ? Number(query.limit) : 20,
      query.offset ? Number(query.offset) : 0,
    );
  }

  public async getListingById(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) throw new NotFoundError("Property listing not found");

    // Increment view count in DB asynchronously
    propertyRepository.incrementViews(id).catch((err) => {
      logger.error(
        `Failed to increment view count for property ${id}: ${err.message}`,
      );
    });

    return property;
  }

  public async getMyListings(userId: string) {
    return propertyRepository.findByProviderId(userId);
  }
}

export const propertyService = new PropertyService();
