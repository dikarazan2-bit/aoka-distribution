import React, { useState } from 'react';
import { 
  ReceiptText, 
  Plus, 
  Search, 
  Calendar, 
  DollarSign, 
  Truck, 
  Users, 
  Coffee, 
  Wrench, 
  Zap, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';

export const ExpenseList: React.FC = () => {
  const { expenses, addExpense } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<Omit<Expense, 'id'>>({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'BBM & Transport',
    amount: 50000,
    notes: ''
  });

  const categories = [
    'BBM & Transport',
    'Gaji & Upah',
    'Makan & Konsumsi',
    'Kendaraan & Servis',
    'Listrik & Air',
    'Lainnya'
  ] as const;

  // Filtered Expenses
  const filteredExpenses = expenses.filter(e => {
    const matchSearch = e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
    return matchSearch && matchCat;
  });

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'BBM & Transport': return Truck;
      case 'Gaji & Upah': return Users;
      case 'Makan & Konsumsi': return Coffee;
      case 'Kendaraan & Servis': return Wrench;
      case 'Listrik & Air': return Zap;
      default: return MoreHorizontal;
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      expense_date: new Date().toISOString().split('T')[0],
      category: 'BBM & Transport',
      amount: 50000,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert('Nominal pengeluaran harus lebih dari 0.');
      return;
    }

    await addExpense(formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Manajemen Beban Operasional</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Biaya Operasional Distributor
          </h1>
          <p className="text-xs text-stone-500">
            Pencatatan pengeluaran harian seperti BBM kurir, uang makan, servis mobil box, dan upah tim lapangan.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Pengeluaran Baru</span>
        </button>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Total Biaya Operasional
          </div>
          <div className="text-2xl font-serif font-bold text-rose-700">
            Rp {totalExpenseAmount.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Akumulasi seluruh beban kas keluar
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Beban Terbesar
          </div>
          <div className="text-lg font-serif font-bold text-stone-900">
            BBM & Pengiriman
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Operasional armada kanvas & toko mitra
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Jumlah Transaksi Beban
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">
            {expenses.length} <span className="text-sm font-normal text-stone-500">Bukti Kas</span>
          </div>
          <div className="text-xs text-stone-500 mt-1">
            Tercatat dalam sistem akuntansi
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              selectedCategoryFilter === 'all'
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-amber-700 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari catatan pengeluaran..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-[11px] font-semibold uppercase text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kategori Beban</th>
                <th className="px-4 py-3">Keterangan / Catatan</th>
                <th className="px-4 py-3 text-right">Nominal (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map(e => {
                const Icon = getCategoryIcon(e.category);
                return (
                  <tr key={e.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-4 py-3 text-stone-600 whitespace-nowrap">
                      {e.expense_date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-stone-900">{e.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {e.notes || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-700 text-sm">
                      Rp {e.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                    Belum ada catatan biaya operasional.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                Catat Biaya Operasional Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nominal Biaya (Rp)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Keterangan / Rincian</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Bensin armada Avanza pengiriman rute selatan"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
