import { useTranslation } from "../hooks/useTranslation.js";
import { PlusCircle, Info } from "lucide-react";

export function PostPropertyPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-20 p-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <PlusCircle className="text-emerald-600 w-5 h-5" />
        <h2 className="text-base font-bold text-slate-900">{t("navPost")}</h2>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold">
          <Info className="w-4 h-4 text-amber-600" />
          <span>Listing Fee Publication</span>
        </div>

        <p className="leading-relaxed text-[11px] text-amber-700">
          {t("publishNotice")}
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-slate-500 text-xs text-center py-8">
        Interactive multi-step property submission form ready for Phase 6.
      </div>
    </div>
  );
}
