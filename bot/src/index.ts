import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || "http://localhost:5173";

if (!token || token.includes("your_telegram_bot_token")) {
  console.log(
    "⚠️ TELEGRAM_BOT_TOKEN unconfigured. Bot startup skipped in dev mode.",
  );
  process.exit(0);
}

const bot = new Telegraf(token);

// Telegram /start command with optional deep linking payload
bot.start((ctx) => {
  const firstName = ctx.from?.first_name || "Valued User";
  const startPayload = ctx.payload; // Deep link payload e.g. /start prop_123

  let targetUrl = webAppUrl;
  if (startPayload) {
    targetUrl = `${webAppUrl}?startapp=${startPayload}`;
  }

  const welcomeMessage =
    `👋 *Welcome ${firstName} to AwtarProp!* 🇪🇹\n\n` +
    `Ethiopia's direct property & land marketplace for Owners, Brokers, Agents, Agencies, and Developers.\n\n` +
    `Tap the button below to browse or publish listings directly.`;

  return ctx.replyWithMarkdownV2(
    welcomeMessage
      .replace(/!/g, "\\!")
      .replace(/\./g, "\\.")
      .replace(/-/g, "\\-"),
    Markup.inlineKeyboard([
      [Markup.button.webApp("🏠 Open AwtarProp App", targetUrl)],
    ]),
  );
});

bot.help((ctx) => {
  return ctx.reply(
    "Use /start to launch the AwtarProp application or browse property listings.",
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
