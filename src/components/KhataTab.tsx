import React, { useState } from 'react';
import { BookOpen, User, Phone, ArrowDownRight, Check, Plus, DollarSign } from 'lucide-react';
import { ShopState, Language, Customer, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { executeTool } from '../utils/agentEngine';

interface KhataTabProps {
  currentLanguage: Language;
  shopState: ShopState;
  onUpdateShopState: (newState: ShopState) => void;
  onShowToast: (msg: string) => void;
  theme?: Theme;
}

export const KhataTab: React.FC<KhataTabProps> = ({
  currentLanguage,
  shopState,
  onUpdateShopState,
  onShowToast,
  theme = 'dark',
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isDark = theme === 'dark';

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('200');

  const totalOutstanding = shopState.customers.reduce((acc, c) => acc + c.udhaarBalance, 0);

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0) return;

    const result = executeTool(
      'record_payment',
      { customer: selectedCustomer.name, amount },
      shopState,
      currentLanguage
    );

    onUpdateShopState(result.newState);
    onShowToast(`✅ ${selectedCustomer.name} कडून ₹${amount} जमा झाले!`);
    setSelectedCustomer(null);
    setPaymentAmount('200');
  };

  return (
    <div className="flex flex-col pb-28 px-3 max-w-md mx-auto">
      {/* Header */}
      <div className="pt-3 pb-3">
        <h2 className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${
          isDark ? 'text-white' : 'text-stone-900'
        }`}>
          <BookOpen className="w-5 h-5 text-amber-500" />
          {t.khata.title}
        </h2>
        <p className="text-xs text-stone-400 font-semibold">
          {shopState.customers.length} {t.khata.customerCount}
        </p>
      </div>

      {/* Total Pending Udhaar Banner */}
      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md">
        <div className="text-[11px] font-black uppercase tracking-wider text-amber-950">
          {t.khata.totalPending}
        </div>
        <div className="text-3xl font-black mt-1">
          ₹{totalOutstanding.toLocaleString('en-IN')}
        </div>
        <div className="text-xs font-bold text-stone-950/80 mt-1">
          ग्राहकांकडून येणे बाकी असलेली एकूण रक्कम
        </div>
      </div>

      {/* Customer Khata Cards */}
      <div className="space-y-3">
        {shopState.customers.map((cust) => {
          const isHigh = cust.udhaarBalance >= 500;
          return (
            <div
              key={cust.id}
              className={`p-3.5 rounded-2xl border transition-all shadow-2xs ${
                isDark
                  ? isHigh
                    ? 'bg-stone-900/90 border-amber-500/50 text-stone-100 ring-1 ring-amber-500/30'
                    : 'bg-stone-900/90 border-stone-800 text-stone-100 hover:border-stone-700'
                  : isHigh
                  ? 'bg-white border-amber-400/90 text-stone-900'
                  : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl font-black text-base flex items-center justify-center shadow-2xs ${
                    isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {cust.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-stone-900'}`}>
                        {cust.name}
                      </h3>
                      {isHigh && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          isDark ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {t.khata.highBalanceBadge}
                        </span>
                      )}
                    </div>
                    {cust.phone && (
                      <p className="text-[11px] text-stone-400 font-medium flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {cust.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Udhaar Balance */}
                <div className="text-right">
                  <div className="text-base font-black text-rose-500">
                    ₹{cust.udhaarBalance}
                  </div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase">
                    {t.khata.currentUdhaar}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`mt-3 pt-2.5 border-t flex items-center justify-between ${
                isDark ? 'border-stone-800' : 'border-stone-100'
              }`}>
                <span className="text-[10px] font-semibold text-stone-400">
                  खरेदी: ₹{cust.totalPurchases}
                </span>

                <button
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setPaymentAmount(String(Math.min(cust.udhaarBalance, 200) || 100));
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition active:scale-95 cursor-pointer ${
                    isDark
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black'
                      : 'bg-stone-900 hover:bg-stone-800 text-stone-100'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  {t.khata.recordPayment}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Payment Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className={`rounded-2xl max-w-sm w-full p-5 shadow-2xl border ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <h3 className="text-base font-black mb-1 flex items-center gap-1.5">
              <ArrowDownRight className="w-5 h-5 text-emerald-500" />
              {t.khata.recordPayment}
            </h3>
            <p className="text-xs text-stone-400 font-semibold mb-3">
              ग्राहक: <span className={isDark ? 'text-amber-400 font-bold' : 'text-stone-900 font-bold'}>{selectedCustomer.name}</span>{' '}
              (चालू बाकी: ₹{selectedCustomer.udhaarBalance})
            </p>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 mb-1">
                  {t.khata.payAmount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedCustomer.udhaarBalance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDark ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* Quick suggestion amounts */}
              <div className="flex gap-1.5">
                {[100, 200, 500, selectedCustomer.udhaarBalance].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPaymentAmount(String(amt))}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200' : 'bg-stone-100 hover:bg-amber-100 text-stone-700'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  {t.khata.confirmPayment}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
