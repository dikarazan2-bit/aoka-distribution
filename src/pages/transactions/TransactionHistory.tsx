import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Calendar, 
  Filter, 
  Printer, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Store as StoreIcon, 
  Download, 
  PlusCircle, 
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Transaction } from '../../types';
import { ReceiptModal } from '../../components/transactions/ReceiptModal';

export const TransactionHistory: React.FC = () => {
  const { transactions, stores, deleteTransaction } = useApp();

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Expand row state
  const [expandedTxIds, setExpandedTxIds] = useState<Record<number, boolean>>({});

  // Receipt modal state
  const [selectedTxForReceipt, setSelectedTxForReceipt] = useState<Transaction | null>(null);

  // Toggle expanded item
  const toggleExpand = (id: number) => {
    setExpandedTxIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Search invoice or buyer
      const searchMatch = 
        tx.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.store_name && tx.store_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.buyer_name && tx.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Store filter
      const storeMatch = selectedStore === 'all' || 
        (tx.store_name && tx.store_name.toLowerCase() === selectedStore.toLowerCase()) ||
        (tx.store_id && tx.store_id.toString() === selectedStore);

      // Payment filter
      const payMatch = paymentFilter === 'all' || tx.payment_method === paymentFilter;

      // Date range filter
      let dateMatch = true;
      if (startDate && tx.transaction_date < startDate) dateMatch = false;
      if (endDate && tx.transaction_date > endDate) dateMatch = false;

      return searchMatch && storeMatch && payMatch && dateMatch;
    });
  }, [transactions, searchTerm, selectedStore, paymentFilter, startDate, endDate]);

  // Group transactions by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(tx => {
      const dateKey = tx.transaction_date || 'Tanpa Tanggal';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    // Urutkan grup tanggal secara descending (terbaru di atas)
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => ({
      date,
      transactions: groups[date],
      totalDateAmount: groups[date].reduce((acc, t) => acc + t.total_amount, 0),
      count: groups[date].length
    }));
  }, [filteredTransactions]);

  // Summary Metrics of Filtered Data
  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.total_amount, 0);
  }, [filteredTransactions]);

  const totalFilteredProfit = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.gross_profit || (t.total_amount * 0.15)), 0);
  }, [filteredTransactions]);

  // Delete transaction handler
  const handleDelete = async (tx: Transaction) => {
    const confirm = window.confirm(
      `Hapus nota ${tx.invoice_number} (${tx.store_name || tx.buyer_name})?\n\nStok roti yang telah dipotong pada transaksi ini akan dikembalikan ke gudang secara otomatis.`
    );
    if (!confirm) return;

    try {
      await deleteTransaction(tx.id);
    } catch (err) {
      alert('Gagal membatalkan transaksi.');
    }
  };

  // Helper date formatter
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Audit & Arsip Transaksi</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Riwayat Penjualan & Distribusi Toko
          </h1>
          <p className="text-xs text-stone-500">
            Data transaksi terkelompok per tanggal, cetak ulang struk, dan otomatis restore stok saat pembatalan.
          </p>
        </div>

        <Link
          to="/transactions/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Catat Nota Baru</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Term */}
          <div className="lg:col-span-2">
            <label className="block font-semibold text-stone-700 mb-1">Pencarian</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari no. nota / nama toko / pembeli..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Store Filter */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Filter Toko Mitra</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">Semua Toko ({stores.length})</option>
              {stores.map(st => (
                <option key={st.id} value={st.store_name}>
                  {st.store_name} ({st.store_code})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Filter */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Metode Pembayaran</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai (Cash)</option>
              <option value="transfer">Transfer Bank</option>
              <option value="tempo">Tempo (Kredit)</option>
            </select>
          </div>

          {/* Date Range Start */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filter Summary Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-4 text-stone-600">
            <span>Ditemukan: <strong className="text-stone-900">{filteredTransactions.length}</strong> transaksi</span>
            <span>Total Nilai: <strong className="text-amber-900">Rp {totalFilteredAmount.toLocaleString('id-ID')}</strong></span>
            <span>Est. Margin Laba: <strong className="text-emerald-700">Rp {totalFilteredProfit.toLocaleString('id-ID')}</strong></span>
          </div>

          {(searchTerm || selectedStore !== 'all' || paymentFilter !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStore('all');
                setPaymentFilter('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-rose-600 font-semibold hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Grouped Transactions List */}
      <div className="space-y-6">
        {groupedByDate.map((group) => (
          <div key={group.date} className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            {/* Date Group Header */}
            <div className="bg-gradient-to-r from-stone-100 via-stone-50 to-white px-5 py-3 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-stone-900 text-sm">
                  {formatFriendlyDate(group.date)}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {group.count} Nota
                </span>
              </div>
              <div className="text-xs font-semibold text-stone-700">
                Subtotal Hari Ini: <span className="font-bold text-amber-950 font-serif text-sm">Rp {group.totalDateAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Transactions in Date Table */}
            <div className="divide-y divide-stone-100">
              {group.transactions.map((tx) => {
                const isExpanded = !!expandedTxIds[tx.id];

                return (
                  <div key={tx.id} className="p-4 hover:bg-stone-50/60 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Invoice & Store */}
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleExpand(tx.id)}
                          className="mt-0.5 p-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-600"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-amber-900">{tx.invoice_number}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              tx.payment_method === 'tunai' 
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.payment_method === 'transfer'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {tx.payment_method.toUpperCase()}
                            </span>
                          </div>
                          <div className="font-bold text-stone-900 text-sm mt-0.5">
                            {tx.store_name || tx.buyer_name}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {tx.details?.length || 0} varian roti · Dibuat: {tx.created_at || tx.transaction_date}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center justify-between md:justify-end gap-4">
                        <div className="text-right">
                          <div className="text-base font-bold font-serif text-stone-900">
                            Rp {tx.total_amount.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium">
                            Laba: +Rp {(tx.gross_profit || (tx.total_amount * 0.15)).toLocaleString('id-ID')}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setSelectedTxForReceipt(tx)}
                            title="Cetak Ulang Struk Thermal"
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Struk</span>
                          </button>
                          <button
                            onClick={() => handleDelete(tx)}
                            title="Batalkan Transaksi & Kembalikan Stok"
                            className="p-2 rounded-xl hover:bg-rose-50 text-stone-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Line Items Details */}
                    {isExpanded && (
                      <div className="mt-3 pl-8 pt-3 border-t border-stone-100 text-xs">
                        <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60 space-y-2">
                          <div className="font-bold text-stone-700 text-[11px] uppercase tracking-wider">
                            Rincian Item Nota:
                          </div>
                          <div className="divide-y divide-stone-200/50">
                            {tx.details?.map((d, dIdx) => (
                              <div key={dIdx} className="py-1.5 flex justify-between items-center text-stone-700">
                                <div>
                                  <span className="font-semibold text-stone-900">{d.product_name}</span>
                                  <span className="text-stone-500 text-[11px] ml-2">
                                    ({d.qty} {d.unit_type} @ Rp {d.unit_price.toLocaleString('id-ID')})
                                  </span>
                                </div>
                                <span className="font-bold text-stone-900">
                                  Rp {d.subtotal.toLocaleString('id-ID')}
                                </span>
                              </div>
                            ))}
                          </div>
                          {tx.notes && (
                            <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200/50">
                              <span className="font-semibold text-stone-600">Catatan:</span> {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {groupedByDate.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center text-stone-400 text-sm">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <p className="font-semibold text-stone-600">Tidak ada riwayat transaksi yang cocok dengan filter.</p>
            <p className="text-xs text-stone-400 mt-1">Coba sesuaikan kata kunci pencarian atau tanggal transaksi.</p>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
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
