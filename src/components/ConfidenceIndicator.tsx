import React from 'react';
import { Activity, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Language, Theme } from '../types';

interface ConfidenceIndicatorProps {
  score: number; // 0 to 1 (e.g. 0.94)
  language: Language;
  theme: Theme;
  isLive?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  score,
  language,
  theme,
  isLive = false,
}) => {
  // Clamp between 0 and 1
  const normalized = Math.max(0.1, Math.min(1, score));
  const percent = Math.round(normalized * 100);

  // Status and color
  let status: 'high' | 'medium' | 'low';
  let barColor: string;
  let textColor: string;
  let bgBadge: string;
  let labelText: string;

  if (percent >= 80) {
    status = 'high';
    barColor = 'bg-emerald-500 shadow-emerald-500/50';
    textColor = 'text-emerald-400';
    bgBadge = theme === 'dark' ? 'bg-emerald-950/60 border-emerald-500/30' : 'bg-emerald-100 border-emerald-300 text-emerald-800';
    
    if (language === 'mr') labelText = 'अचूक आवाज (स्पष्ट)';
    else if (language === 'ta') labelText = 'துல்லியமான குரல் (தெளிவு)';
    else if (language === 'hi') labelText = 'सटीक आवाज़ (स्पष्ट)';
    else labelText = 'High Clarity';
  } else if (percent >= 60) {
    status = 'medium';
    barColor = 'bg-amber-500 shadow-amber-500/50';
    textColor = 'text-amber-400';
    bgBadge = theme === 'dark' ? 'bg-amber-950/60 border-amber-500/30' : 'bg-amber-100 border-amber-300 text-amber-800';

    if (language === 'mr') labelText = 'मध्यम स्पष्टता';
    else if (language === 'ta') labelText = 'மிதமான தெளிவு';
    else if (language === 'hi') labelText = 'मध्यम स्पष्टता';
    else labelText = 'Moderate Clarity';
  } else {
    status = 'low';
    barColor = 'bg-rose-500 shadow-rose-500/50';
    textColor = 'text-rose-400';
    bgBadge = theme === 'dark' ? 'bg-rose-950/60 border-rose-500/30' : 'bg-rose-100 border-rose-300 text-rose-800';

    if (language === 'mr') labelText = 'अस्पष्ट (माईक जवळ बोला)';
    else if (language === 'ta') labelText = 'குறைந்த தெளிவு';
    else if (language === 'hi') labelText = 'धीमी आवाज़ (पास से बोलें)';
    else labelText = 'Low Clarity';
  }

  const confidenceTitle =
    language === 'mr'
      ? 'आवाज अचूकता (Speech Confidence)'
      : language === 'ta'
      ? 'குரல் துல்லியம் (Confidence)'
      : language === 'hi'
      ? 'वाणी सटीकता (Confidence)'
      : 'Speech Recognition Confidence';

  return (
    <div
      className={`w-full max-w-xs mx-auto my-2 px-3 py-2 rounded-xl border transition-all ${
        theme === 'dark'
          ? 'bg-stone-900/95 border-stone-800 shadow-lg shadow-black/40 text-stone-200'
          : 'bg-white border-stone-200 shadow-xs text-stone-800'
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5">
          <Activity className={`w-3.5 h-3.5 ${textColor} ${isLive ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            {confidenceTitle}
          </span>
        </div>

        {/* Score pill */}
        <div className="flex items-center gap-1">
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${bgBadge}`}
          >
            {status === 'high' && <CheckCircle className="w-2.5 h-2.5" />}
            {status === 'medium' && <HelpCircle className="w-2.5 h-2.5" />}
            {status === 'low' && <AlertCircle className="w-2.5 h-2.5" />}
            <span>{percent}%</span>
          </span>
        </div>
      </div>

      {/* Color-coded progress bar (Green/Yellow/Red) */}
      <div
        className={`w-full h-2 rounded-full overflow-hidden p-0.5 ${
          theme === 'dark' ? 'bg-stone-800' : 'bg-stone-100'
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Guide text */}
      <div className="flex items-center justify-between mt-1 text-[10px] font-semibold text-stone-400">
        <span className={textColor}>{labelText}</span>
        <span className="text-[9px] text-stone-500 font-medium">
          {percent >= 80 ? '✓ Ready' : 'Speak louder'}
        </span>
      </div>
    </div>
  );
};
