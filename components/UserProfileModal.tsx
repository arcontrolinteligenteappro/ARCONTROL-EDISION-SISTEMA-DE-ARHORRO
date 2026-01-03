import React, { useState, useRef } from 'react';
import { UserProfile, ThemeMode } from '../types';
import { X, Save, Upload, Download, LogOut, User, MapPin, Phone, Mail, Shield, AlertTriangle, FileSpreadsheet, FileJson } from 'lucide-react';

interface UserProfileModalProps {
  theme: ThemeMode;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
  onLogout: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onExportCSV: () => void;
  onImportCSV: (file: File) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  theme, profile, onSaveProfile, onClose, onLogout, onExportJSON, onImportJSON, onExportCSV, onImportCSV
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJSON(e.target.files[0]);
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const inputClass = `w-full bg-transparent border-b outline-none py-2 font-mono text-sm transition-all duration-300 focus:border-b-2
    ${isDark 
      ? 'border-hacker-green/30 focus:border-hacker-green text-hacker-green placeholder-hacker-green/30' 
      : 'border-blue-900/30 focus:border-blue-600 text-blue-900 placeholder-blue-900/30'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`w-full max-w-lg relative rounded-lg border-2 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-pop-in flex flex-col max-h-[90vh]
        ${isDark ? 'bg-gray-900 border-hacker-green text-hacker-green' : 'bg-white border-blue-900 text-blue-900'}`}>
        
        {/* Header with Scan Effect */}
        <div className="relative overflow-hidden p-4 border-b shrink-0 flex justify-between items-center">
          {isDark && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-hacker-green/10 to-transparent animate-slide-up pointer-events-none opacity-20" />}
          
          <div className="flex items-center gap-2 z-10">
            <Shield size={20} className={isDark ? 'text-hacker-blue' : 'text-blue-600'} />
            <h2 className="text-lg font-bold tracking-widest uppercase">Gestión de Usuario</h2>
          </div>
          <button onClick={onClose} className="hover:scale-110 transition-transform z-10">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Personal Data Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4 opacity-70 border-b pb-1">
              <User size={16} />
              <h3 className="text-xs font-bold uppercase">Datos Personales</h3>
            </div>
            
            <div className="space-y-4">
              <div className="relative group">
                <User size={14} className="absolute left-0 top-3 opacity-50" />
                <input 
                  type="text" name="name" placeholder="Nombre Completo" 
                  value={formData.name} onChange={handleChange} 
                  className={`${inputClass} pl-6`} 
                />
              </div>
              <div className="relative group">
                <Phone size={14} className="absolute left-0 top-3 opacity-50" />
                <input 
                  type="tel" name="phone" placeholder="Teléfono" 
                  value={formData.phone} onChange={handleChange} 
                  className={`${inputClass} pl-6`} 
                />
              </div>
              <div className="relative group">
                <Mail size={14} className="absolute left-0 top-3 opacity-50" />
                <input 
                  type="email" name="email" placeholder="Correo Electrónico" 
                  value={formData.email} onChange={handleChange} 
                  className={`${inputClass} pl-6`} 
                />
              </div>
              <div className="relative group">
                <MapPin size={14} className="absolute left-0 top-3 opacity-50" />
                <input 
                  type="text" name="address" placeholder="Dirección / Ubicación" 
                  value={formData.address} onChange={handleChange} 
                  className={`${inputClass} pl-6`} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-2 mt-4 font-bold border rounded flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]
              ${isDark ? 'border-hacker-green bg-hacker-green/10 hover:bg-hacker-green text-hacker-green hover:text-black' : 'border-blue-600 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white'}`}
            >
              <Save size={16} /> GUARDAR DATOS
            </button>
          </form>

          {/* Database Management */}
          <div className={`p-4 rounded border ${isDark ? 'bg-black/40 border-hacker-blue/30' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-4 opacity-70 border-b pb-1">
              <AlertTriangle size={16} />
              <h3 className="text-xs font-bold uppercase">Base de Datos (Respaldo)</h3>
            </div>
            
            <p className="text-[10px] mb-4 opacity-70">
              Gestione sus datos. Use JSON para copias de seguridad completas o CSV para Excel.
            </p>

            {/* JSON Section */}
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase mb-2 opacity-50">Respaldo Completo (JSON)</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onExportJSON}
                  className={`py-3 px-2 rounded border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-opacity-20
                  ${isDark ? 'border-hacker-blue text-hacker-blue hover:bg-hacker-blue' : 'border-blue-500 text-blue-600 hover:bg-blue-100'}`}
                >
                  <FileJson size={20} />
                  EXPORTAR JSON
                </button>

                <button 
                  onClick={() => jsonInputRef.current?.click()}
                  className={`py-3 px-2 rounded border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-opacity-20
                  ${isDark ? 'border-hacker-pink text-hacker-pink hover:bg-hacker-pink' : 'border-purple-500 text-purple-600 hover:bg-purple-100'}`}
                >
                  <Upload size={20} />
                  IMPORTAR JSON
                </button>
                <input 
                  type="file" 
                  ref={jsonInputRef} 
                  onChange={handleJsonFileChange} 
                  accept=".json" 
                  className="hidden" 
                />
              </div>
            </div>

            {/* CSV Section */}
            <div>
              <p className="text-[10px] font-bold uppercase mb-2 opacity-50">Datos del Reto Actual (Excel/CSV)</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onExportCSV}
                  className={`py-3 px-2 rounded border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-opacity-20
                  ${isDark ? 'border-green-500 text-green-500 hover:bg-green-500' : 'border-green-600 text-green-700 hover:bg-green-100'}`}
                >
                  <FileSpreadsheet size={20} />
                  EXPORTAR CSV
                </button>

                <button 
                  onClick={() => csvInputRef.current?.click()}
                  className={`py-3 px-2 rounded border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-opacity-20
                  ${isDark ? 'border-yellow-500 text-yellow-500 hover:bg-yellow-500' : 'border-amber-500 text-amber-700 hover:bg-amber-100'}`}
                >
                  <Upload size={20} />
                  IMPORTAR CSV
                </button>
                <input 
                  type="file" 
                  ref={csvInputRef} 
                  onChange={handleCsvFileChange} 
                  accept=".csv" 
                  className="hidden" 
                />
              </div>
            </div>

          </div>

          {/* Session */}
          <div className="pt-2 border-t border-dashed opacity-80 hover:opacity-100 transition-opacity">
            <button 
              onClick={onLogout}
              className="w-full py-3 text-xs font-bold uppercase flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};