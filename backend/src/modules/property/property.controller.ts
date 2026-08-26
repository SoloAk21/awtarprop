import { Request, Response, NextFunction } from "express";
import { propertyService } from "./property.service.js";
import { cloudinaryService } from "../../services/cloudinary.service.js";
import { prisma } from "../../config/db.js";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../errors/AppError.js";

export class PropertyController {
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const property = await propertyService.createListing(userId, req.body);
      res.status(201).json({
        status: "success",
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  };

  public uploadImages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const idParam = req.params.id;
      const propertyId = Array.isArray(idParam) ? idParam[0] : idParam;

      if (!propertyId) {
        throw new BadRequestError("Property ID is required");
      }

      const property = await prisma.propertyListing.findUnique({
        where: { id: propertyId },
        include: { images: true },
      });

      if (!property) {
        throw new NotFoundError("Property listing not found");
      }

      if (property.providerId !== userId) {
        throw new ForbiddenError("Unauthorized to modify this listing");
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new BadRequestError("At least one image file is required");
      }

      const uploadedImages = [];

      const hasCloudinary =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_CLOUD_NAME !== "your_cloudinary_cloud_name";

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let result: { url: string; publicId: string };

        if (hasCloudinary) {
          result = await cloudinaryService.uploadPropertyImage(
            file.buffer,
            propertyId,
          );
        } else {
          result = {
            url: `https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80`,
            publicId: `mock_${Date.now()}_${i}`,
          };
        }

        const imageRecord = await prisma.propertyImage.create({
          data: {
            propertyId,
            url: result.url,
            publicId: result.publicId,
            isMain: property.images.length === 0 && i === 0,
            order: property.images.length + i,
          },
        });

        uploadedImages.push(imageRecord);
      }

      res.status(200).json({
        status: "success",
        data: { images: uploadedImages },
      });
    } catch (error) {
      next(error);
    }
  };

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      const {
        category,
        purpose,
        region,
        subCity,
        minPrice,
        maxPrice,
        search,
        limit,
        offset,
      } = req.query;

      const result = await propertyService.searchListings({
        category: category as string,
        purpose: purpose as string,
        region: region as string,
        subCity: subCity as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search as string,
        limit: limit ? Number(limit) : 20,
        offset: offset ? Number(offset) : 0,
      });

      console.log(
        "[PropertyController.getAll] Total properties found:",
        result.total,
      );
      if (result.properties.length > 0) {
        console.log(
          "[PropertyController.getAll] Property 0 ID:",
          result.properties[0].id,
          "Images count:",
          result.properties[0].images?.length,
          "Sample Image URL:",
          result.properties[0].images?.[0]?.url,
        );
      }

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      if (!id) {
        return res
          .status(400)
          .json({ status: "fail", message: "Property ID is required" });
      }

      const property = await propertyService.getListingById(id);
      res.status(200).json({
        status: "success",
        data: { property },
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyListings = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      const userId = req.user!.userId;
      const properties = await propertyService.getMyListings(userId);
      res.status(200).json({
        status: "success",
        data: { properties },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const propertyController = new PropertyController();
