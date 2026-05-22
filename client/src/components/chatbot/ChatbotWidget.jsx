import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import { t } from '../../utils/translate';
import { MessageSquare, X, Send, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatbotWidget() {
  const { user, profile, language } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your AI Welfare Assistant. How can I help you find or check scholarships today?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Read message out loud if voice is enabled
  const speakText = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Attempt to match language (English/Hindi/Gujarati)
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'gu') utterance.lang = 'gu-IN';
    else utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Package message with user profile context
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

      const { data } = await aiAPI.chat(text, profileContext);
      
      const botResponseText = data.response || "I'm having trouble processing that right now. Let me look at your profile schemes.";
      
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      }]);

      speakText(botResponseText);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "Sorry, I encountered a connection error. Please make sure MongoDB and the backend server are running.",
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
    { label: 'inspire', query: 'Am I eligible for the INSPIRE scholarship?' },
    { label: 'pragati', query: 'What are the rules for the Pragati Girl Students scheme?' },
    { label: 'income', query: 'What schemes can I apply for if my income is under 2.5 lakhs?' },
    { label: 'documents', query: 'What documents are required for Post-Matric SC/ST scholarship?' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* ── Chat Panel ────────────────────────────────────────── */}
      {isOpen && (
        <div className="w-[380px] h-[500px] mb-4 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-slide-up glass-modal">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-primary-600 to-violet-600 flex items-center justify-between shadow-lg text-white">
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
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide bg-gray-50/50 dark:bg-slate-900/30">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-slate-600/50'
                }`}>
                  <div>{msg.text}</div>
                  <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400 dark:text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600/50 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-300 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-300 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chips */}
          <div className="px-4 py-2 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700/60 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
            {CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => selectChip(chip.query)}
                className="chip py-1"
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
              placeholder={t('chatPlaceholder', language)}
              className="input text-xs"
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
