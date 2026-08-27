import { useToastStore } from "../store/useToastStore.js";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 pointer-events-none px-4 flex flex-col items-center gap-2 max-w-md mx-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-xs p-3 rounded-2xl shadow-xl border backdrop-blur-md flex items-center justify-between gap-2.5 text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
            t.type === "success"
              ? "bg-emerald-900/90 text-white border-emerald-700/50"
              : t.type === "error"
                ? "bg-red-900/90 text-white border-red-700/50"
                : "bg-slate-900/90 text-white border-slate-700/50"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {t.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : t.type === "error" ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="truncate">{t.message}</span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="p-1 hover:bg-white/10 rounded-full text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
