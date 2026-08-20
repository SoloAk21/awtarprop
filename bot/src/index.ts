import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || "http://localhost:5173";

if (!token || token === "your_telegram_bot_token_here") {
  console.log(
    "⚠️ TELEGRAM_BOT_TOKEN not provided or placeholder used. Bot startup skipped in dev mode.",
  );
  process.exit(0);
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  const firstName = ctx.from?.first_name || "Valued User";
  const welcomeMessage =
    `👋 Welcome ${firstName} to *AwtarProp*! 🇪🇹\n\n` +
    `Ethiopia's premier zero-commission property & land marketplace.\n\n` +
    `Browse or list properties directly using our Telegram Mini App below.`;

  return ctx.replyWithMarkdownV2(
    welcomeMessage
      .replace(/!/g, "\\!")
      .replace(/\./g, "\\.")
      .replace(/-/g, "\\-"),
    Markup.inlineKeyboard([
      [Markup.button.webApp("🏠 Open AwtarProp App", webAppUrl)],
    ]),
  );
});

bot.help((ctx) => {
  return ctx.reply(
    "Use /start to open the AwtarProp property marketplace application.",
  );
});

bot
  .launch()
  .then(() => {
    console.log("🤖 AwtarProp Telegram Bot started successfully");
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram Bot:", err.message);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
