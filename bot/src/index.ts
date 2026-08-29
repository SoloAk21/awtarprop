import { Telegraf, Markup, Context } from "telegraf";
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import path from "path";
import http from "http";

// ---------------------------------------------------------------------------
// Environment Configuration
// ---------------------------------------------------------------------------
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.TELEGRAM_WEBAPP_URL ?? "http://localhost:5173";
const apiUrl = process.env.VITE_API_URL ?? "http://localhost:5000/api/v1";
const channelUsername = (process.env.TELEGRAM_CHANNEL_USERNAME ?? "").trim();
const PORT = process.env.PORT || 3000;

if (!token || token.includes("your_telegram_bot_token")) {
  console.warn(
    "⚠️ TELEGRAM_BOT_TOKEN is missing or still a placeholder. Bot will not start.",
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Dynamic Custom Emoji Helper & Document IDs (Bot API 9.4+)
// ---------------------------------------------------------------------------
export const EMOJI_IDS = {
  UK_FLAG: "5202196682497859879",
  ET_FLAG: "5269306474210802594",
  CHECK: "5456432998092133477",
  PHONE: "5247206694219427281",
  PACKAGE: "5884479287171485878",
  SHIELD: "6269105110450705259",
  PIN: "6269321542442685793",
  WARNING: "6269176896534091959",
  SPARKLES: "6271791595314483981",
  STAR: "6136554250668347247",
  CHANNEL: "6269303009658802514",
  TELEGRAM: "5039783602301175152",
  WAVE: "5418298958428527841",
  GLOBE: "5447421246172069841",
} as const;

export function tgEmoji(emojiId: string, fallbackEmoji: string): string {
  return `<tg-emoji emoji-id="${emojiId}">${fallbackEmoji}</tg-emoji>`;
}

export const PREMIUM_BODY_EMOJIS = {
  UK_FLAG: tgEmoji(EMOJI_IDS.UK_FLAG, "🇬🇧"),
  ET_FLAG: tgEmoji(EMOJI_IDS.ET_FLAG, "🇪🇹"),
  CHECK: tgEmoji(EMOJI_IDS.CHECK, "✅"),
  WAVE: tgEmoji(EMOJI_IDS.WAVE, "👋"),
  PHONE: tgEmoji(EMOJI_IDS.PHONE, "📞"),
  SHIELD: tgEmoji(EMOJI_IDS.SHIELD, "🛡️"),
  PIN: tgEmoji(EMOJI_IDS.PIN, "📌"),
  WARNING: tgEmoji(EMOJI_IDS.WARNING, "⚠️"),
  SPARKLES: tgEmoji(EMOJI_IDS.SPARKLES, "✨"),
  STAR: tgEmoji(EMOJI_IDS.STAR, "⭐"),
  CHANNEL: tgEmoji(EMOJI_IDS.CHANNEL, "📣"),
  TELEGRAM: tgEmoji(EMOJI_IDS.TELEGRAM, "✈️"),
  GLOBE: tgEmoji(EMOJI_IDS.GLOBE, "🌐"),
} as const;

export const AwtarPropBrandName = "<b>AwtarProp</b>";

interface BotContext extends Context {
  startPayload?: string;
}

function buildWebAppUrl(payload?: string): string {
  return payload ? `${webAppUrl}?startapp=${payload}` : webAppUrl;
}

function normalizePhone(phone: string): string {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

async function verifyChannelSubscription(
  ctx: BotContext,
  userId: number,
): Promise<boolean> {
  if (!channelUsername) return true;

  try {
    const member = await ctx.telegram.getChatMember(channelUsername, userId);
    return ["creator", "administrator", "member", "restricted"].includes(
      member.status,
    );
  } catch (error) {
    return true;
  }
}

async function checkUserDbStatus(telegramId: number) {
  try {
    const { data } = await axios.get(`${apiUrl}/auth/status/${telegramId}`, {
      timeout: 10_000,
    });
    return {
      isPhoneVerified: data?.data?.isPhoneVerified === true,
      preferredLanguage: (data?.data?.preferredLanguage || "EN") as "EN" | "AM",
    };
  } catch {
    return { isPhoneVerified: false, preferredLanguage: "EN" as const };
  }
}

async function registerPhone(
  telegramId: number,
  phoneNumber: string,
): Promise<void> {
  try {
    await axios.post(
      `${apiUrl}/auth/phone`,
      {
        telegramId: telegramId.toString(),
        phoneNumber: normalizePhone(phoneNumber),
      },
      { timeout: 10_000 },
    );
  } catch (error) {
    const msg =
      error instanceof AxiosError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(`Failed to register phone for ${telegramId}:`, msg);
  }
}

async function registerLanguage(
  telegramId: number,
  language: "EN" | "AM",
): Promise<void> {
  try {
    await axios.post(
      `${apiUrl}/auth/language`,
      {
        telegramId: telegramId.toString(),
        preferredLanguage: language,
      },
      { timeout: 10_000 },
    );
  } catch (error) {
    const msg =
      error instanceof AxiosError
        ? error.message
        : error instanceof Error
          ? error.message
          : String(error);
    console.error(`Failed to register language for ${telegramId}:`, msg);
  }
}

// ---------------------------------------------------------------------------
// Custom Emoji Keyboards
// ---------------------------------------------------------------------------
const languageKeyboard = Markup.inlineKeyboard([
  [
    {
      text: "English",
      callback_data: "set_lang_EN",
      icon_custom_emoji_id: EMOJI_IDS.UK_FLAG,
      style: "primary",
    } as any,
    {
      text: "አማርኛ",
      callback_data: "set_lang_AM",
      icon_custom_emoji_id: EMOJI_IDS.ET_FLAG,
      style: "success",
    } as any,
  ],
]);

const channelJoinKeyboard = Markup.inlineKeyboard([
  [
    {
      text: "Join Channel",
      url: `https://t.me/${channelUsername.replace(/^@/, "")}`,
      icon_custom_emoji_id: EMOJI_IDS.CHANNEL,
      style: "primary",
    } as any,
  ],
  [
    {
      text: "I Have Joined",
      callback_data: "verify_channel",
      icon_custom_emoji_id: EMOJI_IDS.CHECK,
      style: "success",
    } as any,
  ],
]);

const openAppKeyboard = (url: string, lang: "EN" | "AM" = "EN") =>
  Markup.inlineKeyboard([
    [
      {
        text:
          lang === "AM" ? "አውታርፕሮፕ ገበያን ክፈት" : "Open AwtarProp Marketplace App",
        web_app: { url },
        icon_custom_emoji_id: EMOJI_IDS.PACKAGE,
        style: "success",
      } as any,
    ],
  ]);

const shareContactKeyboard = (lang: "EN" | "AM" = "EN") =>
  Markup.keyboard([
    [
      {
        text: lang === "AM" ? "ስልክ ቁጥሬን አጋራ" : "Share Contact Phone Number",
        request_contact: true,
        icon_custom_emoji_id: EMOJI_IDS.PHONE,
        style: "primary",
      } as any,
    ],
  ]).resize();

// ---------------------------------------------------------------------------
// Bot Instance & Event Handlers
// ---------------------------------------------------------------------------
const bot = new Telegraf<BotContext>(token, { handlerTimeout: 15_000 });

bot.catch(async (err, ctx) => {
  console.error(`Telegraf error on ${ctx.updateType}:`, err);
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery(
        "An unexpected error occurred. Please try again.",
        { show_alert: true },
      );
    } else {
      await ctx.reply(
        `${PREMIUM_BODY_EMOJIS.WARNING} <b>Temporary Service Interruption</b>`,
        { parse_mode: "HTML" },
      );
    }
  } catch {}
});

// 1. /start command
bot.start(async (ctx) => {
  const userId = ctx.from!.id;
  const firstName = ctx.from!.first_name || "User";
  const payload = ctx.startPayload;
  const targetUrl = buildWebAppUrl(payload);

  // Check Channel Membership
  const isSubscribed = await verifyChannelSubscription(ctx, userId);

  if (!isSubscribed) {
    return ctx.reply(
      `${PREMIUM_BODY_EMOJIS.PIN} <b>Official Channel Join Required</b>\n\n` +
        `Welcome ${firstName}! To unlock the ${AwtarPropBrandName} direct property marketplace, you must join our official ${PREMIUM_BODY_EMOJIS.TELEGRAM} Telegram ${PREMIUM_BODY_EMOJIS.CHANNEL} channel first.`,
      {
        parse_mode: "HTML",
        ...channelJoinKeyboard,
      },
    );
  }

  // Query Database Status
  const userStatus = await checkUserDbStatus(userId);

  if (userStatus.isPhoneVerified) {
    const welcomeMsg =
      userStatus.preferredLanguage === "AM"
        ? `${PREMIUM_BODY_EMOJIS.WAVE} <b>እንኳን ወደ ${AwtarPropBrandName} በደህና መጡ ${firstName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\nመለያዎ የተረጋገጠ ነው። ገበያውን ለመክፈት ከታች ያለውን ይጫኑ።`
        : `${PREMIUM_BODY_EMOJIS.WAVE} <b>Welcome back ${firstName} to ${AwtarPropBrandName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\nYour account is authorized. Tap below to launch the marketplace app.`;

    return ctx.reply(welcomeMsg, {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
      ...openAppKeyboard(targetUrl, userStatus.preferredLanguage),
    });
  }

  return ctx.reply(
    `${PREMIUM_BODY_EMOJIS.GLOBE} <b>Select Preferred Language / ቋንቋ ይምረጡ</b>\n\n` +
      `Welcome ${firstName}! Please choose your language to continue:`,
    {
      parse_mode: "HTML",
      ...languageKeyboard,
    },
  );
});

// 2. Language Selection Action Callbacks
bot.action(/set_lang_(EN|AM)/, async (ctx) => {
  const userId = ctx.from!.id;
  const firstName = ctx.from!.first_name || "User";
  const selectedLang = ctx.match[1] as "EN" | "AM";

  await registerLanguage(userId, selectedLang);
  await ctx.answerCbQuery(
    selectedLang === "AM" ? "ቋንቋ ተመርጧል!" : "Language preference saved!",
  );

  try {
    await ctx.deleteMessage();
  } catch {}

  const userStatus = await checkUserDbStatus(userId);
  const targetUrl = buildWebAppUrl();

  if (userStatus.isPhoneVerified) {
    const welcomeMsg =
      selectedLang === "AM"
        ? `${PREMIUM_BODY_EMOJIS.WAVE} <b>እንኳን ወደ ${AwtarPropBrandName} በደህና መጡ ${firstName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\nመለያዎ የተረጋገጠ ነው። ገበያውን ለመክፈት ከታች ያለውን ይጫኑ።`
        : `${PREMIUM_BODY_EMOJIS.WAVE} <b>Welcome ${firstName} to ${AwtarPropBrandName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\nYour account is authorized. Tap below to launch the marketplace app.`;

    return ctx.reply(welcomeMsg, {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
      ...openAppKeyboard(targetUrl, selectedLang),
    });
  }

  const requestMsg =
    selectedLang === "AM"
      ? `${PREMIUM_BODY_EMOJIS.WAVE} <b>እንኳን ወደ ${AwtarPropBrandName} በደህና መጡ ${firstName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\n${PREMIUM_BODY_EMOJIS.PHONE} እባክዎን ማረጋገጫውን ለማጠናቀቅ የስልክ ቁጥርዎን ያጋሩ።`
      : `${PREMIUM_BODY_EMOJIS.WAVE} <b>Welcome ${firstName} to ${AwtarPropBrandName}!</b> ${PREMIUM_BODY_EMOJIS.SPARKLES}\n\n${PREMIUM_BODY_EMOJIS.PHONE} Please share your contact phone number below to complete verification.`;

  return ctx.reply(requestMsg, {
    parse_mode: "HTML",
    ...shareContactKeyboard(selectedLang),
  });
});

// 3. Channel Verification Callback Query
bot.action("verify_channel", async (ctx) => {
  const userId = ctx.from!.id;
  const firstName = ctx.from!.first_name || "User";

  const isSubscribed = await verifyChannelSubscription(ctx, userId);

  if (!isSubscribed) {
    return ctx.answerCbQuery(
      "Subscription Check Failed: You have not joined the channel yet!",
      {
        show_alert: true,
      },
    );
  }

  await ctx.answerCbQuery("Channel subscription verified!");

  try {
    await ctx.deleteMessage();
  } catch {}

  const userStatus = await checkUserDbStatus(userId);
  const targetUrl = buildWebAppUrl();

  if (userStatus.isPhoneVerified) {
    return ctx.reply(
      `${PREMIUM_BODY_EMOJIS.CHECK} <b>Channel Subscription Verified!</b>\n\nWelcome ${firstName}! Tap below to launch the ${AwtarPropBrandName} Mini App.`,
      {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
        ...openAppKeyboard(targetUrl, userStatus.preferredLanguage),
      },
    );
  }

  return ctx.reply(
    `${PREMIUM_BODY_EMOJIS.GLOBE} <b>Select Preferred Language / ቋንቋ ይምረጡ</b>\n\nWelcome ${firstName}! Please choose your language to continue:`,
    {
      parse_mode: "HTML",
      ...languageKeyboard,
    },
  );
});

// 4. Contact Sharing Event
bot.on("contact", async (ctx) => {
  const contact = ctx.message.contact;
  const userId = ctx.from!.id;

  if (contact.user_id && contact.user_id !== userId) {
    return ctx.reply(
      `${PREMIUM_BODY_EMOJIS.WARNING} Please share <b>your own</b> contact.`,
      { parse_mode: "HTML" },
    );
  }

  await registerPhone(userId, contact.phone_number);
  const userStatus = await checkUserDbStatus(userId);
  const targetUrl = buildWebAppUrl();

  const successMsg =
    userStatus.preferredLanguage === "AM"
      ? `${PREMIUM_BODY_EMOJIS.SHIELD} <b>የስልክ ቁጥር ማረጋገጫ ተጠናቋል!</b> ${PREMIUM_BODY_EMOJIS.STAR}\n\nየስልክ ቁጥርዎ በደህና ተመዝግቧል። አውታርፕሮፕ ገበያን ለመክፈት ከታች ያለውን ይጫኑ።`
      : `${PREMIUM_BODY_EMOJIS.SHIELD} <b>Contact Verification Complete!</b> ${PREMIUM_BODY_EMOJIS.STAR}\n\nYour contact phone number is securely registered. Tap below to launch the ${AwtarPropBrandName} Mini App.`;

  return ctx.reply(successMsg, {
    parse_mode: "HTML",
    ...Markup.removeKeyboard(),
    ...openAppKeyboard(targetUrl, userStatus.preferredLanguage),
  });
});

// 5. Help Command
bot.help((ctx) =>
  ctx.reply(
    "Use /start to verify channel membership and launch the AwtarProp application.",
  ),
);

// ---------------------------------------------------------------------------
// Render HTTP Health Check Server
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("AwtarProp Telegram Bot status: OK");
});

