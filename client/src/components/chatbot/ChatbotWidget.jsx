import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import { t } from '../../utils/translate';
import { MessageSquare, X, Send, Volume2, VolumeX, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

export default function ChatbotWidget() {
  const { user, profile, language } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 🎓 I am your Welfare AI Assistant. Ask me about eligible scholarships, Pragati/INSPIRE schemes, deadlines, required documents, or eligibility rules!',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Increment unread count when bot sends a message and widget is closed
  useEffect(() => {
    if (messages.length > 1 && !isOpen && messages[messages.length - 1].sender === 'bot') {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages, isOpen]);

  // Read message out loud if voice is enabled
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/•/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'gu') utterance.lang = 'gu-IN';
    else utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = { sender: 'user', text: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const profileContext = profile ? {
        age: profile.age,
        gender: profile.gender,
        state: profile.state,
        caste: profile.category,
        income: profile.annualFamilyIncome,
        cgpa: profile.cgpaOrPercentage,
        educationLevel: profile.educationLevel,
        stream: profile.stream,
        bpl: profile.bplStatus,
        disability: profile.disabilityStatus,
      } : null;

      const { data } = await aiAPI.chat(text.trim(), profileContext);
      
      const payload = data.data || data;
      const botResponseText = payload.reply || payload.response || "Sorry, I couldn't process that request right now. Please try again.";
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      }]);

      speakText(botResponseText);
    } catch (err) {
      console.error("Chatbot Error:", err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Sorry, I couldn't process that request right now. Please try again.",
        isError: true,
        lastQuery: text.trim(),
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const selectChip = (query) => {
    handleSendMessage(query);
  };

  const CHIPS = [
    { label: 'pragati', query: 'What are the rules for the Pragati Girl Students scheme?' },
    { label: 'inspire', query: 'Am I eligible for the INSPIRE scholarship?' },
    { label: 'income', query: 'Show scholarships based on my family income.' },
    { label: 'documents', query: 'Which documents are required for my eligible scholarships?' }
  ];

  // Helper to render markdown bold & line breaks
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={lIdx} className={line.trim() === '' ? 'h-1.5' : 'min-h-[1.25em]'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-extrabold text-gray-900 dark:text-slate-100">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Panel ────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[380px] h-[520px] mb-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-slide-up glass-modal">
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-primary-600 to-violet-600 flex items-center justify-between shadow-lg text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">Welfare AI Chatbot</h3>
                <span className="text-[10px] text-white/80 mt-1 block">Powered by Google Gemini / local NLP</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-lg transition-colors hover:bg-white/10 ${voiceEnabled ? 'text-amber-300' : 'text-white/60'}`}
                title={voiceEnabled ? 'Voice Feedback Enabled' : 'Voice Feedback Disabled'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-hide bg-gray-50/50 dark:bg-slate-900/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-600/50'
                }`}>
                  <div>{renderFormattedText(msg.text)}</div>

                  {msg.isError && (
                    <button
                      onClick={() => handleSendMessage(msg.lastQuery)}
                      className="mt-2 text-[11px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md"
                    >
                      <RotateCcw className="w-3 h-3" /> Try Again
                    </button>
                  )}

                  <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400 dark:text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600/50 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-slate-400">AI is typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700/60 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-1.5">
            {CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectChip(chip.query)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 transition-colors border border-gray-200 dark:border-slate-600 shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatPlaceholder', language)}
              className="input text-xs flex-1"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn btn-primary px-3 rounded-xl flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ── Trigger Button ────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-primary-600 to-violet-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 relative group neon-glow-primary border-4 border-white dark:border-slate-850"
        title="AI Chat"
      >
        {isOpen ? <X className="w-6 h-6 animate-fade-in" /> : <MessageSquare className="w-6 h-6 animate-fade-in" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border-2 border-white dark:border-slate-900 animate-pulse">
            !
          </span>
        )}
      </button>
    </div>
  );
}
