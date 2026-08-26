import { useAuthStore } from "../store/useAuthStore.js";
import { translations, type LanguageKey } from "../i18n/translations.js";

export function useTranslation() {
  const user = useAuthStore((state) => state.user);
  const lang = user?.preferredLanguage || "EN";

  const t = (key: LanguageKey): string => {
    return translations[lang]?.[key] || translations.EN[key] || key;
  };

  const translateCategory = (cat: string): string => {
    if (!cat) return "";
    return t(cat as LanguageKey) || cat.replace(/_/g, " ");
  };

  const translatePurpose = (purpose: string): string => {
    switch (purpose) {
      case "FOR_SALE":
        return t("forSale");
      case "FOR_RENT":
        return t("forRent");
      case "LOOKING_TO_BUY":
        return t("lookingToBuy");
      default:
        return t("lookingToRent");
    }
  };

  const translateProviderType = (providerType: string): string => {
    return t(providerType as LanguageKey) || providerType;
  };

  return {
    t,
    currentLanguage: lang,
    translateCategory,
    translatePurpose,
    translateProviderType,
  };
}
