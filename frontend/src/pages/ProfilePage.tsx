import { useTranslation } from "../hooks/useTranslation.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { Shield, Globe, LogOut } from "lucide-react";

export function ProfilePage() {
  const { t, currentLanguage } = useTranslation();
  const { user, updateLanguage, logout } = useAuthStore();

  return (
    <div className="space-y-4 pb-20 p-4">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
          {user?.firstName?.charAt(0) || "U"}
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-base">
            {user
              ? `${user.firstName} ${user.lastName || ""}`
              : "AwtarProp User"}
          </h3>

          <p className="text-xs text-slate-500 font-medium">
            @{user?.username || "telegram_user"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 text-xs">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-700 font-medium">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>{t("providerType")}</span>
          </div>

          <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            {user?.providerType || "OWNER"}
          </span>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-700 font-medium">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{t("languageSwitch")}</span>
          </div>

          <button
            onClick={() =>
              updateLanguage(currentLanguage === "EN" ? "AM" : "EN")
            }
            className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg"
          >
            {currentLanguage === "EN" ? "English" : "አማርኛ"}
          </button>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-3 bg-red-50 text-red-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out</span>
      </button>
    </div>
  );
}
