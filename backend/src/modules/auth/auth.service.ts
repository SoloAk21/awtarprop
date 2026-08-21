import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { verifyTelegramInitData } from "../../utils/telegramAuth.js";
import { UnauthorizedError, NotFoundError } from "../../errors/AppError.js";
import { TelegramAuthInput, UpdatePhoneInput } from "./auth.schema.js";
import { ProviderType, PreferredLanguage } from "@awtarprop/shared";

export interface AuthJwtPayload {
  userId: string;
  telegramId: string;
  role: string;
}

export class AuthService {
  public async authenticateTelegramUser(input: TelegramAuthInput) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

    let validatedTelegram = verifyTelegramInitData(input.initData, botToken);

    if (
      !validatedTelegram &&
      env.NODE_ENV === "development" &&
      botToken.includes("your_telegram_bot_token")
    ) {
      try {
        const urlParams = new URLSearchParams(input.initData);
        const userStr = urlParams.get("user");
        if (userStr) {
          validatedTelegram = {
            user: JSON.parse(userStr),
            authDate: Math.floor(Date.now() / 1000),
            hash: "dev_mock_hash",
          };
        }
      } catch (e) {}
    }

    if (!validatedTelegram) {
      throw new UnauthorizedError("Invalid Telegram authentication signature");
    }

    const { user: tgUser } = validatedTelegram;

    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
      },
      create: {
        telegramId: BigInt(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        providerType: (input.providerType as ProviderType) || "OWNER",
        preferredLanguage:
          (input.preferredLanguage as PreferredLanguage) || "EN",
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegramId.toString(),
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
        providerType: user.providerType,
        preferredLanguage: user.preferredLanguage,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Checks if a user exists in database and if their phone number is verified.
   */
  public async checkTelegramUserStatus(telegramId: string) {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      return { exists: false, isPhoneVerified: false };
    }

    return {
      exists: true,
      isPhoneVerified: user.isPhoneVerified && !!user.phoneNumber,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
    };
  }

  public async updateUserPhone(input: UpdatePhoneInput) {
    const user = await prisma.user.findUnique({
      where: { telegramId: BigInt(input.telegramId) },
    });

    if (!user) {
      // Upsert user if contact received before auth
      const created = await prisma.user.create({
        data: {
          telegramId: BigInt(input.telegramId),
          firstName: "Telegram User",
          phoneNumber: input.phoneNumber,
          isPhoneVerified: true,
        },
      });
      return {
        id: created.id,
        telegramId: created.telegramId.toString(),
        phoneNumber: created.phoneNumber,
        isPhoneVerified: created.isPhoneVerified,
      };
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: input.phoneNumber,
        isPhoneVerified: true,
      },
    });

    return {
      id: updated.id,
      telegramId: updated.telegramId.toString(),
      phoneNumber: updated.phoneNumber,
      isPhoneVerified: updated.isPhoneVerified,
    };
  }

  public async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedError("User account not found");
    }

    return {
      id: user.id,
      telegramId: user.telegramId.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phoneNumber: user.phoneNumber,
      isPhoneVerified: user.isPhoneVerified,
      role: user.role,
      providerType: user.providerType,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
