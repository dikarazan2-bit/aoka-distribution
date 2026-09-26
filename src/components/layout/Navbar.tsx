import React from 'react';
import { Menu, Database, Cloud, HardDrive, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { products, isSupabaseOnline } = useApp();

  const totalBoxes = products.reduce((acc, p) => acc + (p.boxes_stock || 0), 0);
  const todayStr = new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#ece3d9] px-4 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 font-medium">
          <Calendar className="w-4 h-4 text-amber-700" />
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Stok Gudang Quick Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium shadow-2xs">
          <span className="material-symbols-outlined text-base text-amber-700">warehouse</span>
          <span className="hidden md:inline">Stok Gudang:</span>
          <strong className="font-mono text-amber-800 font-bold">{totalBoxes.toLocaleString('id-ID')} Dus</strong>
        </div>

        {/* Database Status Pill */}
        {isSupabaseOnline ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800 shadow-2xs" title="Terkoneksi ke Database Supabase Cloud">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Supabase Cloud</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] font-semibold text-stone-700 shadow-2xs" title="Berjalan dalam mode lokal offline (LocalStorage)">
            <HardDrive className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Lokal Offline</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
        )}
      </div>
    </header>
  );
};
