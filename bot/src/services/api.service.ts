import axios from "axios";
import { Context } from "telegraf";
import { config } from "../config/env";
import { SupportedLang } from "../i18n/messages";
import { userCache, UserCacheState, CACHE_TTL_MS } from "./cache.service";
import { normalizePhone } from "../utils/helpers";

export async function checkUserDbStatus(
  telegramId: number,
): Promise<UserCacheState> {
  const cached = userCache.get(telegramId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const { data } = await axios.get(
      `${config.apiUrl}/auth/status/${telegramId}`,
      { timeout: 5000 },
    );
    const state: UserCacheState = {
      isPhoneVerified: data?.data?.isPhoneVerified === true,
      preferredLanguage: (data?.data?.preferredLanguage === "AM"
        ? "AM"
        : "EN") as SupportedLang,
      cachedAt: Date.now(),
    };
    userCache.set(telegramId, state);
    return state;
  } catch {
    const fallback: UserCacheState = {
      isPhoneVerified: cached?.isPhoneVerified ?? false,
      preferredLanguage: cached?.preferredLanguage ?? "EN",
      cachedAt: Date.now(),
    };
    return fallback;
  }
}

export async function registerPhone(
  telegramId: number,
  phoneNumber: string,
): Promise<void> {
  try {
    await axios.post(
      `${config.apiUrl}/auth/phone`,
      {
        telegramId: telegramId.toString(),
        phoneNumber: normalizePhone(phoneNumber),
      },
      { timeout: 5000 },
    );
  } catch (error) {
    console.error(
      `Failed to register phone for ${telegramId}:`,
      error instanceof Error ? error.message : error,
    );
  } finally {
    const existing = userCache.get(telegramId);
    userCache.set(telegramId, {
      isPhoneVerified: true,
      preferredLanguage: existing?.preferredLanguage || "EN",
      cachedAt: Date.now(),
    });
  }
}

export async function registerLanguage(
  telegramId: number,
  language: SupportedLang,
): Promise<void> {
  try {
    await axios.post(
      `${config.apiUrl}/auth/language`,
      { telegramId: telegramId.toString(), preferredLanguage: language },
      { timeout: 5000 },
    );
  } catch (error) {
    console.error(
      `Failed to register language for ${telegramId}:`,
      error instanceof Error ? error.message : error,
    );
  } finally {
    const existing = userCache.get(telegramId);
    userCache.set(telegramId, {
      isPhoneVerified: existing?.isPhoneVerified || false,
      preferredLanguage: language,
      cachedAt: Date.now(),
    });
  }
}

export async function verifyChannelSubscription(
  ctx: Context,
  userId: number,
): Promise<boolean> {
  if (!config.channelUsername) return true;
  try {
    const member = await ctx.telegram.getChatMember(
      config.channelUsername,
      userId,
    );
    return ["creator", "administrator", "member", "restricted"].includes(
      member.status,
    );
  } catch {
    return true;
  }
}
