import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Warehouse, 
  TrendingUp, 
  ReceiptText, 
  ArrowUpRight, 
  AlertTriangle, 
  Package, 
  Store as StoreIcon, 
  Clock, 
  Printer, 
  PlusCircle, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReceiptModal } from '../components/transactions/ReceiptModal';
import { Transaction } from '../types';

export const Dashboard: React.FC = () => {
  const { transactions, products, expenses, stores, getLiveProductStock } = useApp();
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // Perhitungan Keuangan & Statistik
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.total_amount || 0), 0);
  const totalHpp = transactions.reduce((acc, t) => acc + (t.total_hpp || 0), 0);
  const grossProfit = totalRevenue - totalHpp;
  const totalExpense = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netProfit = grossProfit - totalExpense;

  // Filter transaksi hari ini
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.transaction_date === todayStr);
  const todayRevenue = todayTransactions.reduce((acc, t) => acc + (t.total_amount || 0), 0);

  // Status Stok Gudang Real-time
  const productStockStatuses = products.map(p => {
    const live = getLiveProductStock(p.id);
    return {
      ...p,
      liveBoxes: live.remainingBoxes,
      livePieces: live.remainingPieces,
      isOutOfStock: live.isOutOfStock,
    };
  });

  const outOfStockCount = productStockStatuses.filter(p => p.liveBoxes <= 0).length;
  const lowStockCount = productStockStatuses.filter(p => p.liveBoxes > 0 && p.liveBoxes <= 5).length;
  const totalBoxesInWarehouse = productStockStatuses.reduce((acc, p) => acc + p.liveBoxes, 0);

  // Format Mata Uang IDR
  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-stone-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-semibold backdrop-blur-sm mb-3">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-white mb-2">
              Distribusi Roti Aoka Official
            </h1>
            <p className="text-amber-100/90 text-sm max-w-xl">
              Sistem kasir distribusi multi-toko terpusat, kontrol batch FIFO gudang real-time, dan kalkulasi otomatis profit toko mitra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/transactions/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Nota Baru</span>
            </Link>
            <Link
              to="/inventory/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm backdrop-blur-sm border border-white/20 transition-all"
            >
              <Warehouse className="w-4 h-4" />
              <span>Masuk Stok Gudang</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Penjualan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mb-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">{todayTransactions.length} nota hari ini</span>
            <span>({formatRupiah(todayRevenue)})</span>
          </div>
        </div>

        {/* Card 2: Stok Total Gudang */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sisa Stok Gudang</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Warehouse className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 mb-1">
            {totalBoxesInWarehouse.toLocaleString('id-ID')} <span className="text-sm font-normal text-stone-500">Dus</span>
          </div>
          <div className="text-xs flex items-center gap-2">
            {outOfStockCount > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {outOfStockCount} varian habis
              </span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Semua varian ready
              </span>
            )}
            {lowStockCount > 0 && (
              <span className="text-amber-600 font-medium">({lowStockCount} menipis)</span>
            )}
          </div>
        </div>

        {/* Card 3: Laba Bersih */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Estimasi Laba Bersih</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 mb-1">
            {formatRupiah(netProfit)}
          </div>
          <div className="text-xs text-stone-500">
            Laba kotor: {formatRupiah(grossProfit)}
          </div>
        </div>

        {/* Card 4: Pengeluaran Operasional */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Beban Operasional</span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-rose-700 mb-1">
            {formatRupiah(totalExpense)}
          </div>
          <div className="text-xs text-stone-500">
            {expenses.length} catatan pengeluaran operasional
          </div>
        </div>
      </div>

      {/* Stock Alert Warning Banner if any variant is 0 Dus */}
      {outOfStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-bold mb-1">Perhatian: {outOfStockCount} varian roti saat ini 0 Dus (Stok Habis)</div>
            <div className="text-xs text-amber-800 flex flex-wrap gap-2">
              {productStockStatuses
                .filter(p => p.liveBoxes <= 0)
                .map(p => (
                  <span key={p.id} className="px-2 py-0.5 bg-amber-200/70 rounded-md font-semibold text-amber-950">
                    {p.name}
                  </span>
                ))}
            </div>
            <p className="text-[11px] text-amber-700 mt-2">
              Pada menu kasir transaksi, varian habis otomatis ditandai badge merah dan dapat ditukar (1-click swap) ke varian lain yang ready.
            </p>
          </div>
          <Link
            to="/inventory/create"
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            Restock
          </Link>
        </div>
      )}

      {/* Main Grid: Recent Transactions & Warehouse Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions (2 cols on large) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">Transaksi Distribusi Terkini</h2>
              <p className="text-xs text-stone-500">Daftar pesanan toko mitra & pembeli</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-[11px] font-semibold uppercase text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">No. Nota</th>
                  <th className="px-4 py-3">Toko / Pembeli</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {transactions.slice(0, 7).map(tx => (
                  <tr key={tx.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-amber-900">
                      {tx.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{tx.store_name || tx.buyer_name}</div>
                      <div className="text-[11px] text-stone-500">{tx.details?.length || 0} varian</div>
                    </td>
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">
                      {formatRupiah(tx.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.payment_method === 'tunai' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.payment_method === 'transfer'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {tx.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedTxForReceipt(tx)}
                        title="Cetak Struk"
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-amber-700 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">
                      Belum ada transaksi distribusi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Mini Stock Snapshot & Quick Stores */}
        <div className="space-y-6">
          {/* Quick Warehouse Stock List */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">Status Gudang Roti</h3>
                <p className="text-[11px] text-stone-500">21 varian Aoka terkini</p>
              </div>
              <Link to="/inventory" className="text-xs text-amber-700 font-semibold hover:underline">
                Kelola
              </Link>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {productStockStatuses.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-stone-50/70 border border-stone-200/60 text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-stone-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-500">{p.category_name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      p.liveBoxes <= 0
                        ? 'bg-rose-100 text-rose-700'
                        : p.liveBoxes <= 5
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {p.liveBoxes} Dus ({p.livePieces} bks)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Toko Mitra Overview */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif font-bold text-stone-900 text-base">Toko Mitra Terdaftar</h3>
              <Link to="/stores" className="text-xs text-amber-700 font-semibold hover:underline">
                Semua ({stores.length})
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              {stores.slice(0, 4).map(st => (
                <div key={st.id} className="flex items-center justify-between p-2 rounded-xl border border-stone-100 hover:bg-stone-50">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {st.store_code.substring(0, 2)}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-stone-800 truncate">{st.store_name}</p>
                      <p className="text-[10px] text-stone-500">{st.contact_person || st.address || 'Mitra Agen'}</p>
                    </div>
                  </div>
                  <Link
                    to={`/transactions/create?storeId=${st.id}`}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px] shrink-0"
                  >
                    + Nota
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedTxForReceipt && (
        <ReceiptModal
          transaction={selectedTxForReceipt}
          isOpen={!!selectedTxForReceipt}
          onClose={() => setSelectedTxForReceipt(null)}
        />
      )}
    </div>
  );
};
