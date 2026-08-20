import { useTranslation } from "../hooks/useTranslation.js";
import { Search, SlidersHorizontal } from "lucide-react";

export function ExplorePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-20 p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search location, sub-city, area..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 shadow-sm"
          />
        </div>

        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          "All",
          t("forSale"),
          t("forRent"),
          t("lookingToBuy"),
          t("lookingToRent"),
        ].map((tab, i) => (
          <button
            key={tab}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-emerald-600 text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="text-center py-12 text-slate-400 text-xs">
        Property feed search & location filtering active.
      </div>
    </div>
  );
}
