import { Markup } from "telegraf";
import { EMOJI_IDS } from "../config/emojis";
import { MESSAGES, SupportedLang } from "../i18n/messages";
import { config } from "../config/env";

export const getLanguageKeyboard = (lang: SupportedLang = "EN") =>
  Markup.inlineKeyboard([
    [
      {
        text: MESSAGES[lang].btnLangEn,
        callback_data: "set_lang_EN",
        icon_custom_emoji_id: EMOJI_IDS.UK_FLAG,
        style: "primary",
      } as any,
      {
        text: MESSAGES[lang].btnLangAm,
        callback_data: "set_lang_AM",
        icon_custom_emoji_id: EMOJI_IDS.ET_FLAG,
        style: "success",
      } as any,
    ],
  ]);

export const getChannelJoinKeyboard = (lang: SupportedLang = "EN") =>
  Markup.inlineKeyboard([
    [
      {
        text: MESSAGES[lang].btnJoinChannel,
        url: `https://t.me/${config.channelUsername.replace(/^@/, "")}`,
        icon_custom_emoji_id: EMOJI_IDS.CHANNEL,
        style: "primary",
      } as any,
    ],
    [
      {
        text: MESSAGES[lang].btnIHaveJoined,
        callback_data: "verify_channel",
        icon_custom_emoji_id: EMOJI_IDS.CHECK,
        style: "success",
      } as any,
    ],
  ]);

export const getOpenAppKeyboard = (url: string, lang: SupportedLang = "EN") =>
  Markup.inlineKeyboard([
    [
      {
        text: MESSAGES[lang].btnOpenApp,
        web_app: { url },
        icon_custom_emoji_id: EMOJI_IDS.PACKAGE,
        style: "success",
      } as any,
    ],
    [
      {
        text: MESSAGES[lang].btnChangeLang,
        callback_data: "open_lang_menu",
        icon_custom_emoji_id: EMOJI_IDS.GLOBE,
      } as any,
    ],
  ]);

export const getShareContactKeyboard = (lang: SupportedLang = "EN") =>
  Markup.keyboard([
    [
      {
        text: MESSAGES[lang].btnShareContact,
        request_contact: true,
        icon_custom_emoji_id: EMOJI_IDS.PHONE,
        style: "primary",
      } as any,
    ],
  ]).resize();
