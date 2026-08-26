import { propertyRepository } from "./property.repository.js";
import { prisma } from "../../config/db.js";
import { NotFoundError, ForbiddenError } from "../../errors/AppError.js";
import { CreatePropertyInput } from "@awtarprop/shared";
import { Prisma } from "@prisma/client";

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
   * Deep universal search across purpose, category, providerType, locations, titles, descriptions, and amenities.
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
      publicationStatus: "PUBLISHED",
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

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      const termUpper = term.toUpperCase().replace(/\s+/g, "_");

      // Check enum matches
      const matchingPurposes = [
        "FOR_SALE",
        "FOR_RENT",
        "LOOKING_TO_BUY",
        "LOOKING_TO_RENT",
      ].filter(
        (p) =>
          p.includes(termUpper) ||
          p.replace(/_/g, " ").includes(term.toUpperCase()),
      );

      const matchingCategories = [
        "APARTMENT",
        "CONDOMINIUM",
        "RESIDENTIAL_HOUSE",
        "VILLA",
        "STUDIO",
        "COMMERCIAL_SPACE",
        "OFFICE",
        "SHOP",
        "WAREHOUSE",
        "BUILDING",
        "HOTEL",
        "RESIDENTIAL_LAND",
        "COMMERCIAL_LAND",
        "AGRICULTURAL_LAND",
      ].filter(
        (c) =>
          c.includes(termUpper) ||
          c.replace(/_/g, " ").includes(term.toUpperCase()),
      );

      const matchingProviders = [
        "OWNER",
        "BROKER",
        "AGENT",
        "AGENCY",
        "DEVELOPER",
      ].filter((pr) => pr.includes(termUpper));

      const orConditions: Prisma.PropertyListingWhereInput[] = [
        { titleEn: { contains: term, mode: "insensitive" } },
        { titleAm: { contains: term, mode: "insensitive" } },
        { descriptionEn: { contains: term, mode: "insensitive" } },
        { descriptionAm: { contains: term, mode: "insensitive" } },
        { areaName: { contains: term, mode: "insensitive" } },
        { region: { contains: term, mode: "insensitive" } },
        { subCity: { contains: term, mode: "insensitive" } },
        { woreda: { contains: term, mode: "insensitive" } },
        { kebele: { contains: term, mode: "insensitive" } },
        { amenities: { hasSome: [term] } },
      ];

      if (matchingPurposes.length > 0) {
        orConditions.push({ purpose: { in: matchingPurposes as any } });
      }
      if (matchingCategories.length > 0) {
        orConditions.push({ category: { in: matchingCategories as any } });
      }
      if (matchingProviders.length > 0) {
        orConditions.push({ providerType: { in: matchingProviders as any } });
      }

      where.OR = orConditions;
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
