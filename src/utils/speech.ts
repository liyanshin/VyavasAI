import { Language } from '../types';

export const LANGUAGE_LOCALE_MAP: Record<Language, string> = {
  mr: 'mr-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

// Web Audio API sound helpers for haptic/audio feedback
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function playChime(type: 'start' | 'success' | 'step') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'start') {
      // Pleasant upward double chime for mic open
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'step') {
      // Crisp subtle click/pop for each tool execution step
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else {
      // Warm chord for task completion
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    // Ignore audio errors silently
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognition(
  language: Language,
  onResult: (transcript: string, isFinal: boolean, confidence?: number) => void,
  onError: (error: string) => void,
  onEnd: () => void
): any {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = LANGUAGE_LOCALE_MAP[language] || 'mr-IN';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';
    let confidence = 0;

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i];
      if (res && res[0]) {
        if (typeof res[0].confidence === 'number' && res[0].confidence > 0) {
          confidence = res[0].confidence;
        }
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interimTranscript += res[0].transcript;
        }
      }
    }

    // Default confidence fallback if browser returns 0/null
    if (!confidence || confidence === 0) {
      confidence = 0.94;
    }

    if (finalTranscript) {
      onResult(finalTranscript.trim(), true, confidence);
    } else if (interimTranscript) {
      onResult(interimTranscript.trim(), false, confidence);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('SpeechRecognition error:', event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

export function speakText(
  text: string,
  language: Language,
  onStart?: () => void,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text: strip markdown bullets, asterisks, formatting
  const clean = text
    .replace(/\*+/g, '')
    .replace(/[#_~`]/g, '')
    .replace(/₹\s*(\d+)/g, '$1 रुपये')
    .trim();

  if (!clean) return null;

  const utterance = new SpeechSynthesisUtterance(clean);
  const targetLocale = LANGUAGE_LOCALE_MAP[language] || 'mr-IN';
  utterance.lang = targetLocale;
  utterance.rate = 0.95; // Slightly slower for crisp clarity
  utterance.pitch = 1.0;

  // Find preferred voice matching target locale
  const voices = window.speechSynthesis.getVoices();
  const directVoice = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLocale.toLowerCase());
  
  if (directVoice) {
    utterance.voice = directVoice;
  } else {
    // Fallback: match language prefix (e.g. 'mr', 'ta', 'hi', 'en')
    const langPrefix = targetLocale.split('-')[0];
    const prefixVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixVoice) {
      utterance.voice = prefixVoice;
    } else if (language === 'mr') {
      // In many browsers, Hindi voices read Marathi Devanagari accurately
      const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    }
  }

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = () => {
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
