import { NavLink } from 'react-router-dom';
import { Home, Search, PlusCircle, User } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.js';

export function BottomNav() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: Home, label: t('navHome') },
    { to: '/explore', icon: Search, label: t('navExplore') },
    { to: '/post', icon: PlusCircle, label: t('navPost') },
    { to: '/profile', icon: User, label: t('navProfile') },
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
                `flex flex-col items-center gap-0.5 text-xs font-medium px-3 py-1 rounded-xl transition-colors ${
                  isActive
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
