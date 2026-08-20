import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { verifyTelegramInitData } from "../../utils/telegramAuth.js";
import { UnauthorizedError } from "../../errors/AppError.js";
import { TelegramAuthInput } from "./auth.schema.js";
import { ProviderType, PreferredLanguage } from "@awtarprop/shared";

export interface AuthJwtPayload {
  userId: string;
  telegramId: string;
  role: string;
}

export class AuthService {
  /**
   * Authenticates Telegram initData, provisions or updates User record in DB, and returns JWT token.
   */
  public async authenticateTelegramUser(input: TelegramAuthInput) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

    // In local development mode without bot token, allow bypass if explicitly configured
    let validatedTelegram = verifyTelegramInitData(input.initData, botToken);

    // Development fallback mock parsing when bot token is placeholder
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
      } catch (e) {
        // Fallback failed
      }
    }

    if (!validatedTelegram) {
      throw new UnauthorizedError("Invalid Telegram authentication signature");
    }

    const { user: tgUser } = validatedTelegram;

    // Upsert user in database
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

    // Generate JWT access token
    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegramId.toString(),
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
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
   * Retrieves full profile details of current user.
   */
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
