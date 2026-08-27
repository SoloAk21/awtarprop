import { useAuthStore } from "../store/useAuthStore.js";
import { translations, type LanguageKey } from "../i18n/translations.js";

export function useTranslation() {
  const user = useAuthStore((state) => state.user);
  const lang = user?.preferredLanguage || "EN";

  const t = (key: LanguageKey | string): string => {
    // Safely fallback to the raw key if translation doesn't exist
    return (
      translations[lang]?.[key as LanguageKey] ||
      translations.EN[key as LanguageKey] ||
      key
    );
  };

  const translateCategory = (cat: string): string => {
    if (!cat) return "";
    return t(cat) || cat.replace(/_/g, " ");
  };

  // Drastically simplified and type-safe
  const translatePurpose = (purpose: string): string => {
    if (!purpose) return "";
    return t(purpose) || purpose.replace(/_/g, " ");
  };

  const translateProviderType = (providerType: string): string => {
    if (!providerType) return "";
    return t(providerType) || providerType;
  };

  return {
    t,
    currentLanguage: lang,
    translateCategory,
    translatePurpose,
    translateProviderType,
  };
}
