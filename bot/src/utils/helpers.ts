import { Context } from "telegraf";
import { config } from "../config/env";

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
