import { Request, Response, NextFunction } from "express";
import { paymentService } from "./payment.service.js";

export class PaymentController {
  public initializeChapa = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const { propertyId } = req.body;

      const checkout = await paymentService.initializeChapaCheckout(
        userId,
        propertyId,
      );
      res.status(200).json({
        status: "success",
        data: checkout,
      });
    } catch (error) {
      next(error);
    }
  };

  public verifyChapa = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user!.userId;
      const { txRef } = req.body;

      const result = await paymentService.verifyChapaPayment(userId, txRef);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public handleChapaWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const signature = (req.headers["chapa-signature"] ||
        req.headers["x-chapa-signature"]) as string;
      const rawBodyBuffer = req.body as Buffer;

      const result = await paymentService.handleChapaWebhook(
        signature || "",
        rawBodyBuffer,
      );
      res.status(200).send(result.message);
    } catch (error) {
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
