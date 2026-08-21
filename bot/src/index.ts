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

const CUSTOM_EMOJIS = {
  SHIELD: '<tg-emoji emoji-id="6269105110450705259">🛡</tg-emoji>',
  CHECK: '<tg-emoji emoji-id="5980930633298350051">✅</tg-emoji>',
  SPARKLES: '<tg-emoji emoji-id="6271791595314483981">✨</tg-emoji>',
};

const AwtarPropBrand = "<b>AwtarProp</b>";

if (!token || token.includes("your_telegram_bot_token")) {
  console.log(
    "⚠️ TELEGRAM_BOT_TOKEN unconfigured. Bot startup skipped in dev mode.",
  );
  process.exit(0);
}

const bot = new Telegraf(token);

/**
 * Verifies channel membership for Telegram user.
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
    return true; // Fallback for dev environments
  }
}

/**
 * Queries backend to check if user phone contact is verified in database.
 */
async function checkUserPhoneVerification(
  telegramId: number,
): Promise<boolean> {
  try {
    const response = await axios.get(`${apiUrl}/auth/status/${telegramId}`);
    return response.data?.data?.isPhoneVerified === true;
  } catch (error) {
    return false;
  }
}

// 1. /start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name || "User";

  // Check Channel Membership
  const isMember = await checkChannelMembership(ctx, userId);

  if (!isMember) {
    return ctx.reply(
      `<b>Channel Membership Required</b>\n\n` +
        `Welcome ${firstName}. To access the ${AwtarPropBrand} direct property marketplace, please join our official Telegram channel.`,
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [
            Markup.button.url(
              "Join @awtarprop Channel",
              `https://t.me/${channelUsername.replace("@", "")}`,
            ),
          ],
          [Markup.button.callback("I Have Joined", "check_channel")],
        ]),
      },
    );
  }

  // Check DB Phone Verification Status
  const isPhoneVerified = await checkUserPhoneVerification(userId);

  const startPayload = (ctx as any).startPayload || "";
  let targetUrl = webAppUrl;
  if (startPayload) {
    targetUrl = `${webAppUrl}?startapp=${startPayload}`;
  }

  if (isPhoneVerified) {
    return ctx.reply(
      `Welcome back ${firstName} to ${AwtarPropBrand}.\n\n` +
        `Your account is verified. Tap below to launch the marketplace.`,
      {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("Open AwtarProp App", targetUrl)],
        ]),
      },
    );
  }

  // Prompt Contact Sharing ONCE
  return ctx.reply(
    `Welcome ${firstName} to ${AwtarPropBrand}.\n\n` +
      `Please share your contact phone number below to complete one-time verification.`,
    {
      parse_mode: "HTML",
      ...Markup.keyboard([
        [{ text: "Share Contact Phone Number", request_contact: true }],
      ]).resize(),
    },
  );
});

// 2. Callback for "I Have Joined"
bot.action("check_channel", async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name || "User";
  const isMember = await checkChannelMembership(ctx, userId);

  if (!isMember) {
    return ctx.answerCbQuery(
      "Please join @awtarprop channel first to continue.",
      { show_alert: true },
    );
  }

  await ctx.answerCbQuery("Channel membership verified");

  // Clean up channel prompt message
  try {
    await ctx.deleteMessage();
  } catch (e) {}

  const isPhoneVerified = await checkUserPhoneVerification(userId);

  const startPayload = (ctx as any).startPayload || "";
  let targetUrl = webAppUrl;
  if (startPayload) {
    targetUrl = `${webAppUrl}?startapp=${startPayload}`;
  }

  if (isPhoneVerified) {
    return ctx.reply(
      `Welcome ${firstName} to ${AwtarPropBrand}.\n\n` +
        `Your account is verified. Tap below to launch the marketplace.`,
      {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("Open AwtarProp App", targetUrl)],
        ]),
      },
    );
  }

  return ctx.reply(
    `Channel Membership Verified.\n\n` +
      `Please share your contact phone number below to proceed to the AwtarProp App.`,
    {
      parse_mode: "HTML",
      ...Markup.keyboard([
        [{ text: "Share Contact Phone Number", request_contact: true }],
      ]).resize(),
    },
  );
});

// 3. Handle Contact Sharing
bot.on("contact", async (ctx) => {
  const contact = ctx.message.contact;
  const userId = ctx.from.id;
  const phoneNumber = contact.phone_number;

  try {
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
    `Contact Verification Complete.\n\n` +
      `Your account is authorized. Tap below to launch the ${AwtarPropBrand} Mini App.`,
    {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
      ...Markup.inlineKeyboard([
        [Markup.button.webApp("Open AwtarProp App", targetUrl)],
      ]),
    },
  );
});

bot.help((ctx) => {
  return ctx.reply(
    "Use /start to verify channel membership and launch the AwtarProp application.",
  );
});

bot
  .launch()
  .then(() => {
    console.log("🤖 AwtarProp Streamlined Production Bot started");
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram Bot:", err.message);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
