import { Telegraf, Context } from "telegraf";
import { config } from "./config/env";
import { MESSAGES } from "./i18n/messages";
import { releaseLock } from "./services/cache.service";

export interface BotContext extends Context {
  startPayload?: string;
}

export const bot = new Telegraf<BotContext>(config.token, {
  handlerTimeout: 10_000,
});

// Global Telegraf Error Middleware
bot.catch(async (err, ctx) => {
  console.error(`Unhandled error on ${ctx.updateType}:`, err);
  if (ctx.from?.id) releaseLock(ctx.from.id);

  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery("Error occurred. Please try again.", {
        show_alert: true,
      });
    } else {
      await ctx.reply(MESSAGES.EN.errorGeneric, { parse_mode: "HTML" });
    }
  } catch {}
});
