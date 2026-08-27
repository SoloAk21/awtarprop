import React from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useTranslation } from "../hooks/useTranslation.js";
import { ShieldAlert, LogIn } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAuthenticated, authenticateTelegram, isLoading } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-4 pb-24 space-y-4 text-slate-800 text-center py-12">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-900 text-base">
            {t("authRequiredTitle")}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-normal">
            {t("authRequiredDesc")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => authenticateTelegram()}
          disabled={isLoading}
          className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs inline-flex items-center gap-2 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-xs"
        >
          <LogIn className="w-4 h-4" />
          <span>{isLoading ? t("authenticating") : t("authenticateBtn")}</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
