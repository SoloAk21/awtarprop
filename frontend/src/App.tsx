import { useEffect } from "react";
import { ETHIOPIAN_REGIONS } from "@awtarprop/shared";
import { Building2, MapPin, ShieldCheck } from "lucide-react";

export function App() {
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 max-w-md mx-auto">
      <header className="py-6 text-center border-b border-slate-200">
        <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-2xl tracking-tight">
          <Building2 className="w-8 h-8" />
          <span>AwtarProp</span>
        </div>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Ethiopia Direct Property & Land Marketplace
        </p>
      </header>

      <main className="my-auto space-y-6 py-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center gap-3 text-slate-800 font-semibold">
            <ShieldCheck className="text-emerald-500 w-5 h-5" />
            <span>Direct Marketplace</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Supporting Owners, Brokers, Agents, Agencies & Developers with
            direct property listings across Ethiopia.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
          <div className="flex items-center gap-3 text-slate-800 font-semibold">
            <MapPin className="text-emerald-500 w-5 h-5" />
            <span>Supported Regions ({ETHIOPIAN_REGIONS.length})</span>
          </div>
          <p className="text-xs text-slate-500">
            {ETHIOPIAN_REGIONS.slice(0, 5).join(", ")} and more...
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        AwtarProp Platform &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
