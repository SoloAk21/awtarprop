import { prisma } from '../../config/db.js';
import { Prisma } from '@prisma/client';

export class PropertyRepository {
  public async create(data: Prisma.PropertyListingCreateInput) {
    return prisma.propertyListing.create({
      data,
      include: {
        images: true,
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

  public async findById(id: string) {
    return prisma.propertyListing.findUnique({
      where: { id },
      include: {
        images: true,
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

  public async findMany(
    where: Prisma.PropertyListingWhereInput,
    limit = 20,
    offset = 0
  ) {
    const [total, properties] = await Promise.all([
      prisma.propertyListing.count({ where }),
      prisma.propertyListing.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
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
      }),
    ]);

    return { total, properties };
  }

  public async findByProviderId(providerId: string) {
    return prisma.propertyListing.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        images: true,
      },
    });
  }

  public async incrementViews(id: string) {
    return prisma.propertyListing.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  }
}

export const propertyRepository = new PropertyRepository();
