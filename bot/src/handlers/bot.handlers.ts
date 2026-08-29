import { Markup } from "telegraf";
import { bot } from "../bot";
import { MESSAGES, SupportedLang } from "../i18n/messages";
import { acquireLock, releaseLock } from "../services/cache.service";
import {
  checkUserDbStatus,
  registerLanguage,
  registerPhone,
  verifyChannelSubscription,
} from "../services/api.service";
import { buildWebAppUrl, safeDeleteMessage } from "../utils/helpers";
import {
  getChannelJoinKeyboard,
  getLanguageKeyboard,
  getOpenAppKeyboard,
  getShareContactKeyboard,
} from "../keyboards";

export function registerBotHandlers() {
  // 1. /start Handler
  bot.start(async (ctx) => {
    const userId = ctx.from!.id;
    const firstName = ctx.from!.first_name || "User";
    const payload = ctx.startPayload;
    const targetUrl = buildWebAppUrl(payload);

    if (!acquireLock(userId)) return;

    try {
      const [isSubscribed, userStatus] = await Promise.all([
        verifyChannelSubscription(ctx, userId),
        checkUserDbStatus(userId),
      ]);

      const lang = userStatus.preferredLanguage;

      if (!isSubscribed) {
        return await ctx.reply(MESSAGES[lang].channelRequired(firstName), {
          parse_mode: "HTML",
          ...getChannelJoinKeyboard(lang),
        });
      }

      if (userStatus.isPhoneVerified) {
        return await ctx.reply(MESSAGES[lang].welcomeVerified(firstName), {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
          ...getOpenAppKeyboard(targetUrl, lang),
        });
      }

      return await ctx.reply(MESSAGES[lang].welcomeNew(firstName), {
        parse_mode: "HTML",
        ...getLanguageKeyboard(lang),
      });
    } finally {
      releaseLock(userId);
    }
  });

  // 2. Language Command (/language, /lang)
  bot.command(["language", "lang"], async (ctx) => {
    const userId = ctx.from!.id;
    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;

    return ctx.reply(MESSAGES[lang].langSelectPrompt, {
      parse_mode: "HTML",
      ...getLanguageKeyboard(lang),
    });
  });

  // 3. Help Command (/help)
  bot.help(async (ctx) => {
    const userId = ctx.from!.id;
    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;
    const targetUrl = buildWebAppUrl();

    return ctx.reply(MESSAGES[lang].helpText, {
      parse_mode: "HTML",
      ...getOpenAppKeyboard(targetUrl, lang),
    });
  });

  // 4. Language Switch Callback Action
  bot.action(/set_lang_(EN|AM)/, async (ctx) => {
    const userId = ctx.from!.id;
    const firstName = ctx.from!.first_name || "User";
    const selectedLang = ctx.match[1] as SupportedLang;

    await ctx.answerCbQuery(MESSAGES[selectedLang].processing);
    await registerLanguage(userId, selectedLang);
    await safeDeleteMessage(ctx);

    const userStatus = await checkUserDbStatus(userId);
    const targetUrl = buildWebAppUrl();

    if (userStatus.isPhoneVerified) {
      return ctx.reply(MESSAGES[selectedLang].welcomeVerified(firstName), {
        parse_mode: "HTML",
        ...Markup.removeKeyboard(),
        ...getOpenAppKeyboard(targetUrl, selectedLang),
      });
    }

    return ctx.reply(MESSAGES[selectedLang].requestPhone(firstName), {
      parse_mode: "HTML",
      ...getShareContactKeyboard(selectedLang),
    });
  });

  // 5. Open Language Selection Menu Callback
  bot.action("open_lang_menu", async (ctx) => {
    const userId = ctx.from!.id;
    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;

    await ctx.answerCbQuery();
    await safeDeleteMessage(ctx);

    return ctx.reply(MESSAGES[lang].langSelectPrompt, {
      parse_mode: "HTML",
      ...getLanguageKeyboard(lang),
    });
  });

  // 6. Verify Channel Subscription Callback
  bot.action("verify_channel", async (ctx) => {
    const userId = ctx.from!.id;
    const firstName = ctx.from!.first_name || "User";

    if (!acquireLock(userId)) {
      return ctx.answerCbQuery("Processing previous action...");
    }

    try {
      const userStatus = await checkUserDbStatus(userId);
      const lang = userStatus.preferredLanguage;

      const isSubscribed = await verifyChannelSubscription(ctx, userId);

      if (!isSubscribed) {
        return ctx.answerCbQuery(MESSAGES[lang].channelNotJoined, {
          show_alert: true,
        });
      }

      await ctx.answerCbQuery(MESSAGES[lang].channelVerifiedSuccess);
      await safeDeleteMessage(ctx);

      const targetUrl = buildWebAppUrl();

      if (userStatus.isPhoneVerified) {
        return ctx.reply(MESSAGES[lang].welcomeVerified(firstName), {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
          ...getOpenAppKeyboard(targetUrl, lang),
        });
      }

      return ctx.reply(MESSAGES[lang].welcomeNew(firstName), {
        parse_mode: "HTML",
        ...getLanguageKeyboard(lang),
      });
    } finally {
      releaseLock(userId);
    }
  });

  // 7. Contact Shared Event Handler
  bot.on("contact", async (ctx) => {
    const userId = ctx.from!.id;
    const contact = ctx.message.contact;

    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;

    if (contact.user_id && contact.user_id !== userId) {
      return ctx.reply(MESSAGES[lang].invalidPhoneOwner, {
        parse_mode: "HTML",
      });
    }

    await registerPhone(userId, contact.phone_number);
    const targetUrl = buildWebAppUrl();

    return ctx.reply(MESSAGES[lang].phoneVerified, {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
      ...getOpenAppKeyboard(targetUrl, lang),
    });
  });
}
