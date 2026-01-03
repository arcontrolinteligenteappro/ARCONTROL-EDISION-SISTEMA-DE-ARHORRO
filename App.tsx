import React, { useState, useEffect, useRef } from 'react';
import { ThemeMode, DepositRecord, UserProfile, ChallengeConfig } from './types';
import { IntroScreen } from './components/IntroScreen';
import { SavingsGrid } from './components/SavingsGrid';
import { Terminal } from './components/Terminal';
import { SavingsReport } from './components/SavingsReport';
import { UserProfileModal } from './components/UserProfileModal';
import { AboutModal } from './components/AboutModal';
import { ChallengeSelector, CHALLENGES } from './components/ChallengeSelector';
import { Activity, Database, Lock, User, X, Globe, FileBarChart, Moon, Sun, Settings, Target, MinusCircle, RefreshCcw, Info } from 'lucide-react';

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode | null>(null);
  
  // Current Active Challenge
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeConfig>(CHALLENGES[0]);

  // Data State
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loanedNumbers, setLoanedNumbers] = useState<number[]>([]); 
  const [history, setHistory] = useState<DepositRecord[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({ name: '', phone: '', address: '', email: '' });
  
  const [showTerminal, setShowTerminal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChallengeSelector, setShowChallengeSelector] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const skipSaveRef = useRef(false);

  // Initial Load
  useEffect(() => {
    const lastTheme = localStorage.getItem('cyberSave_theme');
    const lastChallengeId = localStorage.getItem('cyberSave_lastChallengeId');
    const lastProfile = localStorage.getItem('cyberSave_profile');
    
    if (lastTheme && lastChallengeId) {
       setTheme(lastTheme as ThemeMode);
       const standard = CHALLENGES.find(c => c.id === lastChallengeId);
       if (standard) {
          setCurrentChallenge(standard);
       } else {
          const customConfig = localStorage.getItem(`cyberSave_config_${lastChallengeId}`);
          if (customConfig) {
             try { setCurrentChallenge(JSON.parse(customConfig)); } catch(e){}
          }
       }
    }
    
    if (lastProfile) {
       try { setUserProfile(JSON.parse(lastProfile)); } catch(e){}
    }
  }, []);

  const handleStartApp = (selectedTheme: ThemeMode, initialChallenge: ChallengeConfig) => {
    setTheme(selectedTheme);
    setCurrentChallenge(initialChallenge);
    loadChallengeData(initialChallenge.id);
  };

  const loadChallengeData = (challengeId: string) => {
    const dataKey = `cyberSave_data_${challengeId}`;
    const loansKey = `cyberSave_loans_${challengeId}`;
    const historyKey = `cyberSave_history_${challengeId}`;

    const savedData = localStorage.getItem(dataKey);
    const savedLoans = localStorage.getItem(loansKey);
    const savedHistory = localStorage.getItem(historyKey);

    setSelectedNumbers(savedData ? JSON.parse(savedData) : []);
    setLoanedNumbers(savedLoans ? JSON.parse(savedLoans) : []);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
  };

  // Switch Challenge
  useEffect(() => {
    if (theme) {
      loadChallengeData(currentChallenge.id);
    }
  }, [currentChallenge.id]);

  // Save Data
  useEffect(() => {
    if (theme) { 
      if (skipSaveRef.current) {
        skipSaveRef.current = false;
        return;
      }

      localStorage.setItem('cyberSave_profile', JSON.stringify(userProfile));
      localStorage.setItem('cyberSave_theme', theme);
      localStorage.setItem('cyberSave_lastChallengeId', currentChallenge.id);
      
      localStorage.setItem(`cyberSave_data_${currentChallenge.id}`, JSON.stringify(selectedNumbers));
      localStorage.setItem(`cyberSave_loans_${currentChallenge.id}`, JSON.stringify(loanedNumbers));
      localStorage.setItem(`cyberSave_history_${currentChallenge.id}`, JSON.stringify(history));

      if (currentChallenge.id.startsWith('custom_')) {
         localStorage.setItem(`cyberSave_config_${currentChallenge.id}`, JSON.stringify(currentChallenge));
      }
    }
  }, [selectedNumbers, loanedNumbers, history, userProfile, theme, currentChallenge]);

  // --- STATS CALCULATIONS (Hoisted so handlers can use them) ---
  const calculateGlobalTotal = () => {
    let total = 0;
    const activeIds = new Set(CHALLENGES.map(c => c.id));
    activeIds.add(currentChallenge.id);

    activeIds.forEach(id => {
       const dKey = `cyberSave_data_${id}`;
       const lKey = `cyberSave_loans_${id}`;
       
       let nums: number[] = [];
       let loans: number[] = [];

       if (id === currentChallenge.id) {
         nums = selectedNumbers;
         loans = loanedNumbers;
       } else {
         try { nums = JSON.parse(localStorage.getItem(dKey) || '[]'); } catch(e){}
         try { loans = JSON.parse(localStorage.getItem(lKey) || '[]'); } catch(e){}
       }

       const balance = nums.filter(n => !loans.includes(n)).reduce((a,b) => a+b, 0);
       total += balance;
    });
    return total;
  };

  const totalSavedGross = selectedNumbers.reduce((acc, curr) => acc + curr, 0);
  const loanBalance = loanedNumbers.reduce((acc, curr) => acc + curr, 0);
  const currentBalance = selectedNumbers.filter(n => !loanedNumbers.includes(n)).reduce((a,b)=>a+b,0);
  const globalTotal = calculateGlobalTotal();
  const progress = (currentBalance / currentChallenge.goalAmount) * 100;
  
  const formatMXN = (val: number) => new Intl.NumberFormat('es-MX', { 
    style: 'currency', 
    currency: 'MXN',
    maximumFractionDigits: 0
  }).format(val);

  // --- HANDLERS ---

  const toggleNumber = (num: number) => {
    if (loanedNumbers.includes(num)) {
       // Repay loan logic (remove loan flag)
       setLoanedNumbers(prev => prev.filter(n => n !== num));
       return;
    }

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
      setHistory(prev => prev.filter(record => record.value !== num || record.timestamp === '')); 
    } else {
      setSelectedNumbers(prev => [...prev, num]);
      setHistory(prev => [...prev, { value: num, timestamp: new Date().toISOString(), type: 'deposit' }]);
    }
  };

  const handleWithdraw = () => {
    const amountStr = prompt(`Saldo disponible: ${formatMXN(currentBalance)}\nIngrese la cantidad a retirar (Préstamo):`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
        alert("Cantidad inválida.");
        return;
    }

    if (amount > currentBalance) {
        alert("Fondos insuficientes para este retiro.");
        return;
    }

    const availableNumbers = selectedNumbers
       .filter(n => !loanedNumbers.includes(n))
       .sort((a, b) => b - a); // Take largest first
    
    let remaining = amount;
    const toLoan: number[] = [];

    for (const num of availableNumbers) {
       if (remaining <= 0) break;
       toLoan.push(num);
       remaining -= num;
    }

    setLoanedNumbers(prev => [...prev, ...toLoan]);
    setHistory(prev => [...prev, { value: -amount, timestamp: new Date().toISOString(), type: 'withdrawal' }]);
    
    alert(`Se ha registrado el retiro de $${amount}. Se han marcado ${toLoan.length} casillas en ROJO como 'Préstamo'.`);
  };

  const handleCashOut = () => {
     if (confirm(`¿Estás seguro de COBRAR TODO ($${formatMXN(currentBalance)}) y REINICIAR esta plantilla? Esta acción no se puede deshacer.`)) {
         setSelectedNumbers([]);
         setLoanedNumbers([]);
         setHistory([]);
         alert("¡Felicidades! Has cobrado tus ahorros. La plantilla se ha reiniciado.");
     }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro de cerrar sesión y volver al inicio?")) {
       setTheme(null);
       localStorage.removeItem('cyberSave_theme');
    }
  };

  const handleChallengeChange = (config: ChallengeConfig) => {
    skipSaveRef.current = true;
    setCurrentChallenge(config);
    setShowChallengeSelector(false);
  };

  // Export/Import Logic
  const handleExportJSON = () => {
    const exportData: any = {
       profile: userProfile,
       theme,
       currentChallengeId: currentChallenge.id,
       timestamp: new Date().toISOString(),
       localStorage: {}
    };
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cyberSave_')) {
            exportData.localStorage[key] = localStorage.getItem(key);
        }
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `arcontrol_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
       try {
          const json = JSON.parse(e.target?.result as string);
          if (json.localStorage) {
             Object.entries(json.localStorage).forEach(([k, v]) => {
                localStorage.setItem(k, v as string);
             });
             alert("Respaldo restaurado con éxito. Reiniciando...");
             window.location.reload();
          } else {
             alert("Archivo de respaldo inválido.");
          }
       } catch (err) {
          alert("Error al leer el archivo JSON.");
       }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
     let csvContent = "data:text/csv;charset=utf-8,Fecha,Tipo,Monto\n";
     history.forEach(row => {
        csvContent += `${new Date(row.timestamp).toLocaleDateString()},${row.type || 'deposit'},${row.value}\n`;
     });
     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     link.setAttribute("download", `reporte_${currentChallenge.id}.csv`);
     document.body.appendChild(link);
     link.click();
     link.remove();
  };

  const handleImportCSV = (file: File) => {
     alert("Importar CSV aún no está implementado completamente para la restauración de historial.");
  };

  if (!theme) {
    return <IntroScreen onStart={handleStartApp} />;
  }

  const isDark = theme === 'dark';

  return (
    <div className={`h-full min-h-screen transition-colors duration-500 font-mono flex flex-col overflow-hidden
      ${isDark 
        ? 'bg-gray-900 text-hacker-green selection:bg-hacker-green selection:text-black' 
        : 'bg-slate-50 text-slate-800 selection:bg-indigo-200'
      }`}>
      
      {/* Background Matrix/Grid Overlay */}
      <div className={`fixed inset-0 pointer-events-none z-0 opacity-5 bg-[size:50px_50px]
        ${isDark 
          ? 'bg-[linear-gradient(to_right,#0f0_1px,transparent_1px),linear-gradient(to_bottom,#0f0_1px,transparent_1px)]' 
          : 'bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] opacity-[0.03]'
        }`}></div>

      {/* Header - safe-pt for Notch */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md flex justify-between items-center transition-all animate-slide-up safe-pt
        ${isDark 
          ? 'border-hacker-green/50 bg-black/95' 
          : 'border-indigo-200/50 bg-white/90 shadow-sm'}
        px-3 py-2`}>
        
        <div className="flex items-center gap-2">
          <Database className={`w-5 h-5 ${isDark ? 'animate-pulse text-hacker-pink' : 'text-indigo-600'}`} />
          <div className="leading-none flex flex-col">
            <h1 className="text-xs font-bold opacity-70 tracking-widest">AR CONTROL</h1>
            <span className={`text-base sm:text-lg font-bold tracking-tighter text-transparent bg-clip-text
              ${isDark ? 'bg-gradient-to-r from-hacker-green to-purple-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
              {currentChallenge.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Stats Display (Compact) */}
          <div className="text-right hidden xs:block mr-2">
            <p className="font-bold text-sm text-current">{formatMXN(currentBalance)}</p>
          </div>

          <button 
             onClick={() => setShowChallengeSelector(true)}
             className={`p-1.5 rounded-full transition-all active:scale-90 relative
             ${isDark 
               ? 'bg-gray-800 text-hacker-green border border-hacker-green/30' 
               : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'}`}
          >
             <Target size={14} />
          </button>

          <button 
             onClick={() => setShowProfileModal(true)}
             className={`p-1.5 rounded-full transition-all active:scale-90 relative
             ${isDark 
               ? 'bg-gray-800 text-hacker-blue border border-hacker-blue/30' 
               : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'}`}
          >
             {userProfile.name ? <User size={14} /> : <Settings size={14} className="animate-spin-slow" />}
          </button>

          <button 
             onClick={toggleTheme}
             className={`p-1.5 rounded-full transition-all active:scale-90
             ${isDark 
               ? 'bg-gray-800 text-yellow-300 border border-yellow-300/30' 
               : 'bg-amber-50 text-amber-500 border border-amber-200 hover:bg-amber-100'}`}
          >
             {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

           <button 
            onClick={() => setShowReport(true)}
            className={`p-1.5 border rounded hover:scale-105 active:scale-95
              ${isDark 
                ? 'border-hacker-blue bg-hacker-blue/10 text-hacker-blue' 
                : 'border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100'}`}
          >
            <FileBarChart size={16} />
          </button>

          <button 
            onClick={() => setShowAbout(true)}
            className={`p-1.5 border rounded hover:scale-105 active:scale-95
              ${isDark 
                ? 'border-hacker-pink bg-hacker-pink/10 text-hacker-pink' 
                : 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-600'}`}
          >
            <Info size={16} />
          </button>

          <button 
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-1.5 border rounded hover:scale-105 active:scale-95
              ${isDark 
                ? 'border-hacker-green bg-hacker-green/10' 
                : 'border-slate-300 bg-slate-100 text-slate-700'}`}
          >
            {showTerminal ? <X size={16} /> : <Activity size={16} />}
          </button>
        </div>
      </header>

      {/* Progress Bar - Adjust top pos based on Safe Area if needed, usually css handles it */}
      <div className={`h-1 w-full relative z-40 ${isDark ? 'bg-gray-800' : 'bg-slate-200'}`}>
        <div 
          className={`h-full transition-all duration-700 ease-out 
          ${isDark 
            ? 'bg-hacker-green shadow-[0_0_5px_#0f0]' 
            : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 container mx-auto p-2 flex flex-col gap-2 pb-safe animate-in fade-in zoom-in-95 duration-500">
        
        {/* Compact Stats Bar */}
        <div className={`flex justify-between items-center p-2 border rounded shadow-sm text-xs sm:text-sm backdrop-blur-sm
          ${isDark 
            ? 'border-hacker-green/20 bg-black/60' 
            : 'border-indigo-100 bg-white/70 text-slate-700'}`}>
            <div className="flex items-center gap-2">
              <Lock size={14} className={isDark ? 'text-hacker-blue' : 'text-indigo-500'} />
              <span>META: <span className="font-bold">{formatMXN(currentChallenge.goalAmount)}</span></span>
            </div>
            
            <div className="flex gap-2">
                 <button onClick={handleWithdraw} className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border font-bold hover:scale-105 transition-transform
                    ${isDark ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-red-400 text-red-600 bg-red-50'}`}>
                    <MinusCircle size={10} /> RETIRAR
                 </button>
                 <button onClick={handleCashOut} className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border font-bold hover:scale-105 transition-transform
                    ${isDark ? 'border-yellow-500 text-yellow-500 bg-yellow-900/20' : 'border-amber-400 text-amber-600 bg-amber-50'}`}>
                    <RefreshCcw size={10} /> COBRAR
                 </button>
            </div>
        </div>

        {/* AI Terminal Section */}
        {showTerminal && (
          <div className="animate-in slide-in-from-top-4 duration-300 shadow-2xl">
             <Terminal theme={theme} totalSaved={currentBalance} goal={currentChallenge.goalAmount} />
          </div>
        )}

        {/* Savings Grid */}
        <div className="flex-1 overflow-hidden relative">
          <SavingsGrid 
            theme={theme} 
            totalItems={currentChallenge.totalItems} 
            startNumber={currentChallenge.startNumber}
            selectedNumbers={selectedNumbers} 
            loanedNumbers={loanedNumbers}
            toggleNumber={toggleNumber} 
          />
        </div>

      </main>

      {/* Modals */}
      {showReport && (
        <SavingsReport 
          theme={theme}
          totalSaved={totalSavedGross}
          currentBalance={currentBalance}
          loanBalance={loanBalance}
          globalTotalSaved={globalTotal}
          totalGoal={currentChallenge.goalAmount}
          selectedCount={selectedNumbers.length}
          totalItems={currentChallenge.totalItems}
          history={history}
          userProfile={userProfile}
          onClose={() => setShowReport(false)}
        />
      )}

      {showProfileModal && (
        <UserProfileModal
          theme={theme}
          profile={userProfile}
          onSaveProfile={(p) => setUserProfile(p)}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onExportCSV={handleExportCSV}
          onImportCSV={handleImportCSV}
        />
      )}

      {showAbout && (
        <AboutModal
          theme={theme}
          onClose={() => setShowAbout(false)}
        />
      )}

      {showChallengeSelector && (
        <ChallengeSelector
          theme={theme}
          currentChallengeId={currentChallenge.id}
          onSelect={handleChallengeChange}
          onClose={() => setShowChallengeSelector(false)}
        />
      )}

      {/* Compact Footer - safe-pb for Home Indicator */}
      <footer className={`py-3 text-center text-[10px] border-t mt-auto z-10 relative safe-pb
        ${isDark 
          ? 'border-hacker-green/20 bg-black text-gray-500' 
          : 'border-indigo-100 bg-white text-slate-400'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span className="font-bold tracking-wider">AHORRO 250 {userProfile.name ? `// ${userProfile.name}` : ''}</span>
          <button 
            onClick={() => setShowAbout(true)}
            className={`hover:underline cursor-pointer ${isDark ? 'text-hacker-blue' : 'text-indigo-500'}`}
          >
            ChrisRey91
          </button>
        </div>
      </footer>

    </div>
  );
};

export default App;