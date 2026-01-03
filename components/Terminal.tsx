import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal as TerminalIcon, Cpu, Loader2 } from 'lucide-react';
import { getCyberFinancialAdvice } from '../services/ai';
import { ChatMessage, ThemeMode } from '../types';

interface TerminalProps {
  theme: ThemeMode;
  totalSaved: number;
  goal: number;
}

export const Terminal: React.FC<TerminalProps> = ({ theme, totalSaved, goal }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', text: 'NetSaver v9 initialized...', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await getCyberFinancialAdvice(totalSaved, goal, input);
    
    const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  const isDark = theme === 'dark';

  return (
    // Reduced height from h-[60vh] to h-64 (256px) for mobile compactness
    <div className={`border rounded-sm overflow-hidden flex flex-col h-64 sm:h-96 w-full max-w-4xl mx-auto shadow-xl transition-colors duration-300
      ${isDark ? 'border-hacker-green bg-black' : 'border-blue-900 bg-gray-100'}`}>
      
      {/* Terminal Header */}
      <div className={`p-1.5 flex items-center gap-2 border-b font-mono text-[10px] sm:text-xs uppercase shrink-0
        ${isDark ? 'bg-hacker-green/20 border-hacker-green text-hacker-green' : 'bg-blue-900/10 border-blue-900 text-blue-900'}`}>
        <TerminalIcon size={12} />
        <span>AI_ADVISOR</span>
        <div className="ml-auto flex gap-1">
           <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
           <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className={`flex-1 overflow-y-auto p-2 font-mono text-[10px] sm:text-sm space-y-2
        ${isDark ? 'text-hacker-green' : 'text-blue-900'}`}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-1.5 rounded-sm border ${
              msg.role === 'user' 
                ? (isDark ? 'border-hacker-pink text-hacker-pink bg-hacker-pink/10' : 'border-blue-600 text-blue-700 bg-blue-100')
                : (isDark ? 'border-hacker-green bg-hacker-green/5' : 'border-gray-400 bg-white')
            }`}>
              <span className="text-[8px] opacity-60 block mb-0.5">
                {msg.role === 'user' ? 'USR' : 'AI'}
              </span>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 opacity-70">
            <Loader2 className="animate-spin" size={12} />
            <span>Processing...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-1.5 border-t flex gap-2 shrink-0 ${isDark ? 'border-hacker-green bg-black' : 'border-blue-900 bg-gray-200'}`}>
        <Cpu size={14} className={`mt-1 ${isDark ? 'text-hacker-green' : 'text-blue-900'}`} />
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Command..."
          className={`flex-1 bg-transparent outline-none font-mono text-xs ${isDark ? 'text-hacker-green placeholder-hacker-green/50' : 'text-blue-900 placeholder-blue-900/50'}`}
        />
        <button 
          onClick={handleSend}
          className={`p-1 hover:bg-opacity-20 transition-all rounded ${
            isDark ? 'text-hacker-green hover:bg-hacker-green' : 'text-blue-900 hover:bg-blue-900'
          }`}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};