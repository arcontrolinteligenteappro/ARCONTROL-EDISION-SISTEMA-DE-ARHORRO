import React from 'react';
import { ThemeMode } from '../types';
import { X, Shield, Globe, Code, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  theme: ThemeMode;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ theme, onClose }) => {
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-md relative rounded-lg border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-pop-in
        ${isDark ? 'bg-gray-900 border-hacker-green text-hacker-green' : 'bg-white border-blue-900 text-blue-900'}`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center
          ${isDark ? 'bg-black/50 border-hacker-green/30' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-2">
            <Shield size={20} className={isDark ? 'text-hacker-blue' : 'text-blue-600'} />
            <h2 className="text-lg font-bold tracking-widest uppercase">SISTEMA INFO</h2>
          </div>
          <button onClick={onClose} className="hover:scale-110 transition-transform">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center space-y-6">
          
          <div className="space-y-2">
             <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 border-2 animate-pulse-slow
                ${isDark ? 'border-hacker-green bg-hacker-green/10' : 'border-blue-600 bg-blue-50'}`}>
                <Code size={40} />
             </div>
             <h3 className="text-2xl font-bold tracking-tighter">AR CONTROL</h3>
             <p className="text-xs uppercase tracking-widest opacity-70">Ahorro Editions v3.5</p>
          </div>

          <div className={`w-full h-px ${isDark ? 'bg-hacker-green/30' : 'bg-blue-200'}`} />

          <div className="space-y-1">
             <p className="text-[10px] uppercase opacity-50">Desarrollado por</p>
             <p className={`text-xl font-bold ${isDark ? 'text-hacker-blue' : 'text-blue-600'}`}>ChrisRey91</p>
          </div>

          <div className="space-y-2">
             <p className="text-[10px] uppercase opacity-50">Sitio Oficial</p>
             <a 
               href="https://www.arcontrolinteligente.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className={`flex items-center justify-center gap-2 px-6 py-3 rounded border transition-all hover:scale-105
                 ${isDark 
                   ? 'border-hacker-pink text-hacker-pink hover:bg-hacker-pink hover:text-black' 
                   : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
             >
               <Globe size={16} />
               <span>www.arcontrolinteligente.com</span>
               <ExternalLink size={12} />
             </a>
          </div>

          <p className="text-[10px] opacity-40 pt-4">
             © {new Date().getFullYear()} AR Control Inteligente. Todos los derechos reservados.
          </p>

        </div>
      </div>
    </div>
  );
};