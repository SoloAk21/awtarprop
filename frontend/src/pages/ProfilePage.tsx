import React, { useState } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { MyListingsSection } from "../components/MyListingsSection.js";
import {
  ShieldCheck,
  Globe,
  LogOut,
  Phone,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";

export function ProfilePage() {
  const { t, currentLanguage } = useTranslation();
  const { user, updateLanguage, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto p-3.5 pb-24 space-y-4 text-slate-800 relative">
      {/* User Identity Card */}
      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-3.5">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center font-semibold text-base shadow-xs shrink-0">
          {user?.firstName?.charAt(0) || "U"}
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-800 text-sm truncate">
              {user
                ? `${user.firstName} ${user.lastName || ""}`
                : "AwtarProp User"}
            </h3>
            {user?.isPhoneVerified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-normal truncate">
            @{user?.username || "telegram_user"}
          </p>
        </div>
      </div>

      {/* Preference Settings Group */}
      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3 text-xs">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t("providerType")}</span>
          </div>
          <span className="font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70">
            {user?.providerType || "OWNER"}
          </span>
        </div>

        <div className="border-t border-slate-200/60 pt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{t("languageSwitch")}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              updateLanguage(currentLanguage === "EN" ? "AM" : "EN")
            }
            className="font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            {currentLanguage === "EN" ? "English" : "አማርኛ"}
          </button>
        </div>

        {user?.phoneNumber && (
          <div className="border-t border-slate-200/60 pt-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Contact Phone</span>
            </div>
            <span className="font-medium text-slate-800 bg-white px-2.5 py-1 rounded-xl border border-slate-200/70">
              {user.phoneNumber}
            </span>
          </div>
        )}
      </div>

      {/* Portfolio Section */}
      <MyListingsSection />

      {/* Log Out Trigger Button */}
      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full h-10 bg-red-50 text-red-600 font-medium rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-100/80 active:bg-red-100 transition-colors border border-red-100"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log Out Session</span>
      </button>

      {/* Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Log Out Session?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Are you sure you want to log out of AwtarProp? You will need to
              re-authenticate with Telegram to manage your properties.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-xs hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
