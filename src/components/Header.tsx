import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Sparkles, Store, Moon, Sun } from 'lucide-react';
import { Language, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
  onResetData: () => void;
  activeOrderCount: number;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  isAudioMuted,
  onToggleAudioMute,
  onResetData,
  theme,
  onToggleTheme,
}) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const t = TRANSLATIONS[currentLanguage];

  const languages: { code: Language; label: string; script: string }[] = [
    { code: 'mr', label: 'मराठी', script: 'मराठी' },
    { code: 'ta', label: 'தமிழ்', script: 'தமிழ்' },
    { code: 'hi', label: 'हिन्दी', script: 'हिन्दी' },
    { code: 'en', label: 'English', script: 'ENG' },
  ];

  return (
    <>
      <header className={`sticky top-0 z-30 px-4 py-2.5 shadow-md border-b transition-colors ${
        theme === 'dark'
          ? 'bg-black text-stone-100 border-stone-800'
          : 'bg-stone-900 text-stone-100 border-amber-600/40'
      }`}>
        <div className="max-w-md mx-auto flex items-center justify-between gap-2">
          {/* Logo & Shop Branding */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-sm text-stone-950 font-black">
              <Store className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                  <span>व्यवसAI</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Voice OS
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-stone-400 font-medium leading-none">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Theme Toggle, Audio toggle & Reset */}
          <div className="flex items-center gap-1.5">
            {/* Theme switcher: Black Theme vs Light Theme */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/30'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Black Theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-300" />}
            </button>

            <button
              onClick={onToggleAudioMute}
              className={`p-2 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer ${
                isAudioMuted
                  ? 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
              title={isAudioMuted ? t.common.unmuteSpeech : t.common.muteSpeech}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              title={t.common.resetDemo}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Language Switcher Bar with native scripts */}
        <div className="max-w-md mx-auto mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            भाषा:
          </span>
          <div className="flex items-center gap-1 bg-stone-800/90 p-0.5 rounded-lg">
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                  }`}
                >
                  {lang.script}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-stone-100">
            <div className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-white mb-1">
              {t.common.resetConfirmTitle}
            </h3>
            <p className="text-xs text-stone-400 text-center mb-5 leading-relaxed">
              {t.common.resetConfirmDesc}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-sm font-semibold transition"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 hover:from-amber-400 hover:to-orange-400 text-sm font-bold shadow-lg transition"
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
