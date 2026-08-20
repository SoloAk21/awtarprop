import crypto from 'crypto';
import { env } from '../config/env.js';
import { TelegramUser } from '@awtarprop/shared';

export interface ValidatedTelegramAuth {
  user: TelegramUser;
  authDate: number;
  hash: string;
}

export function verifyTelegramInitData(
  initData: string,
  botToken: string
): ValidatedTelegramAuth | null {
  if (!initData || !botToken) return null;

  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');

    if (!hash) return null;

    urlParams.delete('hash');

    const dataCheckArr: string[] = [];

    Array.from(urlParams.keys())
      .sort()
      .forEach((key) => {
        const value = urlParams.get(key);
        if (value !== null) {
          dataCheckArr.push(`${key}=${value}`);
        }
      });

    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (!/^[0-9a-f]{64}$/i.test(hash)) return null;

    const isHashValid = crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(hash, 'hex')
    );

    if (!isHashValid) return null;

    const userStr = urlParams.get('user');
    const authDateStr = urlParams.get('auth_date');

    if (!userStr || !authDateStr) return null;

    const user: TelegramUser = JSON.parse(userStr);
    const authDate = parseInt(authDateStr, 10);

    if (!Number.isFinite(authDate)) return null;

    return {
      user,
      authDate,
      hash,
    };
  } catch {
    return null;
  }
}
