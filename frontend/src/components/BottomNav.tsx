import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Heart, PlusCircle, User } from "lucide-react";
import { useTranslation } from "../hooks/useTranslation.js";
import { useFavoritesStore } from "../store/useFavoritesStore.js";

export function BottomNav() {
  const { t } = useTranslation();
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const favoritesCount = favoriteIds.length;

  const navItems = [
    { to: "/", icon: Home, label: t("navHome"), badge: 0 },
    {
      to: "/favorites",
      icon: Heart,
      label: t("navFavorites"),
      badge: favoritesCount,
    },
    { to: "/post", icon: PlusCircle, label: t("navPost"), badge: 0 },
    { to: "/profile", icon: User, label: t("navProfile"), badge: 0 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 rounded-xl relative transition-colors ${
                  isActive
                    ? "text-emerald-600 bg-emerald-50"
                    : "text-slate-500 hover:text-slate-900"
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.25 bg-red-500 text-white rounded-full text-[9px] font-black border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
