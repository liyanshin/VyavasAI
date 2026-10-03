import React from 'react';
import { ShoppingBag, Clock, User, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import { ShopState, Language, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface OrdersTabProps {
  currentLanguage: Language;
  shopState: ShopState;
  theme?: Theme;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ currentLanguage, shopState, theme = 'dark' }) => {
  const t = TRANSLATIONS[currentLanguage];
  const isDark = theme === 'dark';

  const totalRevenue = shopState.orders.reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="flex flex-col pb-28 px-3 max-w-md mx-auto">
      {/* Header */}
      <div className="pt-3 pb-3 flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-black tracking-tight flex items-center gap-1.5 ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}>
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            {t.orders.title}
          </h2>
          <p className="text-xs text-stone-400 font-semibold">
            {shopState.orders.length} {t.orders.totalOrders} • एकूण ₹{totalRevenue}
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {shopState.orders.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border p-6 ${
            isDark ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-white border-stone-200 text-stone-500'
          }`}>
            <ShoppingBag className="w-10 h-10 text-stone-500 mx-auto mb-2" />
            <p className="text-xs font-bold">{t.orders.emptyOrders}</p>
          </div>
        ) : (
          shopState.orders.map((order) => {
            const isCredit = order.paymentType === 'credit';
            const timeFormatted = new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateFormatted = new Date(order.createdAt).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={order.id}
                className={`p-3.5 rounded-2xl border shadow-2xs transition-all ${
                  isDark
                    ? 'bg-stone-900/90 border-stone-800 hover:border-stone-700 text-stone-100'
                    : 'bg-white border-stone-200 hover:border-amber-300 text-stone-900'
                }`}
              >
                {/* Order Top Bar */}
                <div className={`flex items-center justify-between gap-2 pb-2 border-b ${
                  isDark ? 'border-stone-800' : 'border-stone-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg border ${
                      isDark ? 'bg-stone-950 text-amber-400 border-stone-800' : 'bg-stone-100 text-stone-900 border-stone-200'
                    }`}>
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCredit
                          ? isDark
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isDark
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {isCredit ? (
                        <>
                          <CreditCard className="w-3 h-3" />
                          {t.orders.creditUdhaar}
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3 h-3" />
                          {t.orders.cash}
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-semibold text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {dateFormatted}, {timeFormatted}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-sm font-extrabold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                      {order.customerName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className={`text-base font-black ${isDark ? 'text-white' : 'text-stone-900'}`}>
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className={`mt-2.5 pt-2 border-t border-dashed p-2 rounded-xl space-y-1 ${
                  isDark ? 'border-stone-800 bg-stone-950/70' : 'border-stone-200 bg-stone-50/70'
                }`}>
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between text-xs font-semibold ${
                        isDark ? 'text-stone-300' : 'text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>
                          {it.name} ({it.qty} {it.unit})
                        </span>
                      </div>
                      <span className={`font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        ₹{it.lineTotal || it.qty * it.pricePerUnit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Footer */}
                <div className="flex items-center justify-between mt-2.5 pt-1 text-[11px] text-stone-400 font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.orders.completed}
                  </span>
                  <span>{order.items.length} items</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
