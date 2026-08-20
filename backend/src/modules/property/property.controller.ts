import { Request, Response, NextFunction } from "express";
import { propertyService } from "./property.service.js";

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

  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
