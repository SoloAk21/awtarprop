import { Context } from "telegraf";
import { config } from "../config/env";
import { userCache } from "../services/cache.service";

export function buildWebAppUrl(payload?: string): string {
  return payload ? `${config.webAppUrl}?startapp=${payload}` : config.webAppUrl;
}

export function normalizePhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

export async function safeDeleteMessage(
  ctx: Context,
  messageId?: number,
): Promise<void> {
  try {
    if (messageId) {
      await ctx.telegram.deleteMessage(ctx.chat!.id, messageId);
    } else {
      await ctx.deleteMessage();
    }
  } catch {}
}

// Automatically deletes previous bot response to keep chat clean
export async function safeDeletePreviousBotMessage(
  ctx: Context,
  userId: number,
): Promise<void> {
  const cached = userCache.get(userId);
  if (cached?.lastBotMessageId && ctx.chat?.id) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, cached.lastBotMessageId);
    } catch {}
    cached.lastBotMessageId = undefined;
  }
}

// Helper to send a new message and auto-track it for future cleanup
export async function sendCleanMessage(
  ctx: Context,
  userId: number,
  text: string,
  extra: any = {},
) {
  await safeDeletePreviousBotMessage(ctx, userId);
  const msg = await ctx.reply(text, extra);
  const cached = userCache.get(userId);
  if (cached) {
    cached.lastBotMessageId = msg.message_id;
  }
  return msg;
}
