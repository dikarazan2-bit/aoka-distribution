import React, { useState } from 'react';
import { 
  Undo2, 
  Plus, 
  Search, 
  Calendar, 
  AlertTriangle, 
  Trash2, 
  RefreshCcw, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReturnItem } from '../../types';

export const ReturnList: React.FC = () => {
  const { returns, products, stores, addReturn } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Omit<ReturnItem, 'id'>>({
    store_name: stores[0]?.store_name || '',
    product_name: products[0]?.name || '',
    product_id: products[0]?.id || 1,
    qty: 10,
    reason: 'expired',
    condition_status: 'expired',
    action_taken: 'waste',
    loss_amount: 18000,
    return_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Filtered Returns
  const filteredReturns = returns.filter(r => 
    r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.store_name && r.store_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Summary Metrics
  const totalWasteLoss = returns
    .filter(r => r.action_taken === 'waste')
    .reduce((acc, r) => acc + (r.loss_amount || 0), 0);

  const totalReturnedPieces = returns.reduce((acc, r) => acc + (r.qty || 0), 0);

  const handleOpenAdd = () => {
    const defaultProd = products[0] || { id: 1, name: 'Roti Panggang Cokelat', price_per_bungkus: 2500 };
    setFormData({
      store_name: stores[0]?.store_name || 'Bu Siti',
      store_id: stores[0]?.id,
      product_name: defaultProd.name,
      product_id: defaultProd.id,
      qty: 10,
      reason: 'expired',
      condition_status: 'expired',
      action_taken: 'waste',
      loss_amount: 10 * (defaultProd.price_per_bungkus * 0.85),
      return_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleProductChange = (prodId: number) => {
    const p = products.find(prod => prod.id === prodId);
    if (!p) return;
    const estLoss = formData.qty * (p.price_per_bungkus * 0.85);
    setFormData(prev => ({
      ...prev,
      product_id: p.id,
      product_name: p.name,
      loss_amount: prev.action_taken === 'waste' ? estLoss : 0
    }));
  };

  const handleQtyChange = (qty: number) => {
    const p = products.find(prod => prod.id === formData.product_id);
    const estLoss = qty * ((p?.price_per_bungkus || 2000) * 0.85);
    setFormData(prev => ({
      ...prev,
      qty,
      loss_amount: prev.action_taken === 'waste' ? estLoss : 0
    }));
  };

  const handleActionChange = (action: 'waste' | 'restock') => {
    const p = products.find(prod => prod.id === formData.product_id);
    const estLoss = action === 'waste' ? (formData.qty * ((p?.price_per_bungkus || 2000) * 0.85)) : 0;
    setFormData(prev => ({
      ...prev,
      action_taken: action,
      loss_amount: estLoss
    }));
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.qty <= 0) {
      alert('Jumlah retur harus lebih dari 0.');
      return;
    }

    await addReturn(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <Undo2 className="w-3.5 h-3.5" />
            <span>Pencatatan Retur Roti</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Klaim Retur & Pemusnahan (Waste)
          </h1>
          <p className="text-xs text-stone-500">
            Pencatatan roti kadaluarsa, kemasan bocor, dan restock kembali ke gudang jika kondisi masih layak.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Retur Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Total Kerugian Retur (Waste)
          </div>
          <div className="text-2xl font-serif font-bold text-rose-700">
            Rp {totalWasteLoss.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Beban kerugian barang rusak & expired
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Total Roti Diretur
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {totalReturnedPieces.toLocaleString('id-ID')} <span className="text-sm font-normal text-stone-500">Bungkus</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Akumulasi seluruh toko mitra
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Status Barang Diretur
          </div>
          <div className="text-xs text-stone-700 space-y-1 mt-1">
            <div className="flex justify-between">
              <span>Dimusnahkan (Waste):</span>
              <strong className="text-rose-700">{returns.filter(r => r.action_taken === 'waste').length} Kasus</strong>
            </div>
            <div className="flex justify-between">
              <span>Layak Masuk Gudang (Restock):</span>
              <strong className="text-emerald-700">{returns.filter(r => r.action_taken === 'restock').length} Kasus</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">Riwayat Retur Toko</h3>
            <p className="text-xs text-stone-500">Daftar klaim pengembalian produk</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari toko atau varian roti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-[11px] font-semibold uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Toko Mitra</th>
                <th className="px-4 py-3">Varian Roti</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
                <th className="px-4 py-3">Alasan Retur</th>
                <th className="px-4 py-3 text-center">Tindakan</th>
                <th className="px-4 py-3 text-right">Nilai Rugi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredReturns.map(r => (
                <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                    {r.return_date}
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-900">
                    {r.store_name || 'Toko Umum'}
                  </td>
                  <td className="px-4 py-3 font-medium text-amber-900">
                    {r.product_name}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-stone-900">
                    {r.qty} bks
                  </td>
                  <td className="px-4 py-3 text-stone-600 capitalize">
                    {r.reason.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.action_taken === 'waste'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {r.action_taken === 'waste' ? 'Musnahkan (Waste)' : 'Masuk Stok (Restock)'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-rose-700">
                    {r.loss_amount > 0 ? `Rp ${r.loss_amount.toLocaleString('id-ID')}` : '-'}
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400">
                    Belum ada data retur roti.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Return Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Catat Retur Roti Aoka
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Toko Mitra</label>
                <select
                  value={formData.store_name}
                  onChange={(e) => {
                    const st = stores.find(s => s.store_name === e.target.value);
                    setFormData({
                      ...formData,
                      store_name: e.target.value,
                      store_id: st?.id
                    });
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.store_name}>{s.store_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Varian Roti</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.flavor})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Jumlah (Bungkus/Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.qty}
                    onChange={(e) => handleQtyChange(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Retur</label>
                  <input
                    type="date"
                    required
                    value={formData.return_date}
                    onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Alasan Retur</label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden capitalize"
                  >
                    <option value="expired">Kadaluarsa (Expired)</option>
                    <option value="kemasan_rusak">Kemasan Bocor / Rusak</option>
                    <option value="cacat_pabrik">Cacat Pabrik</option>
                    <option value="sisa_konsinyasi">Sisa Toko</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tindakan</label>
                  <select
                    value={formData.action_taken}
                    onChange={(e) => handleActionChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                  >
                    <option value="waste">Pemusnahan (Waste)</option>
                    <option value="restock">Kembali ke Stok (Restock)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Estimasi Kerugian (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.loss_amount}
                  onChange={(e) => setFormData({ ...formData, loss_amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Catatan</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Keterangan tambahan..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                >
                  Simpan Retur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