server.listen(PORT, () => {
  console.log(`🌐 Health check HTTP server listening on port ${PORT}`);
});

// ---------------------------------------------------------------------------
// Bot Launch & Automatic Chat Menu Button Synchronization
// ---------------------------------------------------------------------------
const launchBotWithRetry = async (retryCount = 0) => {
  try {
    await bot.launch();
    console.log(
      "🤖 AwtarProp Bot running with automatic Chat Menu Button synchronization",
    );

    // Automatically sync Telegram Chat Menu Button on startup
    try {
      await bot.telegram.setChatMenuButton({
        menuButton: {
          type: "web_app",
          text: "Open AwtarProp",
          web_app: { url: webAppUrl },
        },
      });
      console.log(
        `✅ Telegram Chat Menu Button synced to active URL: ${webAppUrl}`,
      );
    } catch (menuErr: any) {
      console.warn("⚠️ Chat Menu Button sync warning:", menuErr.message);
    }
  } catch (err: any) {
    console.error(
      `Network error launching Bot (Attempt ${retryCount + 1}):`,
      err.message,
    );
    if (retryCount < 10) {
      setTimeout(() => launchBotWithRetry(retryCount + 1), 5000);
    } else {
      process.exit(1);
    }
  }
};

launchBotWithRetry();

const stop = (signal: string) => {
  console.log(`Received ${signal}. Stopping bot…`);
  server.close();
  bot.stop(signal);
};

process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
