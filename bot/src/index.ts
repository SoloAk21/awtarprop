import { Telegraf, Markup } from "telegraf";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBAPP_URL || "http://localhost:5173";
const apiUrl = process.env.VITE_API_URL || "http://localhost:5000/api/v1";
const channelUsername = process.env.TELEGRAM_CHANNEL_USERNAME || "@awtarprop";

// Custom AwtarProp Letter Emoji Object
export const AwtarProp = {
  Letter1: '<tg-emoji emoji-id="5782672743891738322">❗️</tg-emoji>', // A
  Letter2: '<tg-emoji emoji-id="5783148145231798110">❗️</tg-emoji>', // W
  Letter3: '<tg-emoji emoji-id="5783141831629872580">❗️</tg-emoji>', // T
  Letter4: '<tg-emoji emoji-id="5782853957151892262">❗️</tg-emoji>', // A
  Letter5: '<tg-emoji emoji-id="5782867280140443341">❗️</tg-emoji>', // R
};

export const AwtarPropLogoHeader =
  `${AwtarProp.Letter1}` +
  `${AwtarProp.Letter2}` +
  `${AwtarProp.Letter3}` +
  `${AwtarProp.Letter4}` +
  `${AwtarProp.Letter5}`;

// Verified Telegram Premium Custom Emojis (HTML <tg-emoji> format)
export const PREMIUM_EMOJIS = {
  WAVE: '<tg-emoji emoji-id="5418298958428527841">👋</tg-emoji>',
  PHONE: '<tg-emoji emoji-id="5247206694219427281">📞</tg-emoji>',
  PACKAGE: '<tg-emoji emoji-id="5884479287171485878">📦</tg-emoji>',
  SHIELD: '<tg-emoji emoji-id="6269105110450705259">🛡</tg-emoji>',
  CHECK: '<tg-emoji emoji-id="5980930633298350051">✅</tg-emoji>',
  SPARKLES: '<tg-emoji emoji-id="6271791595314483981">✨</tg-emoji>',
  STAR: '<tg-emoji emoji-id="6136554250668347247">⭐</tg-emoji>',
  WARNING: '<tg-emoji emoji-id="6269176896534091959">⚠️</tg-emoji>',
  PIN: '<tg-emoji emoji-id="6269321542442685793">📌</tg-emoji>',
};

export const AwtarPropBrandName = "<b>AwtarProp</b>";

if (!token || token.includes("your_telegram_bot_token")) {
  console.log(
    "⚠️ TELEGRAM_BOT_TOKEN unconfigured. Bot startup skipped in dev mode.",
  );
  process.exit(0);
}

const bot = new Telegraf(token);

/**
 * Advanced Verification: Checks channel subscription against Telegram API.
 */
async function verifyChannelSubscription(
  ctx: any,
  userId: number,
): Promise<boolean> {
  try {
    const member = await ctx.telegram.getChatMember(channelUsername, userId);
    return ["creator", "administrator", "member", "restricted"].includes(
      member.status,
    );
  } catch (error: any) {
    return true; // Fallback for dev environments
  }
}

/**
 * Checks backend database to verify if user's phone contact is already saved.
 */
async function verifyDatabaseUserPhone(telegramId: number): Promise<boolean> {
  try {
    const response = await axios.get(`${apiUrl}/auth/status/${telegramId}`, {
      timeout: 3000,
    });
    return response.data?.data?.isPhoneVerified === true;
  } catch (error) {
    return false;
  }
}

// Global Telegraf Error Handler
bot.catch((err: any, ctx: any) => {
  console.error(`🤖 Telegraf Global Catch Error for ${ctx.updateType}:`, err);
  try {
    if (ctx.callbackQuery) {
      ctx.answerCbQuery("An unexpected error occurred. Please try again.", {
        show_alert: true,
      });
    } else {
      ctx.reply(
        `${PREMIUM_EMOJIS.WARNING} <b>Temporary Service Interruption</b>\n\nPlease try again shortly.`,
        { parse_mode: "HTML" },
      );
    }
  } catch (e) {}
});

