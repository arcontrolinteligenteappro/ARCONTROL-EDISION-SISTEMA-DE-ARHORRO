import React, { useState } from 'react';
import { ShieldCheck, Monitor, Terminal, ArrowRight, Settings, Calculator, Hash, ArrowLeft } from 'lucide-react';
import { ThemeMode, ChallengeConfig } from '../types';
import { CHALLENGES } from './ChallengeSelector';

interface IntroProps {
  onStart: (theme: ThemeMode, initialChallenge: ChallengeConfig) => void;
}

export const IntroScreen: React.FC<IntroProps> = ({ onStart }) => {
  const [step, setStep] = useState<'theme' | 'challenge'>('theme');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('dark');
  
  // Custom Challenge State
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customStart, setCustomStart] = useState<string>('1');
  const [customEnd, setCustomEnd] = useState<string>('100');

  const handleThemeSelect = (theme: ThemeMode) => {
    setSelectedTheme(theme);
    setStep('challenge');
  };

  const handleCustomStart = () => {
    const start = parseInt(customStart);
    const end = parseInt(customEnd);

    if (isNaN(start) || isNaN(end) || start >= end) {
      alert("Por favor ingresa un rango válido (Inicio < Fin).");
      return;
    }

    const count = end - start + 1;
    // Sum of arithmetic progression: n/2 * (first + last)
    const goal = (count / 2) * (start + end);

    const customConfig: ChallengeConfig = {
      id: `custom_${Date.now()}`,
      name: 'MISIÓN PERSONAL',
      description: `Reto personalizado de ${start} a ${end}`,
      startNumber: start,
      endNumber: end,
      totalItems: count,
      goalAmount: goal
    };

    onStart(selectedTheme, customConfig);
  };

  const calculatePreview = () => {
    const start = parseInt(customStart) || 0;
    const end = parseInt(customEnd) || 0;
    if (start >= end) return { count: 0, goal: 0 };
    const count = end - start + 1;
    const goal = (count / 2) * (start + end);
    return { count, goal };
  };

  const preview = calculatePreview();
  const isDark = selectedTheme === 'dark';

  return (
    <div className={`min-h-screen font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-500
      ${step === 'theme' ? 'bg-black text-green-500' : (isDark ? 'bg-gray-900 text-hacker-green' : 'bg-slate-50 text-slate-800')}
    `}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=10')] bg-cover bg-center mix-blend-overlay"></div>
      <div className={`absolute inset-0 z-10 bg-[length:100%_2px,3px_100%] pointer-events-none
        ${step === 'theme' 
           ? 'bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]' 
           : ''}
      `}></div>

      <div className="z-20 w-full max-w-md text-center flex-1 flex flex-col justify-center animate-pop-in">
        
        {/* Title Block */}
        <div className="space-y-2 mb-8">
          <Terminal size={48} className={`mx-auto mb-4 ${step === 'theme' ? 'text-hacker-green' : (isDark ? 'text-hacker-green' : 'text-indigo-600')}`} />
          <h1 className="text-4xl font-bold tracking-tighter uppercase glitch-effect leading-none">
            AR CONTROL
          </h1>
          <h2 className={`text-3xl font-bold tracking-widest ${step === 'theme' ? 'text-hacker-blue' : (isDark ? 'text-hacker-blue' : 'text-indigo-500')}`}>
            AHORRO SYSTEM
          </h2>
          <p className="text-sm opacity-60 mt-4 tracking-wider">
            SISTEMA FINANCIERO MXN V.3.0
          </p>
        </div>

        {/* STEP 1: THEME SELECTION */}
        {step === 'theme' && (
          <div className="flex flex-col items-center gap-4 w-full animate-slide-up">
            <p className="text-xs uppercase opacity-50 mb-2">Paso 1: Seleccione Interfaz</p>
            
            <div className="flex justify-center gap-4 w-full px-8">
              <button
                onClick={() => handleThemeSelect('dark')}
                className="flex-1 border border-hacker-green bg-black/80 hover:bg-hacker-green text-hacker-green hover:text-black transition-all duration-300 py-3 px-4 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase hover:shadow-[0_0_15px_rgba(0,255,0,0.5)]"
              >
                <ShieldCheck size={16} />
                Dark Ops
              </button>

              <button
                onClick={() => handleThemeSelect('light')}
                className="flex-1 border border-hacker-blue bg-gray-900/80 hover:bg-hacker-blue text-hacker-blue hover:text-black transition-all duration-300 py-3 px-4 rounded flex items-center justify-center gap-2 text-xs font-bold uppercase hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]"
              >
                <Monitor size={16} />
                Corp Light
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHALLENGE SELECTION */}
        {step === 'challenge' && (
          <div className="flex flex-col items-center gap-4 w-full animate-slide-up">
             <button onClick={() => setStep('theme')} className="self-start text-[10px] flex items-center gap-1 opacity-50 hover:opacity-100 mb-2">
               <ArrowLeft size={12} /> VOLVER
             </button>
            
            <p className="text-xs uppercase opacity-70 mb-1">Paso 2: Elija su Misión</p>

            {!showCustomForm ? (
              <div className="w-full space-y-3 px-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {CHALLENGES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onStart(selectedTheme, c)}
                    className={`w-full text-left p-3 rounded border transition-all hover:scale-[1.02]
                      ${isDark 
                        ? 'bg-black/40 border-hacker-green/30 hover:border-hacker-green hover:bg-hacker-green/10' 
                        : 'bg-white border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 shadow-sm'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold">{c.name}</span>
                      <ArrowRight size={14} />
                    </div>
                    <div className="flex justify-between text-[10px] opacity-70">
                       <span>{c.totalItems} depósitos</span>
                       <span>Meta: ${c.goalAmount.toLocaleString()}</span>
                    </div>
                  </button>
                ))}

                <button
                   onClick={() => setShowCustomForm(true)}
                   className={`w-full p-3 rounded border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold
                     ${isDark ? 'border-hacker-pink text-hacker-pink' : 'border-fuchsia-500 text-fuchsia-600'}`}
                >
                  <Settings size={14} /> CREAR RETO PERSONALIZADO
                </button>
              </div>
            ) : (
              // CUSTOM FORM
              <div className={`w-full p-6 rounded-lg border shadow-xl relative
                ${isDark ? 'bg-black/60 border-hacker-pink' : 'bg-white border-fuchsia-200'}`}>
                
                <button onClick={() => setShowCustomForm(false)} className="absolute top-2 right-2 opacity-50 hover:opacity-100">
                  <ArrowLeft size={16} />
                </button>

                <h3 className={`text-sm font-bold uppercase mb-4 flex items-center gap-2 ${isDark ? 'text-hacker-pink' : 'text-fuchsia-600'}`}>
                   <Calculator size={16} /> Configuración
                </h3>

                <div className="flex gap-4 mb-4">
                   <div className="flex-1">
                     <label className="text-[10px] opacity-70 block mb-1">INICIO ($)</label>
                     <div className="relative">
                       <Hash size={12} className="absolute left-2 top-3 opacity-50" />
                       <input 
                         type="number" 
                         value={customStart}
                         onChange={(e) => setCustomStart(e.target.value)}
                         className={`w-full py-2 pl-6 rounded border bg-transparent outline-none
                           ${isDark ? 'border-gray-700 focus:border-hacker-pink' : 'border-gray-200 focus:border-fuchsia-500'}`}
                       />
                     </div>
                   </div>
                   <div className="flex-1">
                     <label className="text-[10px] opacity-70 block mb-1">FINAL ($)</label>
                     <div className="relative">
                       <Hash size={12} className="absolute left-2 top-3 opacity-50" />
                       <input 
                         type="number" 
                         value={customEnd}
                         onChange={(e) => setCustomEnd(e.target.value)}
                         className={`w-full py-2 pl-6 rounded border bg-transparent outline-none
                           ${isDark ? 'border-gray-700 focus:border-hacker-pink' : 'border-gray-200 focus:border-fuchsia-500'}`}
                       />
                     </div>
                   </div>
                </div>

                <div className={`p-3 rounded mb-4 text-center ${isDark ? 'bg-hacker-pink/10' : 'bg-fuchsia-50'}`}>
                   <p className="text-[10px] opacity-70 uppercase mb-1">Proyección</p>
                   <p className="text-xl font-bold">${preview.goal.toLocaleString()}</p>
                   <p className="text-[10px] opacity-60">{preview.count} depósitos totales</p>
                </div>

                <button 
                  onClick={handleCustomStart}
                  className={`w-full py-3 rounded font-bold uppercase text-xs transition-all hover:scale-[1.02]
                    ${isDark 
                      ? 'bg-hacker-pink text-black hover:bg-white' 
                      : 'bg-fuchsia-600 text-white hover:bg-fuchsia-700'}`}
                >
                  INICIAR SISTEMA
                </button>

              </div>
            )}

          </div>
        )}

      </div>

      <div className="z-20 text-[10px] opacity-40 mt-auto pb-4 pt-4 w-full text-center">
        ChrisRey91 - www.arcontrolinteligente.com
      </div>
    </div>
  );
};