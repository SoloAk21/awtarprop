export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export type ProviderType = 'OWNER' | 'BROKER' | 'AGENT' | 'AGENCY' | 'DEVELOPER';

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
  isPhoneVerified: boolean;
  role: UserRole;
  providerType: ProviderType;
  preferredLanguage: 'EN' | 'AM';
  createdAt: string;
  updatedAt: string;
}
