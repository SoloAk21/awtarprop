import { prisma } from "../../config/db.js";
import { Prisma } from "@prisma/client";

const propertyInclude = {
  images: {
    orderBy: { order: "asc" as const },
  },
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
} satisfies Prisma.PropertyListingInclude;

export class PropertyRepository {
  /**
   * Create a property listing.
   */
  public async create(data: Prisma.PropertyListingCreateInput) {
    return prisma.propertyListing.create({
      data,
      include: propertyInclude,
    });
  }

  /**
   * Find a property listing by ID.
   */
  public async findById(id: string) {
    return prisma.propertyListing.findUnique({
      where: { id },
      include: propertyInclude,
    });
  }

  /**
   * Find properties using Prisma filters.
   *
   * The `where` object can contain filters generated from
   * normal search parameters or AI-parsed natural language.
   */
  public async findMany(
    where: Prisma.PropertyListingWhereInput = {},
    limit = 20,
    offset = 0,
  ) {
    const [total, properties] = await Promise.all([
      prisma.propertyListing.count({
        where,
      }),

      prisma.propertyListing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
        include: propertyInclude,
      }),
    ]);

    return {
      total,
      properties,
    };
  }

  /**
   * Find all properties belonging to a provider.
   */
  public async findByProviderId(providerId: string) {
    return prisma.propertyListing.findMany({
      where: {
        providerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  /**
   * Increment property view count.
   */
  public async incrementViews(id: string) {
    return prisma.propertyListing.update({
      where: {
        id,
      },
      data: {
        viewsCount: {
          increment: 1,
        },
      },
    });
  }
}

export const propertyRepository = new PropertyRepository();
