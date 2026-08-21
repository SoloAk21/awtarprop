import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';

export class PaymentController {
  public createCheckout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { propertyId } = req.body;

      const checkout = await paymentService.createCheckout(userId, propertyId);

      res.status(200).json({
        status: 'success',
        data: checkout,
      });
    } catch (error) {
      next(error);
    }
  };

  public verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { transactionId } = req.body;

      const result = await paymentService.verifyPaymentAndPublish(
        userId,
        transactionId
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const paymentController = new PaymentController();
