import { useAuthStore } from "../store/useAuthStore.js";
import { translations, type LanguageKey,  } from "../i18n/translations.js";

export function useTranslation() {
  const user = useAuthStore((state) => state.user);
  const lang = user?.preferredLanguage || "EN";

  const t = (key: LanguageKey): string => {
    return translations[lang]?.[key] || translations.EN[key] || key;
  };

  return { t, currentLanguage: lang };
}
