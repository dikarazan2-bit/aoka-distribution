import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  History, 
  Package, 
  Store as StoreIcon, 
  Warehouse, 
  Undo2, 
  ReceiptText, 
  Store,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      group: 'UTAMA',
      items: [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/transactions/create', label: 'Catat Transaksi Baru', icon: ShoppingBag, badge: 'Kasir' },
        { to: '/transactions', label: 'Riwayat Transaksi Toko', icon: History },
      ]
    },
    {
      group: 'MASTER & OPERASIONAL',
      items: [
        { to: '/products', label: 'Master Produk (21 Roti)', icon: Package },
        { to: '/stores', label: 'Master Toko Mitra', icon: StoreIcon },
        { to: '/inventory', label: 'Gudang & Batch FIFO', icon: Warehouse },
        { to: '/returns', label: 'Retur Roti Aoka', icon: Undo2 },
        { to: '/expenses', label: 'Biaya Operasional', icon: ReceiptText },
      ]
    },
    {
      group: 'KATALOG PUBLIK',
      items: [
        { to: '/shop', label: 'Katalog Roti Publik', icon: Store, badge: 'Web' },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-[#ece3d9] flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#ece3d9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-2xl">bakery_dining</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-base text-amber-900 tracking-tight leading-tight">ROTI AOKA</h1>
              <p className="text-[11px] text-amber-700 font-medium">Distribution ERP Cloud</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 lg:hidden"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Cloud Badge */}
        <div className="mx-3 mt-3 p-2 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold">Cloud Edition</span> (Vercel & Supabase)
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {navItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                {group.group}
              </div>
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={idx}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) => `
                      flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group
                      ${isActive 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-100 text-amber-900">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-[#ece3d9] bg-stone-50/70 text-[11px] text-stone-500">
          <div className="flex items-center justify-between">
            <span className="font-medium">PT Indonesia Bakery Family</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Aktif</span>
          </div>
        </div>
      </aside>
    </>
  );
};
