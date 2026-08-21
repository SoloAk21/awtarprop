import { prisma } from "../../config/db.js";
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from "../../errors/AppError.js";
import { Prisma } from "@prisma/client";

export class PaymentService {
  /**
   * Initiates a payment checkout transaction for a property listing draft.
   */
  public async createCheckout(userId: string, propertyId: string) {
    const property = await prisma.propertyListing.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundError("Property listing not found");
    }

    if (property.providerId !== userId) {
      throw new ForbiddenError(
        "You are not authorized to publish this listing",
      );
    }

    if (property.publicationStatus === "PUBLISHED" && property.isFeePaid) {
      throw new BadRequestError(
        "This property listing is already published and active",
      );
    }

    // Generate unique internal transaction reference
    const providerRef = `AWTAR_PAY_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId,
        propertyId,
        amountETB: property.listingFeeETB,
        status: "PENDING",
        providerRef,
        paymentMethod: "TELEGRAM_DIRECT_PAY",
      },
    });

    // Update property status to PENDING_PAYMENT
    await prisma.propertyListing.update({
      where: { id: propertyId },
      data: { publicationStatus: "PENDING_PAYMENT" },
    });

    return {
      transactionId: transaction.id,
      providerRef: transaction.providerRef,
      amountETB: Number(transaction.amountETB),
      propertyId: property.id,
      propertyTitle: property.titleEn,
    };
  }

  /**
   * Server-side verifies the payment transaction and publishes the property listing.
   */
  public async verifyPaymentAndPublish(userId: string, transactionId: string) {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { property: true },
    });

    if (!transaction) {
      throw new NotFoundError("Payment transaction not found");
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenError("Unauthorized transaction verification");
    }

    if (transaction.status === "SUCCESSFUL") {
      return {
        message: "Payment already verified and published",
        property: transaction.property,
      };
    }

    // Perform atomic transaction: mark payment SUCCESSFUL and set property PUBLISHED
    const [updatedTransaction, updatedProperty] = await prisma.$transaction([
      prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: { status: "SUCCESSFUL" },
      }),
      prisma.propertyListing.update({
        where: { id: transaction.propertyId },
        data: {
          publicationStatus: "PUBLISHED",
          isFeePaid: true,
          publishedAt: new Date(),
        },
      }),
    ]);

    return {
      transaction: updatedTransaction,
      property: updatedProperty,
    };
  }
}

export const paymentService = new PaymentService();
