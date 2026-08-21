import { z } from "zod";

export const telegramAuthSchema = z.object({
  body: z.object({
    initData: z.string().min(1, "Telegram initData string is required"),
    providerType: z
      .enum(["OWNER", "BROKER", "AGENT", "AGENCY", "DEVELOPER"])
      .optional(),
    preferredLanguage: z.enum(["EN", "AM"]).optional(),
  }),
});

export const updatePhoneSchema = z.object({
  body: z.object({
    telegramId: z.string().min(1, "Telegram ID is required"),
    phoneNumber: z.string().min(8, "Valid phone number required"),
  }),
});

export const updateLanguageSchema = z.object({
  body: z.object({
    telegramId: z.string().min(1, "Telegram ID is required"),
    preferredLanguage: z.enum(["EN", "AM"]),
  }),
});

export type TelegramAuthInput = z.infer<typeof telegramAuthSchema>["body"];
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>["body"];
export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>["body"];
