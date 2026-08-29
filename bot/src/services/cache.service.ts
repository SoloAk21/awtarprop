import { SupportedLang } from "../i18n/messages";

export interface UserCacheState {
  isPhoneVerified: boolean;
  preferredLanguage: SupportedLang;
  cachedAt: number;
  lastBotMessageId?: number;
}

export const userCache = new Map<number, UserCacheState>();
export const userLocks = new Set<number>();
export const CACHE_TTL_MS = 3 * 60 * 1000;

export function acquireLock(userId: number): boolean {
  if (userLocks.has(userId)) return false;
  userLocks.add(userId);
  return true;
}

export function releaseLock(userId: number): void {
  userLocks.delete(userId);
}
