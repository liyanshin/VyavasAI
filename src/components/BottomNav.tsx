import React from 'react';
import { Mic, Package, ShoppingBag, BookOpen, IndianRupee } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';

export type TabId = 'home' | 'stock' | 'orders' | 'khata' | 'money';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  currentLanguage: Language;
  lowStockCount: number;
  orderCount: number;
  theme?: Theme;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  currentLanguage,
  lowStockCount,
  orderCount,
  theme = 'dark',
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isDark = theme === 'dark';

  const tabs: { id: TabId; label: string; icon: any; badge?: number }[] = [
    { id: 'home', label: t.tabs.home, icon: Mic },
    { id: 'stock', label: t.tabs.stock, icon: Package, badge: lowStockCount },
    { id: 'orders', label: t.tabs.orders, icon: ShoppingBag, badge: orderCount },
    { id: 'khata', label: t.tabs.khata, icon: BookOpen },
    { id: 'money', label: t.tabs.money, icon: IndianRupee },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t shadow-2xl transition-colors ${
      isDark ? 'bg-black border-stone-800/90' : 'bg-stone-900 border-stone-800'
    }`}>
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-extrabold scale-105'
                  : 'text-stone-400 font-medium hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition ${
                    isActive ? 'bg-amber-500/20 text-amber-400' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Badge Indicator */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight font-bold">
                {tab.label}
              </span>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
