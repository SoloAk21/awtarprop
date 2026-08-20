import { z } from 'zod';

export const telegramAuthSchema = z.object({
  body: z.object({
    initData: z.string().min(1, 'Telegram initData string is required'),
    providerType: z
      .enum(['OWNER', 'BROKER', 'AGENT', 'AGENCY', 'DEVELOPER'])
      .optional(),
    preferredLanguage: z.enum(['EN', 'AM']).optional(),
  }),
});

export type TelegramAuthInput = z.infer<typeof telegramAuthSchema>['body'];
