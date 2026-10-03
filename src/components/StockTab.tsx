import React, { useState } from 'react';
import { Package, Plus, Minus, Search, AlertTriangle, PlusCircle } from 'lucide-react';
import { ShopState, Language, InventoryItem, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { executeTool } from '../utils/agentEngine';

interface StockTabProps {
  currentLanguage: Language;
  shopState: ShopState;
  onUpdateShopState: (newState: ShopState) => void;
  onShowToast: (msg: string) => void;
  theme?: Theme;
}

export const StockTab: React.FC<StockTabProps> = ({
  currentLanguage,
  shopState,
  onUpdateShopState,
  onShowToast,
  theme = 'dark',
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemPrice, setNewItemPrice] = useState('40');
  const [newItemQty, setNewItemQty] = useState('20');

  const lowStockItems = shopState.inventory.filter((i) => i.qty <= i.lowStockThreshold);

  const filteredInventory = shopState.inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.localizedNames.mr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.localizedNames.ta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.localizedNames.hi.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterLowStock) {
      return matchesSearch && item.qty <= item.lowStockThreshold;
    }
    return matchesSearch;
  });

  const handleAdjustStock = (item: InventoryItem, delta: number) => {
    const result = executeTool('update_stock', { item: item.name, delta, reason: 'Quick button adjustment' }, shopState, currentLanguage);
    onUpdateShopState(result.newState);
    onShowToast(`✅ ${item.name}: ${item.qty} → ${Math.max(0, item.qty + delta)} ${item.unit}`);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const price = parseFloat(newItemPrice) || 0;
    const qty = parseFloat(newItemQty) || 0;

    const result = executeTool(
      'add_item',
      { name: newItemName.trim(), unit: newItemUnit, price, qty },
      shopState,
      currentLanguage
    );

    onUpdateShopState(result.newState);
    onShowToast(`✅ "${newItemName}" स्टॉकमध्ये जोडले!`);
    setShowAddModal(false);
    setNewItemName('');
    setNewItemQty('20');
    setNewItemPrice('40');
  };

  return (
    <div className="flex flex-col pb-28 px-3 max-w-md mx-auto">
      {/* Header & Stats */}
      <div className="pt-3 pb-2 flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}>
            <Package className="w-5 h-5 text-amber-500" />
            {t.stock.title}
          </h2>
          <p className="text-xs text-stone-400 font-semibold">
            {shopState.inventory.length} {t.stock.itemsCount}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer ${
            isDark
              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black'
              : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          {t.stock.addItem}
        </button>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div
          onClick={() => setFilterLowStock(!filterLowStock)}
          className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
            filterLowStock
              ? isDark
                ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-500/40 text-rose-200'
                : 'bg-rose-100 border-rose-400 ring-2 ring-rose-300'
              : isDark
              ? 'bg-rose-950/40 border-rose-900/60 text-rose-300 hover:bg-rose-950/60'
              : 'bg-rose-50 border-rose-200 hover:bg-rose-100/60'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className={`text-xs font-bold ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>
                {lowStockItems.length} {t.stock.lowStockAlert}
              </div>
              <div className={`text-[10px] font-medium ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                {lowStockItems.map((i) => i.name).join(', ')}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isDark ? 'bg-rose-900/80 text-rose-300' : 'bg-rose-200 text-rose-800'
          }`}>
            {filterLowStock ? 'Clear' : 'Filter'}
          </span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.stock.searchPlaceholder}
          className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs ${
            isDark
              ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder:text-stone-500'
              : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400'
          }`}
        />
      </div>

      {/* Inventory Cards List */}
      <div className="space-y-2.5">
        {filteredInventory.map((item) => {
          const isLow = item.qty <= item.lowStockThreshold;
          const localizedDisplay =
            item.localizedNames[currentLanguage] || item.localizedNames.mr || item.name;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all shadow-2xs ${
                isDark
                  ? isLow
                    ? 'bg-stone-900/90 border-rose-900/70 text-stone-100 ring-1 ring-rose-900/30'
                    : 'bg-stone-900/90 border-stone-800 text-stone-100 hover:border-stone-700'
                  : isLow
                  ? 'border-rose-300 bg-rose-50/20 text-stone-900'
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-stone-900'}`}>
                      {localizedDisplay}
                    </h3>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                        isLow
                          ? isDark
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-rose-100 text-rose-700 border border-rose-300'
                          : isDark
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isLow ? t.stock.lowStockBadge : t.stock.inStockBadge}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-stone-400 mt-0.5">
                    {t.stock.price}: ₹{item.pricePerUnit} / {item.unit}
                  </div>
                </div>

                {/* Stock Number */}
                <div className="text-right">
                  <div
                    className={`text-base font-black ${
                      isLow ? 'text-rose-400' : isDark ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {item.qty}{' '}
                    <span className="text-xs font-bold text-stone-400">{item.unit}</span>
                  </div>
                  <div className="text-[10px] font-medium text-stone-400">
                    Min: {item.lowStockThreshold} {item.unit}
                  </div>
                </div>
              </div>

              {/* Progress bar of stock */}
              <div className={`w-full rounded-full h-1.5 mb-2.5 overflow-hidden ${
                isDark ? 'bg-stone-800' : 'bg-stone-100'
              }`}>
                <div
                  className={`h-full rounded-full transition-all ${
                    isLow ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (item.qty / (item.lowStockThreshold * 3)) * 100)}%`,
                  }}
                />
              </div>

              {/* Quick +/- Action Buttons */}
              <div className={`flex items-center justify-between pt-1 border-t ${
                isDark ? 'border-stone-800' : 'border-stone-100'
              }`}>
                <span className="text-[10px] font-bold text-stone-400 uppercase">
                  Quick Adjust:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustStock(item, -5)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                      isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    -5
                  </button>
                  <button
                    onClick={() => handleAdjustStock(item, -1)}
                    className={`p-1 rounded-lg transition active:scale-95 cursor-pointer ${
                      isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                    title="-1"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAdjustStock(item, 1)}
                    className={`p-1 rounded-lg transition active:scale-95 cursor-pointer ${
                      isDark ? 'bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                    title="+1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAdjustStock(item, 5)}
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className={`rounded-2xl max-w-sm w-full p-5 shadow-2xl border ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="text-base font-black mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-amber-500" />
              {t.stock.addItem}
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  {t.stock.itemName}
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="उदा. पोहे, शेंगदाणे, बेसन..."
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    {t.stock.unit}
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className={`w-full px-2 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="packet">packet</option>
                    <option value="piece">piece</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    {t.stock.ratePerUnit}
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className={`w-full px-2 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-400 mb-1">
                    {t.stock.initialQty}
                  </label>
                  <input
                    type="number"
                    required
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className={`w-full px-2 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t.stock.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition cursor-pointer shadow-md"
                >
                  {t.stock.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
