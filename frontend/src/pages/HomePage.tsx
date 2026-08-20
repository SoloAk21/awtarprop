import { useTranslation } from "../hooks/useTranslation.js";
import { ETHIOPIAN_REGIONS } from "@awtarprop/shared";
import { ShieldCheck, MapPin, Sparkles } from "lucide-react";

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-20 p-4">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold backdrop-blur-md">
          <Sparkles className="w-3 h-3" />
          <span>Zero Middleman Commission</span>
        </div>

        <h2 className="text-xl font-bold tracking-tight">
          Direct Property & Land Marketplace
        </h2>

        <p className="text-xs text-emerald-100 leading-relaxed">
          Buy, sell, or rent residential properties, commercial spaces, and land
          across Ethiopia directly.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <ShieldCheck className="text-emerald-500 w-4 h-4" />
          <span>Direct Provider Support</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Supports Property Owners, Brokers, Agents, Agencies, and Developers
          with verified listing fee publication.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <MapPin className="text-emerald-500 w-4 h-4" />
          <span>Supported Regions ({ETHIOPIAN_REGIONS.length})</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {ETHIOPIAN_REGIONS.slice(0, 6).map((region) => (
            <span
              key={region}
              className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
            >
              {region}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
