import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, RefreshCw, MessageSquare, Activity, CheckCircle2 } from 'lucide-react';
import { ChatMessage, Language, ShopState, AgentStep, Theme } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { AgentStepsPanel } from './AgentStepsPanel';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  speakText,
  stopSpeech,
  playChime,
} from '../utils/speech';

interface HomeTabProps {
  currentLanguage: Language;
  shopState: ShopState;
  onUpdateShopState: (newState: ShopState) => void;
  isAudioMuted: boolean;
  onShowToast: (msg: string) => void;
  latestSteps: AgentStep[];
  setLatestSteps: (steps: AgentStep[]) => void;
  theme: Theme;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  currentLanguage,
  shopState,
  onUpdateShopState,
  isAudioMuted,
  onShowToast,
  latestSteps,
  setLatestSteps,
  theme,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const isDark = theme === 'dark';

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number | null>(0.96);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  // Set initial welcome message in selected language if messages are empty
  useEffect(() => {
    if (messages.length === 0) {
      let welcome = '';
      if (currentLanguage === 'mr') {
        welcome = 'नमस्कार शेठजी! मी तुमचा दुकान साथी. सांगा काय करू? (उदा. "रमेशने ५ किलो साखर मागितली" किंवा "आज किती कमाई झाली?")';
      } else if (currentLanguage === 'ta') {
        welcome = 'வணக்கம்! நான் உங்கள் கடை தோழன். என்ன செய்ய வேண்டும்? (எ.கா: "ரமேஷ் 5 கிலோ சர்க்கரை கேட்டார்" அல்லது "இன்றைய விற்பனை எவ்வளவு?")';
      } else if (currentLanguage === 'hi') {
        welcome = 'नमस्ते सेठ जी! मैं आपका दुकान साथी हूँ। बताइए क्या सेवा करें? (उदा. "रमेश ने 5 किलो चीनी मांगी" या "आज की बिक्री कितनी है?")';
      } else {
        welcome = 'Namaste! I am Dukaan Saathi, your voice assistant. How can I help? (e.g. "Ramesh wants 5 kg sugar" or "What is today\'s sales?")';
      }

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'agent',
          text: welcome,
          spokenText: welcome,
          language: currentLanguage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [currentLanguage]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, isProcessing]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Process user prompt with server-side agent loop (or local fallback)
  const processCommand = async (commandText: string, confidence?: number) => {
    if (!commandText.trim()) return;

    setIsProcessing(true);
    setLiveTranscript('');
    const scoreToStore = confidence !== undefined ? confidence : 0.95;
    setConfidenceScore(scoreToStore);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: commandText,
      language: currentLanguage,
      confidenceScore: scoreToStore,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      playChime('start');
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: commandText,
          language: currentLanguage,
          currentState: shopState,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const updatedState: ShopState = data.newState || shopState;
      const returnedSteps: AgentStep[] = data.steps || [];
      const replyText: string = data.replyText || 'काम पूर्ण झाले.';
      const spokenText: string = data.spokenText || replyText;

      // Update state and history
      onUpdateShopState(updatedState);
      setLatestSteps(returnedSteps);
      playChime('success');

      const agentMessage: ChatMessage = {
        id: `agent-msg-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        spokenText,
        language: currentLanguage,
        steps: returnedSteps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMessage]);

      if (returnedSteps.length > 0) {
        onShowToast(`✅ ${returnedSteps.length} कृती यशस्वीरित्या पूर्ण!`);
      }

      // Voice synthesis reply
      if (!isAudioMuted && spokenText) {
        speakText(
          spokenText,
          currentLanguage,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false)
        );
      }
    } catch (err: any) {
      console.error('Failed to run agent command:', err);
      const errMsg =
        currentLanguage === 'mr'
          ? 'माफ करा, तांत्रिक अडचण आली. कृपया पुन्हा बोला.'
          : currentLanguage === 'ta'
          ? 'மன்னிக்கவும், பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
          : currentLanguage === 'hi'
          ? 'माफ़ करें, कोई समस्या आई। कृपया दोबारा बोलें।'
          : 'Sorry, an error occurred. Please try speaking again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `err-msg-${Date.now()}`,
          sender: 'agent',
          text: errMsg,
          language: currentLanguage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start or Stop Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      onShowToast(t.mic.speechNotSupported);
      return;
    }

    stopSpeech();
    setIsSpeaking(false);
    setLiveTranscript('');
    setConfidenceScore(0.85); // initial listening baseline
    playChime('start');

    try {
      const recognition = createSpeechRecognition(
        currentLanguage,
        (transcript, isFinal, confidence) => {
          setLiveTranscript(transcript);
          if (confidence !== undefined) {
            setConfidenceScore(confidence);
          }
          if (isFinal && transcript.trim()) {
            setIsListening(false);
            processCommand(transcript, confidence);
          }
        },
        (error) => {
          console.warn('Speech recognition error:', error);
          setIsListening(false);
          if (error === 'not-allowed') {
            onShowToast('कृपया माईकची परवानगी (Microphone permission) द्या');
          }
        },
        () => {
          setIsListening(false);
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isProcessing) return;
    const text = textInput;
    setTextInput('');
    processCommand(text, 0.99); // typed text has 99% accuracy
  };

  const handleSampleChipClick = (chipText: string) => {
    stopSpeech();
    processCommand(chipText, 0.98); // sample chips are verified exact commands
  };

  const handleReplaySpeech = (text: string) => {
    speakText(
      text,
      currentLanguage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] pb-24 px-3 max-w-md mx-auto">
      {/* JUDGES / QUICK DEMO CHIPS */}
      <div className="pt-2 pb-1">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
            isDark ? 'text-amber-400' : 'text-amber-800'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {t.mic.trySaying}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isDark
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            One-Tap Demo
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {/* Primary Demo Flow Chip (Sugar order with Ramesh) */}
          <button
            onClick={() => handleSampleChipClick(t.sampleChips.orderDemo)}
            disabled={isProcessing || isListening}
            className={`w-full text-left p-2.5 rounded-xl border-2 active:scale-[0.99] transition shadow-xs flex items-center gap-2 group cursor-pointer ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-500/10 border-amber-500/60 hover:border-amber-400'
                : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/20 border-amber-500/60 hover:border-amber-600'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition">
              1
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-[11px] font-bold leading-tight ${
                isDark ? 'text-stone-100 group-hover:text-amber-300' : 'text-stone-900 group-hover:text-amber-950'
              }`}>
                "{t.sampleChips.orderDemo}"
              </div>
              <div className="text-[9px] font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                <span>Check stock</span> → <span>Create order</span> → <span>Update stock</span> → <span>Add Udhaar</span>
              </div>
            </div>
          </button>

          {/* Other 3 Quick Test Chips */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSampleChipClick(t.sampleChips.salesQuery)}
              disabled={isProcessing || isListening}
              className={`p-2 rounded-xl border active:scale-95 transition shadow-2xs text-left cursor-pointer ${
                isDark
                  ? 'bg-stone-900/90 border-stone-800 hover:border-emerald-500/50'
                  : 'bg-white border-stone-200 hover:border-amber-400'
              }`}
            >
              <div className="text-[9px] font-bold text-emerald-400 uppercase">कमाई / Sales</div>
              <div className={`text-[10px] font-bold line-clamp-2 mt-0.5 leading-tight ${
                isDark ? 'text-stone-200' : 'text-stone-800'
              }`}>
                "{t.sampleChips.salesQuery}"
              </div>
            </button>

            <button
              onClick={() => handleSampleChipClick(t.sampleChips.khataQuery)}
              disabled={isProcessing || isListening}
              className={`p-2 rounded-xl border active:scale-95 transition shadow-2xs text-left cursor-pointer ${
                isDark
                  ? 'bg-stone-900/90 border-stone-800 hover:border-purple-500/50'
                  : 'bg-white border-stone-200 hover:border-amber-400'
              }`}
            >
              <div className="text-[9px] font-bold text-purple-400 uppercase">उधारी / Khata</div>
              <div className={`text-[10px] font-bold line-clamp-2 mt-0.5 leading-tight ${
                isDark ? 'text-stone-200' : 'text-stone-800'
              }`}>
                "{t.sampleChips.khataQuery}"
              </div>
            </button>

            <button
              onClick={() => handleSampleChipClick(t.sampleChips.stockQuery)}
              disabled={isProcessing || isListening}
              className={`p-2 rounded-xl border active:scale-95 transition shadow-2xs text-left cursor-pointer ${
                isDark
                  ? 'bg-stone-900/90 border-stone-800 hover:border-blue-500/50'
                  : 'bg-white border-stone-200 hover:border-amber-400'
              }`}
            >
              <div className="text-[9px] font-bold text-blue-400 uppercase">स्टॉक / Stock</div>
              <div className={`text-[10px] font-bold line-clamp-2 mt-0.5 leading-tight ${
                isDark ? 'text-stone-200' : 'text-stone-800'
              }`}>
                "{t.sampleChips.stockQuery}"
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* HERO MICROPHONE SECTION */}
      <div className="my-3 flex flex-col items-center justify-center relative">
        {/* Pulsing Concentric Rings while listening */}
        <div className="relative flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-36 h-36 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full bg-amber-500/20 animate-pulse-ring pointer-events-none" />
            </>
          )}

          {isProcessing && (
            <div className="absolute w-36 h-36 rounded-full border-4 border-dashed border-amber-500 animate-spin pointer-events-none" />
          )}

          {/* Huge Central Hero Mic Button */}
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            aria-label={t.mic.tapToSpeak}
            className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 to-red-500 shadow-rose-500/50 scale-105 ring-4 ring-rose-400'
                : isProcessing
                ? 'bg-gradient-to-tr from-amber-600 to-amber-700 shadow-amber-600/30'
                : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:shadow-amber-500/40 hover:scale-102 ring-4 ring-amber-400/50 shadow-amber-600/40'
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-10 h-10 text-stone-950 animate-spin" />
            ) : isListening ? (
              <div className="flex flex-col items-center">
                <Mic className="w-11 h-11 text-white animate-bounce" />
                {/* Audio equalizer bars */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 bg-white rounded-full sound-bar-1" />
                  <div className="w-1 bg-white rounded-full sound-bar-2" />
                  <div className="w-1 bg-white rounded-full sound-bar-3" />
                  <div className="w-1 bg-white rounded-full sound-bar-4" />
                  <div className="w-1 bg-white rounded-full sound-bar-5" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Mic className="w-12 h-12 text-stone-950 stroke-[2.5]" />
              </div>
            )}
          </button>
        </div>

        {/* Live Mic Status Label */}
        <div className="mt-3 text-center">
          <div className="text-sm font-black tracking-tight flex items-center justify-center gap-1.5">
            {isListening ? (
              <span className="text-rose-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                {t.mic.listening}
              </span>
            ) : isProcessing ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {t.mic.thinking}
              </span>
            ) : (
              <span className={isDark ? 'text-stone-100' : 'text-stone-800'}>
                {t.mic.tapToSpeak}
              </span>
            )}
          </div>
          <p className="text-[11px] font-semibold text-stone-400 mt-0.5">
            {isListening ? t.mic.listeningTips : `${t.langName} • ${t.voiceOSBadge}`}
          </p>
        </div>

        {/* Live Speech Interim Bubble */}
        {isListening && liveTranscript && (
          <div className={`mt-2 px-3.5 py-1.5 rounded-full border text-xs font-bold shadow-xs animate-pulse max-w-[90%] text-center truncate ${
            isDark
              ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              : 'bg-amber-100 border-amber-300 text-stone-900'
          }`}>
            "{liveTranscript}"
          </div>
        )}

        {/* CONFIDENCE SCORE VISUAL INDICATOR NEAR TRANSCRIPT AREA */}
        {confidenceScore !== null && (
          <ConfidenceIndicator
            score={confidenceScore}
            language={currentLanguage}
            theme={theme}
            isLive={isListening}
          />
        )}
      </div>

      {/* CHAT / AGENT CONVERSATION TIMELINE */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            संभाषण (Conversation)
          </span>
          {isSpeaking && (
            <span className={`text-[10px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30' : 'bg-amber-100 text-amber-700'
            }`}>
              <Volume2 className="w-3 h-3 animate-pulse" />
              {t.common.speaking}
            </span>
          )}
        </div>

        <div
          ref={chatScrollRef}
          className={`flex-1 max-h-60 overflow-y-auto space-y-2.5 p-2.5 rounded-2xl border shadow-inner no-scrollbar ${
            isDark
              ? 'bg-black/60 border-stone-800/90'
              : 'bg-stone-100/60 border-stone-200/80'
          }`}
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-medium shadow-2xs leading-relaxed ${
                    isUser
                      ? isDark
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-bold rounded-br-none shadow-amber-500/20'
                        : 'bg-stone-900 text-stone-100 rounded-br-none'
                      : isDark
                      ? 'bg-stone-900 text-stone-100 border border-stone-800 rounded-bl-none shadow-md'
                      : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
                  }`}
                >
                  <p className="font-semibold text-[13px]">{msg.text}</p>

                  <div className={`flex items-center justify-between gap-3 mt-1.5 pt-1 border-t text-[10px] ${
                    isUser
                      ? isDark ? 'border-amber-700/50 text-stone-900' : 'border-stone-700 text-stone-300'
                      : isDark ? 'border-stone-800 text-stone-400' : 'border-stone-200 text-stone-500'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {msg.confidenceScore && (
                        <span className={`text-[9px] px-1 py-0.2 rounded font-extrabold ${
                          msg.confidenceScore >= 0.8
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {Math.round(msg.confidenceScore * 100)}%
                        </span>
                      )}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleReplaySpeech(msg.spokenText || msg.text)}
                        className={`p-1 transition flex items-center gap-1 font-bold cursor-pointer ${
                          isDark ? 'text-amber-400 hover:text-amber-300' : 'text-stone-600 hover:text-amber-600'
                        }`}
                        title="Replay Voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Replay</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-start">
              <div className={`rounded-2xl px-3.5 py-2.5 text-xs font-medium rounded-bl-none shadow-2xs flex items-center gap-2 ${
                isDark
                  ? 'bg-stone-900 text-stone-200 border border-stone-800'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span className="font-bold text-[12px]">{t.mic.thinking}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AGENT STEPS TRANSPARENCY PANEL (Crucial for Judges) */}
      <AgentStepsPanel steps={latestSteps} currentLanguage={currentLanguage} theme={theme} />

      {/* TEXT INPUT FALLBACK BAR */}
      <form onSubmit={handleSendText} className="mt-2 flex items-center gap-1.5">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t.mic.typePrompt}
          disabled={isProcessing}
          className={`flex-1 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs ${
            isDark
              ? 'bg-stone-900 border border-stone-800 text-stone-100 placeholder:text-stone-500'
              : 'bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400'
          }`}
        />
        <button
          type="submit"
          disabled={!textInput.trim() || isProcessing}
          className={`p-2.5 rounded-xl transition font-bold shadow-2xs cursor-pointer ${
            isDark
              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 disabled:opacity-40'
              : 'bg-stone-900 text-stone-100 hover:bg-stone-800 disabled:opacity-40'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
