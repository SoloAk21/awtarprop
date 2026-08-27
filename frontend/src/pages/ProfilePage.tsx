import React, { useState, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";
import { fetchMyListings } from "../api/properties.js";
import { MyListingsSection } from "../components/MyListingsSection.js";
import type { ProviderType } from "@awtarprop/shared";
import {
  ShieldCheck,
  Globe,
  LogOut,
  Phone,
  CheckCircle2,
  AlertTriangle,
  X,
  Building2,
  Eye,
  Bookmark,
  ChevronRight,
  Send,
  HelpCircle,
} from "lucide-react";

export function ProfilePage() {
  const { t, currentLanguage, translateProviderType } = useTranslation();
  const { user, updateLanguage, updateProviderType, logout } = useAuthStore();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);

  useEffect(() => {
    fetchMyListings()
      .then((data) => setMyListings(data || []))
      .catch(() => setMyListings([]));
  }, []);

  const totalListings = myListings.length;
  const totalViews = myListings.reduce(
    (sum, item) => sum + (item.viewsCount || 0),
    0,
  );
  const totalSaved = favoriteIds.length;

  const handleRoleSelect = (role: ProviderType) => {
    updateProviderType(role);
    setShowRoleModal(false);
  };

  const channelUsername =
    import.meta.env.VITE_TELEGRAM_CHANNEL_USERNAME || "awtarprop";

  const providerRoles: Array<{ id: ProviderType; label: string }> = [
    { id: "OWNER", label: translateProviderType("OWNER") },
    { id: "BROKER", label: translateProviderType("BROKER") },
    { id: "AGENT", label: translateProviderType("AGENT") },
    { id: "AGENCY", label: translateProviderType("AGENCY") },
    { id: "DEVELOPER", label: translateProviderType("DEVELOPER") },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4 pb-28 space-y-5 text-slate-800 relative">
      {/* 1. FLAT USER HEADER */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center font-bold text-base shrink-0 border border-slate-200/60">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-slate-900 text-sm truncate">
                {user
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "AwtarProp User"}
              </h3>
              {user?.isPhoneVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2] text-emerald-600 shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
              @{user?.username || "telegram_user"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRoleModal(true)}
          className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full hover:bg-slate-200/80 transition-colors shrink-0"
        >
          {translateProviderType(user?.providerType || "OWNER")}
        </button>
      </div>

      {/* 2. COMPACT UNBOXED METRICS BAR */}
      <div className="py-2.5 border-y border-slate-100 grid grid-cols-3 text-center text-xs">
        <div>
          <span className="block font-semibold text-slate-900 text-sm">
            {totalListings}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {t("navHome")}
          </span>
        </div>
        <div className="border-x border-slate-100">
          <span className="block font-semibold text-slate-900 text-sm">
            {totalViews}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {t("views")}
          </span>
        </div>
        <div>
          <span className="block font-semibold text-slate-900 text-sm">
            {totalSaved}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {t("saved")}
          </span>
        </div>
      </div>

      {/* 3. INSET GROUPED SETTINGS LIST */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 block mb-1">
          {t("providerRole")}
        </span>

        <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/60 overflow-hidden text-xs font-medium">
          {/* Role */}
          <div
            onClick={() => setShowRoleModal(true)}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 stroke-[2] text-emerald-600 shrink-0" />
              <span>{t("providerRole")}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span className="text-slate-900 font-semibold">
                {translateProviderType(user?.providerType || "OWNER")}
              </span>
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </div>
          </div>

          {/* Language Switch */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Globe className="w-4 h-4 stroke-[2] text-emerald-600 shrink-0" />
              <span>{t("languageSwitch")}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                updateLanguage(currentLanguage === "EN" ? "AM" : "EN")
              }
              className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              {currentLanguage === "EN" ? "English" : "አማርኛ"}
            </button>
          </div>

          {/* Verified Phone */}
          {user?.phoneNumber && (
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 stroke-[2] text-emerald-600 shrink-0" />
                <span>{t("verifiedPhone")}</span>
              </div>
              <span className="font-semibold text-slate-800">
                {user.phoneNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMMUNITY & SUPPORT GROUP */}
      <div className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 block mb-1">
          {t("supportHelp")}
        </span>

        <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/60 overflow-hidden text-xs font-medium">
          <a
            href={`https://t.me/${channelUsername.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Send className="w-4 h-4 stroke-[2] text-emerald-600 shrink-0" />
              <span>{t("officialChannel")}</span>
            </div>
            <ChevronRight className="w-4 h-4 stroke-[2] text-slate-400" />
          </a>

          <a
            href={`https://t.me/${channelUsername.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 stroke-[2] text-emerald-600 shrink-0" />
              <span>{t("supportHelp")}</span>
            </div>
            <ChevronRight className="w-4 h-4 stroke-[2] text-slate-400" />
          </a>
        </div>
      </div>

      {/* 5. PORTFOLIO SECTION */}
      <MyListingsSection />

      {/* 6. LOG OUT CTA BUTTON */}
      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full h-10 text-red-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4 stroke-[2]" />
        <span>{t("logOut")}</span>
      </button>

      {/* PROVIDER ROLE SELECTION MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">
                {t("providerRole")}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1 bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 pt-1">
              {providerRoles.map((role) => {
                const isSelected = (user?.providerType || "OWNER") === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full p-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{role.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 stroke-[2] text-emerald-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 stroke-[2] text-red-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  {t("logOutConfirmTitle")}
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
              {t("logOutConfirmText")}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl text-xs hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs"
              >
                {t("logOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
