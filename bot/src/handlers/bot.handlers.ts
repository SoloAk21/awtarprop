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
import {
  buildWebAppUrl,
  safeDeleteMessage,
  safeDeletePreviousBotMessage,
  sendCleanMessage,
} from "../utils/helpers";
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
      const isSubscribed = await verifyChannelSubscription(ctx, userId);
      const userStatus = await checkUserDbStatus(userId);
      const lang = userStatus.preferredLanguage;

      if (!isSubscribed) {
        return await sendCleanMessage(
          ctx,
          userId,
          MESSAGES[lang].channelRequired(firstName),
          {
            parse_mode: "HTML",
            ...getChannelJoinKeyboard(lang),
          },
        );
      }

      if (userStatus.isPhoneVerified) {
        return await sendCleanMessage(
          ctx,
          userId,
          MESSAGES[lang].welcomeVerified(firstName),
          {
            parse_mode: "HTML",
            ...Markup.removeKeyboard(),
            ...getOpenAppKeyboard(targetUrl, lang),
          },
        );
      }

      return await sendCleanMessage(
        ctx,
        userId,
        MESSAGES[lang].welcomeNew(firstName),
        {
          parse_mode: "HTML",
          ...getLanguageKeyboard(lang),
        },
      );
    } finally {
      releaseLock(userId);
    }
  });

  // 2. Language Switch Command
  bot.command(["language", "lang"], async (ctx) => {
    const userId = ctx.from!.id;

    const isSubscribed = await verifyChannelSubscription(ctx, userId);
    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;

    if (!isSubscribed) {
      return sendCleanMessage(
        ctx,
        userId,
        MESSAGES[lang].channelRequired(ctx.from!.first_name || "User"),
        {
          parse_mode: "HTML",
          ...getChannelJoinKeyboard(lang),
        },
      );
    }

    return sendCleanMessage(ctx, userId, MESSAGES[lang].langSelectPrompt, {
      parse_mode: "HTML",
      ...getLanguageKeyboard(lang),
    });
  });

  // 3. Help Command
  bot.help(async (ctx) => {
    const userId = ctx.from!.id;

    const isSubscribed = await verifyChannelSubscription(ctx, userId);
    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;
    const targetUrl = buildWebAppUrl();

    if (!isSubscribed) {
      return sendCleanMessage(
        ctx,
        userId,
        MESSAGES[lang].channelRequired(ctx.from!.first_name || "User"),
        {
          parse_mode: "HTML",
          ...getChannelJoinKeyboard(lang),
        },
      );
    }

    return sendCleanMessage(ctx, userId, MESSAGES[lang].helpText, {
      parse_mode: "HTML",
      ...getOpenAppKeyboard(targetUrl, lang),
    });
  });

  // 4. Language Switch Action Handler
  bot.action(/set_lang_(EN|AM)/, async (ctx) => {
    const userId = ctx.from!.id;
    const firstName = ctx.from!.first_name || "User";
    const selectedLang = ctx.match[1] as SupportedLang;

    await ctx.answerCbQuery(MESSAGES[selectedLang].processing);
    await registerLanguage(userId, selectedLang);
    await safeDeleteMessage(ctx);

    const isSubscribed = await verifyChannelSubscription(ctx, userId);
    if (!isSubscribed) {
      return sendCleanMessage(
        ctx,
        userId,
        MESSAGES[selectedLang].channelRequired(firstName),
        {
          parse_mode: "HTML",
          ...getChannelJoinKeyboard(selectedLang),
        },
      );
    }

    const userStatus = await checkUserDbStatus(userId);
    const targetUrl = buildWebAppUrl();

    if (userStatus.isPhoneVerified) {
      return sendCleanMessage(
        ctx,
        userId,
        MESSAGES[selectedLang].welcomeVerified(firstName),
        {
          parse_mode: "HTML",
          ...Markup.removeKeyboard(),
          ...getOpenAppKeyboard(targetUrl, selectedLang),
        },
      );
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

    return sendCleanMessage(ctx, userId, MESSAGES[lang].langSelectPrompt, {
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
      const isSubscribed = await verifyChannelSubscription(ctx, userId);
      const userStatus = await checkUserDbStatus(userId);
      const lang = userStatus.preferredLanguage;

      if (!isSubscribed) {
        return ctx.answerCbQuery(MESSAGES[lang].channelNotJoined, {
          show_alert: true,
        });
      }

      await ctx.answerCbQuery(MESSAGES[lang].channelVerifiedSuccess);
      await safeDeleteMessage(ctx);

      const targetUrl = buildWebAppUrl();

      if (userStatus.isPhoneVerified) {
        return sendCleanMessage(
          ctx,
          userId,
          MESSAGES[lang].welcomeVerified(firstName),
          {
            parse_mode: "HTML",
            ...Markup.removeKeyboard(),
            ...getOpenAppKeyboard(targetUrl, lang),
          },
        );
      }

      return sendCleanMessage(
        ctx,
        userId,
        MESSAGES[lang].welcomeNew(firstName),
        {
          parse_mode: "HTML",
          ...getLanguageKeyboard(lang),
        },
      );
    } finally {
      releaseLock(userId);
    }
  });

  // 7. Contact Shared Event Handler
  bot.on("contact", async (ctx) => {
    const userId = ctx.from!.id;
    const firstName = ctx.from!.first_name || "User";
    const contact = ctx.message.contact;

    const isSubscribed = await verifyChannelSubscription(ctx, userId);
    const userStatus = await checkUserDbStatus(userId);
    const lang = userStatus.preferredLanguage;

    // Check channel subscription live
    if (!isSubscribed) {
      await ctx.reply(MESSAGES[lang].channelNotJoined, {
        ...Markup.removeKeyboard(),
      });
      return sendCleanMessage(
        ctx,
        userId,
        MESSAGES[lang].channelRequired(firstName),
        {
          parse_mode: "HTML",
          ...getChannelJoinKeyboard(lang),
        },
      );
    }

    // Validate contact ownership
    if (contact.user_id && contact.user_id !== userId) {
      return ctx.reply(MESSAGES[lang].invalidPhoneOwner, {
        parse_mode: "HTML",
      });
    }

    await registerPhone(userId, contact.phone_number);
    const targetUrl = buildWebAppUrl();

    // STEP 1: EXPLICITLY send Markup.removeKeyboard() to immediately close the reply contact keyboard
    await ctx.reply(MESSAGES[lang].phoneVerified, {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
    });

    // STEP 2: Send clean Open App inline launcher
    return sendCleanMessage(ctx, userId, MESSAGES[lang].launchAppPrompt, {
      parse_mode: "HTML",
      ...getOpenAppKeyboard(targetUrl, lang),
    });
  });
}
