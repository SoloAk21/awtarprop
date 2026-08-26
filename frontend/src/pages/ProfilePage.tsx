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

const PROVIDER_ROLES: Array<{ id: ProviderType; label: string }> = [
  { id: "OWNER", label: "Property Owner" },
  { id: "BROKER", label: "Broker / Delala" },
  { id: "AGENT", label: "Real Estate Agent" },
  { id: "AGENCY", label: "Agency" },
  { id: "DEVELOPER", label: "Developer" },
];

export function ProfilePage() {
  const { t, currentLanguage } = useTranslation();
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

  // Compute portfolio view metrics
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

  return (
    <div className="w-full max-w-md mx-auto p-3.5 pb-24 space-y-4 text-slate-800 relative">
      {/* 1. USER IDENTITY HEADER */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-xs shrink-0">
            {user?.firstName?.charAt(0) || "U"}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-slate-900 text-sm truncate">
                {user
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "AwtarProp User"}
              </h3>
              {user?.isPhoneVerified && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-bold truncate">
              @{user?.username || "telegram_user"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRoleModal(true)}
          className="text-[10px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/80 shrink-0 hover:bg-emerald-100 transition-colors"
        >
          {user?.providerType || "OWNER"}
        </button>
      </div>

      {/* 2. PORTFOLIO METRICS SUMMARY BAR */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Building2 className="w-4 h-4 text-emerald-600 mx-auto mb-1 stroke-[2]" />
          <span className="block font-black text-slate-900 text-sm">
            {totalListings}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Listings</span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Eye className="w-4 h-4 text-emerald-600 mx-auto mb-1 stroke-[2]" />
          <span className="block font-black text-slate-900 text-sm">
            {totalViews}
          </span>
          <span className="text-[10px] font-bold text-slate-400">
            Total Views
          </span>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Bookmark className="w-4 h-4 text-emerald-600 mx-auto mb-1 stroke-[2]" />
          <span className="block font-black text-slate-900 text-sm">
            {totalSaved}
          </span>
          <span className="text-[10px] font-bold text-slate-400">Saved</span>
        </div>
      </div>

      {/* 3. SETTINGS & PREFERENCES GROUP */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs font-semibold">
        {/* Provider Role */}
        <div
          onClick={() => setShowRoleModal(true)}
          className="flex items-center justify-between py-1 cursor-pointer hover:bg-slate-50/80 p-1.5 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Listing Provider Role</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-900 font-extrabold">
              {user?.providerType || "OWNER"}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Language Switch */}
        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between px-1.5">
          <div className="flex items-center gap-2 text-slate-700">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>{t("languageSwitch")}</span>
          </div>
          <button
            type="button"
            onClick={() =>
              updateLanguage(currentLanguage === "EN" ? "AM" : "EN")
            }
            className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            {currentLanguage === "EN" ? "English" : "አማርኛ"}
          </button>
        </div>

        {/* Contact Phone */}
        {user?.phoneNumber && (
          <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between px-1.5">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Verified Contact Phone</span>
            </div>
            <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
              {user.phoneNumber}
            </span>
          </div>
        )}
      </div>

      {/* 4. OFFICIAL COMMUNITY & SUPPORT SHORTCUTS */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs font-bold">
        <a
          href={`https://t.me/${channelUsername.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Official Telegram Channel</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>

        <a
          href={`https://t.me/${channelUsername.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-100"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Support & Assistance</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>
      </div>

      {/* 5. PORTFOLIO MANAGEMENT SECTION */}
      <MyListingsSection />

      {/* 6. LOG OUT CTA */}
      <button
        type="button"
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full h-10 bg-red-50 text-red-600 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-red-100/80 active:bg-red-100 transition-colors border border-red-100"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Log Out Session</span>
      </button>

      {/* PROVIDER ROLE SELECTION MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Select Listing Provider Role
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1 bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {PROVIDER_ROLES.map((role) => {
                const isSelected = (user?.providerType || "OWNER") === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full p-3 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{role.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
