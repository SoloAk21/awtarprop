export type UserRole = "USER" | "ADMIN" | "MODERATOR";

export type ProviderType =
  | "OWNER"
  | "BROKER"
  | "AGENT"
  | "AGENCY"
  | "DEVELOPER";

export type PreferredLanguage = "EN" | "AM";

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface UserProfile {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  isPhoneVerified: Boolean;
  role: UserRole;
  providerType: ProviderType;
  preferredLanguage: PreferredLanguage;
  createdAt: string;
  updatedAt: string;
}
