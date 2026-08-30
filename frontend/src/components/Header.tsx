import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Building2, Languages, ChevronDown, Check } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useTranslation } from "../hooks/useTranslation.js";

type LanguageCode = "EN" | "AM";

interface LanguageOption {
  value: LanguageCode;
  label: string;
}

export function Header() {
  const { t, currentLanguage } = useTranslation();
  const updateLanguage = useAuthStore((state) => state.updateLanguage);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: LanguageOption[] = useMemo(
    () => [
      { value: "EN", label: "English" },
      { value: "AM", label: "አማርኛ" },
    ],
    [],
  );

  const activeLanguageLabel = useMemo(() => {
    return (
      languages.find((lang) => lang.value === currentLanguage)?.label ||
      currentLanguage
    );
  }, [languages, currentLanguage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  const handleLanguageSelect = useCallback(
    (langValue: LanguageCode) => {
      updateLanguage(langValue);
      setIsOpen(false);
    },
    [updateLanguage],
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-100 bg-white/90 px-4 py-2.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand/Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 leading-tight">
              {t("appTitle")}
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none mt-0.5">
              {t("appSubtitle")}
            </p>
          </div>
        </div>

        {/* Dropdown Container */}
        <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label="Select Language"
            className="group flex h-8.5 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <Languages className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-emerald-600" />
            <span className="min-w-[44px] text-left font-medium">
              {activeLanguageLabel}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-emerald-600" : ""
              }`}
            />
          </button>

          {/* Action Menu overlay */}
          {isOpen && (
            <div
              role="listbox"
              aria-label="Languages"
              className="absolute right-0 z-50 mt-1 w-36 origin-top-right rounded-xl border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-1 duration-100"
            >
              {languages.map((lang) => {
                const isSelected = lang.value === currentLanguage;
                return (
                  <button
                    key={lang.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleLanguageSelect(lang.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:bg-slate-50 ${
                      isSelected
                        ? "bg-emerald-50/80 font-semibold text-emerald-900"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
