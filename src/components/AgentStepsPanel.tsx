import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Cpu, Terminal, ArrowRight, Layers } from 'lucide-react';
import { AgentStep, Language, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface AgentStepsPanelProps {
  steps: AgentStep[];
  currentLanguage: Language;
  theme?: Theme;
}

export const AgentStepsPanel: React.FC<AgentStepsPanelProps> = ({ steps, currentLanguage, theme = 'dark' }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const t = TRANSLATIONS[currentLanguage];

  if (!steps || steps.length === 0) {
    return null;
  }

  const isDark = theme === 'dark';

  const toolBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
    check_stock: isDark
      ? { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-500/30' }
      : { bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20' },
    update_stock: isDark
      ? { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/30' }
      : { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20' },
    create_order: isDark
      ? { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/40' }
      : { bg: 'bg-amber-500/10', text: 'text-amber-800', border: 'border-amber-500/30' },
    add_to_customer_ledger: isDark
      ? { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-500/30' }
      : { bg: 'bg-purple-500/10', text: 'text-purple-700', border: 'border-purple-500/20' },
    get_sales_summary: isDark
      ? { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-500/30' }
      : { bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20' },
    get_customer_balance: isDark
      ? { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-500/30' }
      : { bg: 'bg-indigo-500/10', text: 'text-indigo-700', border: 'border-indigo-500/20' },
    record_payment: isDark
      ? { bg: 'bg-teal-950/60', text: 'text-teal-300', border: 'border-teal-500/30' }
      : { bg: 'bg-teal-500/10', text: 'text-teal-700', border: 'border-teal-500/20' },
    record_expense: isDark
      ? { bg: 'bg-rose-950/60', text: 'text-rose-300', border: 'border-rose-500/30' }
      : { bg: 'bg-rose-500/10', text: 'text-rose-700', border: 'border-rose-500/20' },
    add_item: isDark
      ? { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-500/30' }
      : { bg: 'bg-cyan-500/10', text: 'text-cyan-700', border: 'border-cyan-500/20' },
    get_low_stock_items: isDark
      ? { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-500/30' }
      : { bg: 'bg-amber-500/10', text: 'text-amber-800', border: 'border-amber-500/20' },
  };

  return (
    <div
      className={`border-2 rounded-2xl shadow-md overflow-hidden transition-all my-3 ${
        isDark
          ? 'bg-stone-900 border-amber-500/30 text-stone-100'
          : 'bg-white border-amber-500/30 text-stone-900'
      }`}
    >
      {/* Panel Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3.5 py-2.5 flex items-center justify-between cursor-pointer border-b select-none transition-colors ${
          isDark
            ? 'bg-stone-900/90 border-stone-800'
            : 'bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-white border-amber-200/60'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className={`text-xs font-black tracking-wide uppercase ${isDark ? 'text-white' : 'text-stone-900'}`}>
                {t.agentSteps.title}
              </h3>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                isDark
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {steps.length} {t.agentSteps.totalSteps}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              {t.agentSteps.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowRawJson(!showRawJson);
            }}
            className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 cursor-pointer transition ${
              isDark
                ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-200'
            }`}
          >
            <Terminal className="w-3 h-3" />
            {showRawJson ? 'Hide JSON' : 'JSON'}
          </button>
          <button className="text-stone-400 hover:text-stone-200">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Steps Content */}
      {isExpanded && (
        <div className={`p-3 ${isDark ? 'bg-black/40' : 'bg-stone-50/50'}`}>
          {/* Quick Flow Pipeline Pill Bar */}
          <div
            className={`mb-3 px-2.5 py-2 rounded-xl border flex items-center gap-1 text-[11px] font-semibold overflow-x-auto no-scrollbar whitespace-nowrap ${
              isDark
                ? 'bg-stone-950 border-stone-800 text-stone-200'
                : 'bg-amber-50/80 border-amber-200/80 text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-stone-400 text-[10px] uppercase font-bold shrink-0">Flow:</span>
            {steps.map((st, i) => (
              <React.Fragment key={st.id || i}>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded border text-[11px] font-bold shadow-2xs ${
                    isDark
                      ? 'bg-stone-900 border-stone-700 text-white'
                      : 'bg-white border-amber-300 text-stone-900'
                  }`}
                >
                  <span className="text-emerald-500 font-black">✓</span> {st.tool.replace(/_/g, ' ')}
                </span>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-amber-500 shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Timeline of Individual Steps */}
          <div className="space-y-2 relative pl-3 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-amber-500/40">
            {steps.map((step, index) => {
              const color = toolBadgeColors[step.tool] || {
                bg: isDark ? 'bg-stone-800' : 'bg-stone-100',
                text: isDark ? 'text-stone-200' : 'text-stone-800',
                border: isDark ? 'border-stone-700' : 'border-stone-200',
              };

              return (
                <div key={step.id || index} className="relative flex items-start gap-2.5 group">
                  {/* Step Number with Green Check */}
                  <div className="z-10 w-6 h-6 rounded-full bg-emerald-500 text-stone-950 font-black text-[11px] flex items-center justify-center shrink-0 shadow-sm ring-2 ring-stone-900">
                    ✓
                  </div>

                  {/* Step Card */}
                  <div
                    className={`flex-1 rounded-xl p-2.5 border shadow-2xs ${
                      isDark
                        ? 'bg-stone-950/80 border-stone-800'
                        : 'bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-stone-500">
                          #{index + 1}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${color.bg} ${color.text} ${color.border}`}
                        >
                          {step.tool}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-stone-500">
                        {step.timestamp}
                      </span>
                    </div>

                    <p className={`text-xs font-bold leading-snug ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      {step.summary}
                    </p>

                    {/* Technical details toggle */}
                    {showRawJson && (
                      <div className="mt-2 p-2 bg-black rounded-lg text-[10px] font-mono text-amber-300 overflow-x-auto max-h-36 border border-stone-800">
                        <div className="text-stone-500 mb-0.5 font-sans font-bold">Args:</div>
                        <pre className="text-stone-300">{JSON.stringify(step.args, null, 2)}</pre>
                        <div className="text-stone-500 mt-1 mb-0.5 font-sans font-bold">Result:</div>
                        <pre className="text-emerald-400">{JSON.stringify(step.result, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

