import { create } from "zustand";
import { apiClient } from "../api/client.js";
import type {
  PreferredLanguage,
  ProviderType,
  UserRole,
} from "@awtarprop/shared";

export interface UserState {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  role: UserRole;
  providerType: ProviderType;
  preferredLanguage: PreferredLanguage;
}

interface AuthStore {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  authenticateTelegram: (
    providerType?: ProviderType,
    language?: PreferredLanguage,
  ) => Promise<void>;
  updateLanguage: (language: PreferredLanguage) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem("awtarprop_auth_token"),
  isAuthenticated: !!localStorage.getItem("awtarprop_auth_token"),
  isLoading: false,
  error: null,

  authenticateTelegram: async (providerType = "OWNER", language = "EN") => {
    set({ isLoading: true, error: null });
    try {
      let initData = window.Telegram?.WebApp?.initData || "";

      // Local development mock fallback when opening outside Telegram
      if (!initData && import.meta.env.DEV) {
        initData =
          "user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Abebe%22%2C%22last_name%22%3A%22Bikila%22%2C%22username%22%3A%22abebe_b%22%7D&auth_date=1700000000&hash=dev_mock_hash";
      }

      if (!initData) {
        set({
          isLoading: false,
          error: "Telegram authentication data unavailable",
        });
        return;
      }

      const response = await apiClient.post("/auth/telegram", {
        initData,
        providerType,
        preferredLanguage: language,
      });

      const { token, user } = response.data.data;

      localStorage.setItem("awtarprop_auth_token", token);

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Authentication failed";
      set({ isLoading: false, error: msg, isAuthenticated: false });
    }
  },

  updateLanguage: (language: PreferredLanguage) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, preferredLanguage: language } });
    }
  },

  logout: () => {
    localStorage.removeItem("awtarprop_auth_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
