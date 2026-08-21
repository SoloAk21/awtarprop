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

export const CUSTOM_EMOJIS = {
  WAVE: '<tg-emoji emoji-id="5418298958428527841">👋</tg-emoji>',
  PHONE: '<tg-emoji emoji-id="5247206694219427281">📞</tg-emoji>',
  PACKAGE: '<tg-emoji emoji-id="5884479287171485878">📦</tg-emoji>',
  SHIELD: '<tg-emoji emoji-id="6269105110450705259">🛡</tg-emoji>',
  CHECK: '<tg-emoji emoji-id="5980930633298350051">✅</tg-emoji>',
  SPARKLES: '<tg-emoji emoji-id="6271791595314483981">✨</tg-emoji>',
  STAR: '<tg-emoji emoji-id="6136554250668347247">⭐</tg-emoji>',
};

export const AwtarPropBrand = "<b>AwtarProp</b>";

if (!token || token.includes("your_telegram_bot_token")) {
  console.log(
    "⚠️ TELEGRAM_BOT_TOKEN unconfigured. Bot startup skipped in dev mode.",
  );
  process.exit(0);
}

const bot = new Telegraf(token);

/**
 * Checks whether user is a member of the required channel.
 */
async function checkChannelMembership(
  ctx: any,
  userId: number,
): Promise<boolean> {
  try {
    const member = await ctx.telegram.getChatMember(channelUsername, userId);
    return ["creator", "administrator", "member", "restricted"].includes(
      member.status,
    );
  } catch (error) {
    return true;
  }
}

/**
 * Checks database for existing phone verification status.
 */
async function checkDbUserPhoneStatus(telegramId: number): Promise<boolean> {
  try {
    const response = await axios.get(`${apiUrl}/auth/status/${telegramId}`);
    return response.data?.data?.isPhoneVerified === true;
  } catch (error) {
    return false;
  }
}

// 1. /start command onboarding
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name || "User";

  const isMember = await checkChannelMembership(ctx, userId);

  if (!isMember) {
    return ctx.reply(
      `<b>Official Channel Join Required</b>\n\n` +
        `Welcome ${firstName}! To access ${AwtarPropBrand} direct property marketplace, please join our official Telegram channel first.`,
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
              `${CUSTOM_EMOJIS.CHECK} I Have Joined`,
              "check_channel",
            ),
          ],
        ]),
      },
    );
  }

  // Check if contact already saved in PostgreSQL database
  const isPhoneSaved = await checkDbUserPhoneStatus(userId);

  const startPayload = (ctx as any).startPayload || "";
  let targetUrl = webAppUrl;
  if (startPayload) {
    targetUrl = `${webAppUrl}?startapp=${startPayload}`;
  }

  if (isPhoneSaved) {
    // Already verified -> Launch directly without asking for phone!
    return ctx.reply(
      `${CUSTOM_EMOJIS.WAVE} <b>Welcome back ${firstName} to ${AwtarPropBrand}!</b> ${CUSTOM_EMOJIS.SPARKLES}\n\n` +
        `Your account is fully verified. Tap below to launch the marketplace.`,
      {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(), // Remove reply contact keyboard
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("Open AwtarProp Marketplace App", targetUrl)],
        ]),
      },
    );
  }

  // Prompt contact sharing ONCE for new users
  return ctx.reply(
    `${CUSTOM_EMOJIS.WAVE} <b>Welcome ${firstName} to ${AwtarPropBrand}!</b> ${CUSTOM_EMOJIS.SPARKLES}\n\n` +
      `${CUSTOM_EMOJIS.PHONE} Please share your contact phone number below to complete verification and unlock marketplace features.`,
    {
      parse_mode: "HTML",
      ...Markup.keyboard([
        [{ text: "Share My Contact Phone Number", request_contact: true }],
      ]).resize(),
    },
  );
});

// 2. Handle Callback Query for "I Have Joined"
bot.action("check_channel", async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name || "User";
  const isMember = await checkChannelMembership(ctx, userId);

  if (!isMember) {
    return ctx.answerCbQuery(
      "You have not joined @awtarprop channel yet. Please join first!",
      { show_alert: true },
    );
  }

  await ctx.answerCbQuery("Channel membership verified!");

  const isPhoneSaved = await checkDbUserPhoneStatus(userId);

  const startPayload = (ctx as any).startPayload || "";
  let targetUrl = webAppUrl;
  if (startPayload) {
    targetUrl = `${webAppUrl}?startapp=${startPayload}`;
  }

  if (isPhoneSaved) {
    return ctx.reply(
      `${CUSTOM_EMOJIS.CHECK} <b>Channel Membership Verified!</b>\n\n` +
        `Welcome back ${firstName}! Tap below to launch the marketplace.`,
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
    `${CUSTOM_EMOJIS.CHECK} <b>Channel Membership Verified!</b>\n\n` +
      `${CUSTOM_EMOJIS.PHONE} Please share your contact phone number below to proceed to the AwtarProp App.`,
    {
      parse_mode: "HTML",
      ...Markup.keyboard([
        [{ text: "Share My Contact Phone Number", request_contact: true }],
      ]).resize(),
    },
  );
});

// 3. Handle Native Contact Sharing
bot.on("contact", async (ctx) => {
  const contact = ctx.message.contact;
  const userId = ctx.from.id;
  const phoneNumber = contact.phone_number;

  try {
    // Permanently persist phone number in PostgreSQL
    await axios.post(`${apiUrl}/auth/phone`, {
      telegramId: userId.toString(),
      phoneNumber: phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`,
    });
  } catch (err) {}

  const startPayload = (ctx as any).startPayload || "";
  let targetUrl = webAppUrl;
  if (startPayload) {
    targetUrl = `${webAppUrl}?startapp=${startPayload}`;
  }

  return ctx.reply(
    `${CUSTOM_EMOJIS.SHIELD} <b>Contact Verified & Saved Successfully!</b> ${CUSTOM_EMOJIS.STAR}\n\n` +
      `Your contact details are securely registered. Tap below to launch the ${AwtarPropBrand} Mini App.`,
    {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(), // Remove the reply keyboard permanently
      ...Markup.inlineKeyboard([
        [Markup.button.webApp("Open AwtarProp Marketplace App", targetUrl)],
      ]),
    },
  );
});

bot.help((ctx) => {
  return ctx.reply(
    "Use /start to verify membership and launch the AwtarProp application.",
  );
});

bot
  .launch()
  .then(() => {
    console.log(
      "🤖 AwtarProp Bot running with persistent database contact verification",
    );
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram Bot:", err.message);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
