import React, { useMemo, useRef } from 'react';
import { ThemeMode } from '../types';
import { Check, AlertTriangle } from 'lucide-react';

interface SavingsGridProps {
  theme: ThemeMode;
  totalItems: number;
  startNumber: number;
  selectedNumbers: number[]; // Green (Saved)
  loanedNumbers: number[];   // Red (Withdrawn/Loaned)
  toggleNumber: (num: number) => void;
}

export const SavingsGrid: React.FC<SavingsGridProps> = ({ 
  theme, totalItems, startNumber, selectedNumbers, loanedNumbers, toggleNumber 
}) => {
  const isDark = theme === 'dark';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Create zones of 50 numbers (dynamic based on totalItems)
  const zones = useMemo(() => {
    const chunks = [];
    const chunkSize = 50;
    
    for (let i = 0; i < totalItems; i += chunkSize) {
      const zoneStartVal = startNumber + i;
      const countInZone = Math.min(chunkSize, totalItems - i);
      const zoneEndVal = zoneStartVal + countInZone - 1;
      
      const numbersInZone = Array.from({ length: countInZone }, (_, k) => zoneStartVal + k);

      chunks.push({
        start: zoneStartVal,
        end: zoneEndVal,
        numbers: numbersInZone
      });
    }
    return chunks;
  }, [totalItems, startNumber]);

  const scrollToZone = (index: number) => {
    const element = document.getElementById(`zone-${index}`);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getButtonClass = (num: number, isSelected: boolean, isLoaned: boolean) => {
    let classes = "aspect-square flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold border transition-all duration-300 active:scale-90 touch-manipulation rounded-md relative overflow-hidden ";

    if (isLoaned) {
      // LOANED STATE (Withdrawn) - Red/Orange warning look
      classes += isDark
        ? 'bg-red-900/40 border-red-500 text-red-500 shadow-[0_0_10px_rgba(255,0,0,0.4)] animate-pulse-slow '
        : 'bg-red-100 border-red-400 text-red-600 shadow-sm ';
    } else if (isSelected) {
      // SAVED STATE - Green/Blue/Pink
      if (num % 3 === 0) {
        classes += isDark 
          ? 'bg-hacker-green/30 text-white border-hacker-green shadow-[0_0_10px_rgba(0,255,0,0.3)] ' 
          : 'bg-emerald-500/80 text-white border-emerald-600 shadow-md ';
      } else if (num % 3 === 1) {
        classes += isDark 
          ? 'bg-hacker-blue/30 text-white border-hacker-blue shadow-[0_0_10px_rgba(0,240,255,0.3)] ' 
          : 'bg-cyan-500/80 text-white border-cyan-600 shadow-md ';
      } else {
        classes += isDark 
          ? 'bg-hacker-pink/30 text-white border-hacker-pink shadow-[0_0_10px_rgba(255,0,60,0.3)] ' 
          : 'bg-fuchsia-500/80 text-white border-fuchsia-600 shadow-md ';
      }
    } else {
      // UNSELECTED STATE
      classes += isDark 
        ? 'bg-black/40 border-hacker-green/20 text-hacker-green/40 hover:border-hacker-green hover:text-hacker-green ' 
        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 shadow-sm ';
    }
    return classes;
  };

  return (
    <div className="flex h-full gap-2 relative">
      
      {/* Scrollable Grid Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pr-1 pb-10 scroll-smooth custom-scrollbar"
      >
        <div className={`p-2 sm:p-4 rounded-lg border w-full backdrop-blur-sm shadow-xl min-h-full
          ${isDark ? 'border-hacker-green/10 bg-black/50' : 'border-indigo-100 bg-white/60'}`}>
          
          {zones.map((zone, idx) => (
            <div key={idx} id={`zone-${idx}`} className="mb-6 last:mb-0">
              <div className={`text-[10px] font-bold mb-2 pl-1 flex items-center gap-2 opacity-60
                ${isDark ? 'text-hacker-green' : 'text-indigo-900'}`}>
                <span>SECTOR {idx + 1}</span>
                <span className="h-px flex-1 bg-current opacity-30"></span>
                <span>{zone.start}-{zone.end}</span>
              </div>
              
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                {zone.numbers.map((num) => {
                  const isSelected = selectedNumbers.includes(num);
                  const isLoaned = loanedNumbers.includes(num);

                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      className={getButtonClass(num, isSelected, isLoaned)}
                    >
                      <span className="z-10 relative">{num}</span>
                      
                      {/* Checkmark for Saved */}
                      {isSelected && !isLoaned && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                            <Check size={24} strokeWidth={4} />
                         </div>
                      )}

                      {/* Warning for Loaned */}
                      {isLoaned && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none text-red-500">
                            <AlertTriangle size={20} strokeWidth={3} />
                         </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Nav Sidebar */}
      {zones.length > 0 && (
        <div className={`w-8 sm:w-10 shrink-0 flex flex-col justify-center gap-1 py-4 rounded-full my-auto h-fit
          ${isDark ? 'bg-black/80 border border-hacker-green/20' : 'bg-white/90 border border-indigo-100 shadow-lg'}`}>
          
          {zones.map((zone, idx) => {
            const hasSaved = zone.numbers.some(n => selectedNumbers.includes(n));
            const hasLoans = zone.numbers.some(n => loanedNumbers.includes(n));
            const isFull = zone.numbers.every(n => selectedNumbers.includes(n) && !loanedNumbers.includes(n));
            
            return (
              <button
                key={idx}
                onClick={() => scrollToZone(idx)}
                className="group relative flex items-center justify-center w-full h-8 sm:h-10 hover:bg-opacity-10 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-150
                  ${hasLoans
                    ? 'bg-red-500 animate-pulse'
                    : isFull 
                      ? (isDark ? 'bg-hacker-green shadow-[0_0_8px_#0f0]' : 'bg-emerald-500 shadow-sm') 
                      : hasSaved 
                        ? (isDark ? 'bg-hacker-blue' : 'bg-indigo-400') 
                        : (isDark ? 'bg-gray-700' : 'bg-slate-200')}
                `}></div>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};