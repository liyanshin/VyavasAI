import React, { useState } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Calendar, PlusCircle, ArrowUpRight, BarChart3, ShoppingBag } from 'lucide-react';
import { ShopState, Language, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { executeTool } from '../utils/agentEngine';

interface MoneyTabProps {
  currentLanguage: Language;
  shopState: ShopState;
  onUpdateShopState: (newState: ShopState) => void;
  onShowToast: (msg: string) => void;
  theme?: Theme;
}

export const MoneyTab: React.FC<MoneyTabProps> = ({
  currentLanguage,
  shopState,
  onUpdateShopState,
  onShowToast,
  theme = 'dark',
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isDark = theme === 'dark';

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('Market / Mandi Delivery');
  const [expenseAmount, setExpenseAmount] = useState('150');
  const [expenseNote, setExpenseNote] = useState('');

  const todayRecord = shopState.dailySales[shopState.dailySales.length - 1] || {
    sales: 0,
    expenses: 0,
    orderCount: 0,
  };

  const todaySales = todayRecord.sales;
  const todayExpenses = todayRecord.expenses;
  const todayProfit = todaySales - todayExpenses;
  const todayOrders = todayRecord.orderCount;

  // Max sales for bar chart normalization
  const maxDaySales = Math.max(...shopState.dailySales.map((d) => d.sales), 1000);

  const handleRecordExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount) || 0;
    if (amount <= 0) return;

    const result = executeTool(
      'record_expense',
      {
        category: expenseCategory,
        amount,
        note: expenseNote || expenseCategory,
      },
      shopState,
      currentLanguage
    );

    onUpdateShopState(result.newState);
    onShowToast(`✅ ₹${amount} खर्च नोंदवला गेला!`);
    setShowExpenseModal(false);
    setExpenseAmount('150');
    setExpenseNote('');
  };

  return (
    <div className="flex flex-col pb-28 px-3 max-w-md mx-auto">
      {/* Header */}
      <div className="pt-3 pb-3 flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}>
            <IndianRupee className="w-5 h-5 text-amber-500" />
            {t.money.title}
          </h2>
          <p className="text-xs text-stone-400 font-semibold">दुकान कमाई व आर्थिक ताळेबंद</p>
        </div>

        <button
          onClick={() => setShowExpenseModal(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer ${
            isDark
              ? 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
              : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
          {t.money.recordExpense}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Today's Sales */}
        <div className={`p-3.5 rounded-2xl border shadow-2xs ${
          isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-stone-400">
              {t.money.todaySales}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-black">
            ₹{todaySales.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-semibold text-emerald-400 mt-0.5">
            {todayOrders} {t.money.ordersToday}
          </div>
        </div>

        {/* Net Profit */}
        <div className={`p-3.5 rounded-2xl border shadow-2xs ${
          isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-stone-400">
              {t.money.netProfit}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-xl font-black ${
              todayProfit >= 0 ? 'text-amber-400' : 'text-rose-500'
            }`}
          >
            ₹{todayProfit.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-semibold text-stone-400 mt-0.5">
            खर्च वजा जाता
          </div>
        </div>

        {/* Today's Expenses */}
        <div className={`p-3 rounded-2xl border shadow-2xs ${
          isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-stone-400">
              {t.money.todayExpenses}
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black text-rose-400">
            ₹{todayExpenses.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Orders Today */}
        <div className={`p-3 rounded-2xl border shadow-2xs ${
          isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase text-stone-400">
              {t.money.ordersToday}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg font-black">{todayOrders}</div>
        </div>
      </div>

      {/* 7-DAY BAR CHART */}
      <div className={`p-4 rounded-2xl border shadow-2xs mb-4 ${
        isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            {t.money.last7DaysTrend}
          </h3>
          <span className="text-[10px] font-bold text-stone-400">विक्री (₹)</span>
        </div>

        {/* Interactive Bar Chart */}
        <div className={`flex items-end justify-between gap-2 h-36 pt-4 px-1 border-b ${
          isDark ? 'border-stone-800' : 'border-stone-200'
        }`}>
          {shopState.dailySales.map((day, idx) => {
            const isToday = idx === shopState.dailySales.length - 1;
            const heightPercent = Math.max(12, Math.round((day.sales / maxDaySales) * 100));

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[9px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  ₹{day.sales}
                </span>

                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className={`w-full max-w-[28px] rounded-t-lg transition-all duration-500 shadow-xs ${
                      isToday
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400 ring-2 ring-amber-400/50'
                        : isDark
                        ? 'bg-stone-800 group-hover:bg-amber-500/70'
                        : 'bg-stone-300 group-hover:bg-amber-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.dayLabel}: ₹${day.sales} (${day.orderCount} orders)`}
                  />
                </div>

                <span
                  className={`text-[10px] font-bold ${
                    isToday ? 'text-amber-400 font-black' : 'text-stone-400'
                  }`}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] font-medium text-stone-400">
          <span>७ दिवसांची सरासरी: ₹4,300/दिवस</span>
          <span className="text-amber-400 font-bold">आज: ₹{todaySales}</span>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className={`p-3.5 rounded-2xl border shadow-2xs ${
        isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
          {t.money.topSellingItems}
        </h3>
        <div className="space-y-2">
          {[
            { name: 'Sugar (साखर)', qty: '28 kg sold', share: '32%' },
            { name: 'Rice (तांदूळ)', qty: '35 kg sold', share: '28%' },
            { name: 'Cooking Oil (तेल)', qty: '12 L sold', share: '24%' },
            { name: 'Toor Dal (तूर डाळ)', qty: '8 kg sold', share: '16%' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700'
                }`}>
                  {i + 1}
                </span>
                <span className="font-bold">{item.name}</span>
              </div>
              <div className="text-stone-400 font-medium">
                {item.qty} ({item.share})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className={`rounded-2xl max-w-sm w-full p-5 shadow-2xl border ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="text-base font-black mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-5 h-5 text-rose-500" />
              {t.money.recordExpense}
            </h3>

            <form onSubmit={handleRecordExpenseSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  {t.money.category}
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                >
                  <option value="Market / Mandi Delivery">Market / Tempo Delivery (मंडी वाहतूक)</option>
                  <option value="Electricity / Power">Electricity Bill (लाईट बिल)</option>
                  <option value="Packaging Bags">Packaging Bags / Sacks (पॅकिंग पिशव्या)</option>
                  <option value="Shop Maintenance">Shop Repair / Tea (दुकान खर्च / चहा)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  {t.money.amount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  {t.money.note}
                </label>
                <input
                  type="text"
                  value={expenseNote}
                  onChange={(e) => setExpenseNote(e.target.value)}
                  placeholder="उदा. टेम्पो ड्रायव्हर भाडे..."
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                >
                  {t.money.saveExpense}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
