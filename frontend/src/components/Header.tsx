import { Building2, Globe } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useTranslation } from '../hooks/useTranslation.js';

export function Header() {
  const { t, currentLanguage } = useTranslation();
  const updateLanguage = useAuthStore((state) => state.updateLanguage);

  const toggleLanguage = () => {
    updateLanguage(currentLanguage === 'EN' ? 'AM' : 'EN');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
            {t('appTitle')}
          </h1>
          <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-slate-500" />
        <span>{currentLanguage === 'EN' ? 'አማርኛ' : 'EN'}</span>
      </button>
    </header>
  );
}
