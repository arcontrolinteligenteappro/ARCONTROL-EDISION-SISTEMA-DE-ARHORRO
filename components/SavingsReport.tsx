import React from 'react';
import { ThemeMode, DepositRecord, UserProfile } from '../types';
import { X, PieChart, Clock, User, Wallet, Activity, TrendingUp, AlertTriangle, RefreshCcw, Check } from 'lucide-react';

interface SavingsReportProps {
  theme: ThemeMode;
  totalSaved: number;       // Gross saved (ignoring loans)
  currentBalance: number;   // Net saved (minus loans)
  loanBalance: number;      // Amount withdrawn/owed
  globalTotalSaved: number;
  totalGoal: number;
  selectedCount: number;
  totalItems: number;
  history: DepositRecord[];
  userProfile: UserProfile;
  onClose: () => void;
}

export const SavingsReport: React.FC<SavingsReportProps> = ({ 
  theme, totalSaved, currentBalance, loanBalance, globalTotalSaved, totalGoal, selectedCount, totalItems, history, userProfile, onClose 
}) => {
  const isDark = theme === 'dark';
  const progress = (currentBalance / totalGoal) * 100;
  const remaining = totalGoal - currentBalance;
  const formatMXN = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(val);

  // Sort history by date descending
  const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Calculations for Ring Chart
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(0, progress) / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-md relative rounded-lg border-2 shadow-2xl overflow-hidden animate-pop-in flex flex-col max-h-[90vh]
        ${isDark ? 'bg-gray-900 border-hacker-green text-hacker-green' : 'bg-white border-blue-900 text-blue-900'}`}>
        
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center shrink-0
          ${isDark ? 'bg-black/50 border-hacker-green/30' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center gap-2">
            <PieChart size={20} className={isDark ? 'text-hacker-pink' : 'text-blue-600'} />
            <h2 className="text-lg font-bold tracking-wider">BALANCE GENERAL</h2>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Circular Progress */}
          <div className="flex flex-col items-center relative">
             <div className="relative w-48 h-48 mb-4">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className={`opacity-10 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
                 <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
                   strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                   className={`transition-all duration-1000 ease-out ${isDark ? 'text-hacker-green filter drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]' : 'text-blue-600'}`}
                 />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-4xl font-bold">{progress.toFixed(0)}%</span>
                 <span className="text-[10px] opacity-60 uppercase">Disponible</span>
               </div>
             </div>

             {/* Balance Grid */}
             <div className="w-full grid grid-cols-2 gap-3 text-center">
               <div className={`p-2 rounded border col-span-2 ${isDark ? 'bg-hacker-green/10 border-hacker-green' : 'bg-blue-100 border-blue-300'}`}>
                 <p className="text-[10px] uppercase opacity-70">Balance Disponible</p>
                 <p className="text-2xl font-black">{formatMXN(currentBalance)}</p>
               </div>
               
               {loanBalance > 0 && (
                 <div className={`p-2 rounded border col-span-2 flex items-center justify-between px-4 ${isDark ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-red-50 border-red-300 text-red-600'}`}>
                    <div className="text-left">
                       <p className="text-[10px] uppercase font-bold flex items-center gap-1"><AlertTriangle size={10} /> En Préstamo (Retirado)</p>
                       <p className="text-lg font-bold">-{formatMXN(loanBalance)}</p>
                    </div>
                    <span className="text-[10px] opacity-70 italic max-w-[100px] text-right">Falta reponer este dinero</span>
                 </div>
               )}

               <div className={`p-2 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                 <p className="text-[10px] uppercase opacity-70">Acumulado Histórico</p>
                 <p className="text-sm font-bold opacity-80">{formatMXN(totalSaved)}</p>
               </div>
               <div className={`p-2 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                 <p className="text-[10px] uppercase opacity-70">Meta Total</p>
                 <p className="text-sm font-bold opacity-80">{formatMXN(totalGoal)}</p>
               </div>
             </div>
          </div>

          {/* TOTAL GLOBAL SUMMARY */}
          <div className={`p-4 rounded border-l-4 relative overflow-hidden flex items-center justify-between
             ${isDark ? 'bg-gray-800 border-l-yellow-500 text-yellow-500' : 'bg-amber-50 border-l-amber-500 text-amber-800'}`}>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1 flex items-center gap-1">
                 <Wallet size={12} /> Total Global (Todas las Plantillas)
               </p>
               <p className="text-2xl font-black">{formatMXN(globalTotalSaved)}</p>
             </div>
             <TrendingUp size={32} className="opacity-40" />
          </div>

          {/* Detailed Log */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest border-b pb-1 opacity-70 flex items-center gap-2">
              <Clock size={12} /> Historial de Movimientos
            </h3>
            
            <div className={`rounded border overflow-hidden max-h-48 overflow-y-auto custom-scrollbar
               ${isDark ? 'border-hacker-green/20 bg-black/20' : 'border-blue-200 bg-blue-50/50'}`}>
              <table className="w-full text-xs font-mono">
                <tbody>
                  {sortedHistory.map((record, idx) => (
                    <tr key={idx} className={`border-b border-dashed 
                      ${record.type === 'withdrawal' 
                        ? (isDark ? 'text-red-400 bg-red-900/10' : 'text-red-600 bg-red-50') 
                        : (isDark ? 'border-hacker-green/10 hover:bg-hacker-green/5' : 'border-blue-100 hover:bg-blue-50')}`}>
                      <td className="p-2 font-bold flex items-center gap-2">
                        {record.type === 'withdrawal' ? <RefreshCcw size={10} className="rotate-180"/> : <Check size={10}/>}
                        {formatMXN(record.value)}
                      </td>
                      <td className="p-2 text-right opacity-80">
                        {new Date(record.timestamp).toLocaleDateString('es-MX', {day:'2-digit', month:'2-digit'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="p-4 pt-2 shrink-0">
          <button 
            onClick={onClose}
            className={`w-full py-3 font-bold rounded tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]
            ${isDark ? 'bg-hacker-green text-black hover:bg-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            CERRAR REPORTE
          </button>
        </div>

      </div>
    </div>
  );
};