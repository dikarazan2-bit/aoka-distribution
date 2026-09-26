import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Warehouse, 
  PlusCircle, 
  Search, 
  Calendar, 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  CheckCircle2,
  Boxes
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryList: React.FC = () => {
  const { batches, products, getLiveProductStock } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');

  // Summary Metrics
  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => {
      const live = getLiveProductStock(p.id);
      const estHpp = p.price_per_bungkus * 0.85;
      return acc + (live.remainingPieces * estHpp);
    }, 0);
  }, [products, getLiveProductStock]);

  const totalWarehouseBoxes = useMemo(() => {
    return products.reduce((acc, p) => {
      const live = getLiveProductStock(p.id);
      return acc + live.remainingBoxes;
    }, 0);
  }, [products, getLiveProductStock]);

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchSearch = b.batch_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.product_name && b.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchProduct = selectedProductFilter === 'all' || b.product_id.toString() === selectedProductFilter;
      return matchSearch && matchProduct;
    });
  }, [batches, searchTerm, selectedProductFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Manajemen Persediaan Gudang</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Gudang & Batch FIFO Roti Aoka
          </h1>
          <p className="text-xs text-stone-500">
            Monitoring batch kedatangan pabrik, pelacakan tanggal kadaluarsa (EXP), dan alokasi stok keluar otomatis (First In, First Out).
          </p>
        </div>

        <Link
          to="/inventory/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Masuk Stok / Batch Baru</span>
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Total Stok Fisik Gudang
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {totalWarehouseBoxes.toLocaleString('id-ID')} <span className="text-sm font-normal text-stone-500">Dus</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Tersedia untuk pengiriman distributor
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Estimasi Nilai Aset Stok
          </div>
          <div className="text-2xl font-serif font-bold text-amber-900">
            Rp {totalValuation.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Dihitung berdasarkan HPP batch FIFO
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Total Batch Aktif
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {batches.length} <span className="text-sm font-normal text-stone-500">Lot Masuk</span>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sistem FIFO Aktif
          </div>
        </div>
      </div>

      {/* Real-time Variant Stock Health Grid */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-stone-900 text-base">
          Status Ketersediaan 21 Varian Roti di Gudang
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {products.map(p => {
            const live = getLiveProductStock(p.id);
            const isZero = live.remainingBoxes <= 0;
            return (
              <div 
                key={p.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isZero
                    ? 'border-rose-300 bg-rose-50 text-rose-900'
                    : live.remainingBoxes <= 5
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : 'border-stone-200 bg-stone-50/70 text-stone-800'
                }`}
              >
                <div className="text-[11px] font-bold truncate mb-1" title={p.name}>
                  {p.flavor}
                </div>
                <div className="text-base font-bold font-serif">
                  {live.remainingBoxes} <span className="text-[10px] font-normal">Dus</span>
                </div>
                <div className="text-[10px] opacity-75">
                  {live.remainingPieces} bks
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Daftar Batch Masuk FIFO</h3>
            <p className="text-xs text-stone-500">Urutan alokasi barang keluar berdasar tanggal pembelian</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari kode batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">Semua Varian</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-[11px] font-semibold uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Kode Batch</th>
                <th className="px-4 py-3">Varian Roti</th>
                <th className="px-4 py-3 text-right">Stok Awal</th>
                <th className="px-4 py-3 text-right">Sisa Stok</th>
                <th className="px-4 py-3 text-right">HPP Satuan</th>
                <th className="px-4 py-3">Tgl Masuk</th>
                <th className="px-4 py-3">Kadaluarsa (EXP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBatches.map(b => (
                <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-amber-900">
                    {b.batch_code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-900">
                    {b.product_name}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-600">
                    {b.initial_stock.toLocaleString('id-ID')} bks
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">
                    {b.current_stock.toLocaleString('id-ID')} bks
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-stone-700">
                    Rp {b.buy_price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                    {b.purchased_at}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.exp_date ? (
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-medium text-[11px]">
                        {b.exp_date}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                    Tidak ada batch persediaan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