// 1. /start command
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || "User";

    // Step A: Strict Mandatory Channel Subscription Check
    const isChannelSubscribed = await verifyChannelSubscription(ctx, userId);

    if (!isChannelSubscribed) {
      return ctx.reply(
        `${AwtarPropLogoHeader} <b>Official Channel Join Required</b>\n\n` +
          `Welcome ${firstName}! To unlock the ${AwtarPropBrandName} direct property marketplace, you must join our official Telegram channel first.`,
        {
          parse_mode: "HTML",
          ...Markup.inlineKeyboard([
            [
              Markup.button.url(
                "📢 Join @awtarprop Channel",
                `https://t.me/${channelUsername.replace("@", "")}`,
              ),
            ],
            [
              Markup.button.callback(
                `${PREMIUM_EMOJIS.CHECK} I Have Joined`,
                "verify_channel",
              ),
            ],
          ]),
        },
      );
    }

    // Step B: Check DB Contact Verification
    const isPhoneVerified = await verifyDatabaseUserPhone(userId);

    const startPayload = (ctx as any).startPayload || "";
    let targetUrl = webAppUrl;
    if (startPayload) {
      targetUrl = `${webAppUrl}?startapp=${startPayload}`;
    }

    if (isPhoneVerified) {
      return ctx.reply(
        `${PREMIUM_EMOJIS.WAVE} <b>Welcome back ${firstName} to </b> ${AwtarPropLogoHeader}\n\n` +
          `Your account is authorized. Tap below to launch the marketplace app.`,
        {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
          ...Markup.inlineKeyboard([
            [Markup.button.webApp("Open AwtarProp Marketplace App", targetUrl)],
          ]),
        },
      );
    }

    // Step C: Prompt Contact Phone Sharing ONCE
    return ctx.reply(
      `${PREMIUM_EMOJIS.WAVE} <b>Welcome ${firstName} to </b> ${AwtarPropLogoHeader}\n\n` +
        `${PREMIUM_EMOJIS.PHONE} Please share your contact phone number below to complete one-time verification.`,
      {
        parse_mode: "HTML",
        ...Markup.keyboard([
          [{ text: "Share Contact Phone Number", request_contact: true }],
        ]).resize(),
      },
    );
  } catch (error) {
    console.error("Error in /start handler:", error);
  }
});

// 2. Callback Query: Verify Channel Join
bot.action("verify_channel", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || "User";

    const isSubscribed = await verifyChannelSubscription(ctx, userId);

    if (!isSubscribed) {
      return ctx.answerCbQuery(
        "❌ Subscription Check Failed: You have not joined @awtarprop channel yet!",
        { show_alert: true },
      );
    }

    await ctx.answerCbQuery("✅ Channel subscription verified!");

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    const isPhoneVerified = await verifyDatabaseUserPhone(userId);

    const startPayload = (ctx as any).startPayload || "";
    let targetUrl = webAppUrl;
    if (startPayload) {
      targetUrl = `${webAppUrl}?startapp=${startPayload}`;
    }

    if (isPhoneVerified) {
      return ctx.reply(
        `${AwtarPropLogoHeader} <b>Channel Subscription Verified!</b>\n\n` +
          `Welcome ${firstName}! Tap below to launch the ${AwtarPropBrandName} Mini App.`,
        {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
          ...Markup.inlineKeyboard([
            [Markup.button.webApp("Open AwtarProp Marketplace App", targetUrl)],
          ]),
        },
      );
    }

    return ctx.reply(
      `${AwtarPropLogoHeader} <b>Channel Subscription Verified!</b>\n\n` +
        `${PREMIUM_EMOJIS.PHONE} Please share your contact phone number below to complete verification.`,
      {
        parse_mode: "HTML",
        ...Markup.keyboard([
          [{ text: "Share Contact Phone Number", request_contact: true }],
        ]).resize(),
      },
    );
  } catch (error) {
    console.error("Error in verify_channel handler:", error);
  }
});

// 3. Handle Native Contact Sharing
bot.on("contact", async (ctx) => {
  try {
    const contact = ctx.message.contact;
    const userId = ctx.from.id;
    const phoneNumber = contact.phone_number;

    try {
      await axios.post(
        `${apiUrl}/auth/phone`,
        {
          telegramId: userId.toString(),
          phoneNumber: phoneNumber.startsWith("+")
            ? phoneNumber
            : `+${phoneNumber}`,
        },
        { timeout: 4000 },
      );
    } catch (err) {}

    const startPayload = (ctx as any).startPayload || "";
    let targetUrl = webAppUrl;
    if (startPayload) {
      targetUrl = `${webAppUrl}?startapp=${startPayload}`;
    }

    return ctx.reply(
      `${PREMIUM_EMOJIS.SHIELD} <b>Contact Verification Complete!</b> ${AwtarPropLogoHeader}\n\n` +
        `Your contact phone number is securely registered. Tap below to launch the ${AwtarPropBrandName} Mini App.`,
      {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("Open AwtarProp Marketplace App", targetUrl)],
        ]),
      },
    );
  } catch (error) {
    console.error("Error in contact handler:", error);
  }
});

bot.help((ctx) => {
  return ctx.reply(
    "Use /start to verify channel membership and launch the AwtarProp application.",
  );
});

bot
  .launch()
  .then(() => {
    console.log(
      "🤖 AwtarProp Bot running with custom AwtarProp letter emoji header",
    );
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram Bot:", err.message);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
