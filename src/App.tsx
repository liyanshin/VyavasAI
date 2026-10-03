/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShopState, Language, AgentStep, Theme } from './types';
import { getInitialShopState } from './data/seedData';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { StockTab } from './components/StockTab';
import { OrdersTab } from './components/OrdersTab';
import { KhataTab } from './components/KhataTab';
import { MoneyTab } from './components/MoneyTab';
import { BottomNav, TabId } from './components/BottomNav';
import { Toast } from './components/Toast';

const STORAGE_KEY_STATE = 'vyavasai_shop_state_v1';
const STORAGE_KEY_LANG = 'vyavasai_lang_v1';
const STORAGE_KEY_AUDIO = 'vyavasai_audio_muted_v1';
const STORAGE_KEY_THEME = 'vyavasai_theme_v1';

// Seed initial steps to showcase multi-step agentic behavior on first load
const INITIAL_DEMO_STEPS: AgentStep[] = [
  {
    id: 'seed-step-1',
    tool: 'check_stock',
    toolTitle: 'Check Stock',
    args: { item: 'sugar' },
    result: { itemId: 'item-sugar', name: 'Sugar', qty: 40, unit: 'kg', pricePerUnit: 45 },
    summary: 'स्टॉक तपासला: Sugar शिल्लक: 40 kg (दर: ₹45/kg)',
    status: 'success',
    timestamp: '10:14 AM',
  },
  {
    id: 'seed-step-2',
    tool: 'create_order',
    toolTitle: 'Create Order',
    args: { customer: 'Ramesh', items: [{ name: 'Sugar', qty: 5, unit: 'kg' }] },
    result: { orderNumber: 'ORD-1023', total: 225, customer: 'Ramesh' },
    summary: 'ऑर्डर #ORD-1023 तयार: Ramesh एकूण: ₹225',
    status: 'success',
    timestamp: '10:14 AM',
  },
  {
    id: 'seed-step-3',
    tool: 'update_stock',
    toolTitle: 'Update Stock',
    args: { item: 'Sugar', delta: -5, reason: 'Order for Ramesh' },
    result: { item: 'Sugar', prevQty: 40, newQty: 35, unit: 'kg', delta: -5 },
    summary: 'स्टॉक अपडेट: Sugar 40 kg → 35 kg (-5)',
    status: 'success',
    timestamp: '10:14 AM',
  },
  {
    id: 'seed-step-4',
    tool: 'add_to_customer_ledger',
    toolTitle: 'Customer Ledger (Khata)',
    args: { customer: 'Ramesh', amount: 225, type: 'credit' },
    result: { customer: 'Ramesh', prevBalance: 225, amount: 225, newBalance: 450, type: 'credit' },
    summary: 'खात्यात नोंद: Ramesh उधारी +₹225 (एकूण बाकी: ₹450)',
    status: 'success',
    timestamp: '10:14 AM',
  },
];

export default function App() {
  const [shopState, setShopState] = useState<ShopState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load shop state from localStorage');
    }
    return getInitialShopState();
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as Language;
      if (savedLang && ['mr', 'ta', 'hi', 'en'].includes(savedLang)) {
        return savedLang;
      }
    } catch (e) {}
    return 'mr'; // Primary language is Marathi
  });

  // Theme state: defaults to 'dark' (black theme) with toggle option
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme;
      if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
        return savedTheme;
      }
    } catch (e) {}
    return 'dark'; // Black theme by default
  });

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIO);
      if (saved !== null) return saved === 'true';
    } catch (e) {}
    return false;
  });

  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [latestSteps, setLatestSteps] = useState<AgentStep[]>(INITIAL_DEMO_STEPS);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(shopState));
    } catch (e) {
      console.warn('Failed to save shop state to localStorage');
    }
  }, [shopState]);

  // Sync language selection
  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch (e) {}
  };

  // Toggle theme between dark (black theme) and light
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
      } catch (e) {}
      return nextTheme;
    });
  };

  // Toggle audio mute
  const handleToggleAudioMute = () => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_AUDIO, String(next));
      } catch (e) {}
      return next;
    });
  };

  // Reset to initial demo data
  const handleResetData = () => {
    const freshState = getInitialShopState();
    setShopState(freshState);
    setLatestSteps(INITIAL_DEMO_STEPS);
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(freshState));
    } catch (e) {}
    setToastMessage('डेमो डेटा पूर्ववत रीसेट झाला!');
  };

  const lowStockCount = shopState.inventory.filter((i) => i.qty <= i.lowStockThreshold).length;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans select-none antialiased transition-colors duration-300 ${
        theme === 'dark' ? 'bg-black text-stone-100' : 'bg-stone-100 text-stone-900'
      }`}
    >
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* App Header with Language Switcher, Theme Switcher and Audio Controls */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        isAudioMuted={isAudioMuted}
        onToggleAudioMute={handleToggleAudioMute}
        onResetData={handleResetData}
        activeOrderCount={shopState.orders.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 w-full max-w-md mx-auto overflow-y-auto">
        {activeTab === 'home' && (
          <HomeTab
            currentLanguage={currentLanguage}
            shopState={shopState}
            onUpdateShopState={setShopState}
            isAudioMuted={isAudioMuted}
            onShowToast={setToastMessage}
            latestSteps={latestSteps}
            setLatestSteps={setLatestSteps}
            theme={theme}
          />
        )}

        {activeTab === 'stock' && (
          <StockTab
            currentLanguage={currentLanguage}
            shopState={shopState}
            onUpdateShopState={setShopState}
            onShowToast={setToastMessage}
            theme={theme}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            currentLanguage={currentLanguage}
            shopState={shopState}
            theme={theme}
          />
        )}

        {activeTab === 'khata' && (
          <KhataTab
            currentLanguage={currentLanguage}
            shopState={shopState}
            onUpdateShopState={setShopState}
            onShowToast={setToastMessage}
            theme={theme}
          />
        )}

        {activeTab === 'money' && (
          <MoneyTab
            currentLanguage={currentLanguage}
            shopState={shopState}
            onUpdateShopState={setShopState}
            onShowToast={setToastMessage}
            theme={theme}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentLanguage={currentLanguage}
        lowStockCount={lowStockCount}
        orderCount={shopState.orders.length}
        theme={theme}
      />
    </div>
  );
}
