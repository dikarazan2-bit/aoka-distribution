import React from 'react';
import { Transaction } from '../../types';
import { formatRupiah } from '../../lib/supabase';
import { Printer, X, CheckCircle, Copy, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let text = `*NOTA DISTRIBUSI ROTI AOKA*\n`;
    text += `No. Faktur: ${transaction.invoice_number}\n`;
    text += `Toko: ${transaction.store_name || transaction.buyer_name}\n`;
    text += `Tanggal: ${transaction.transaction_date}\n`;
    text += `Pembayaran: ${transaction.payment_method.toUpperCase()}\n`;
    text += `--------------------------------\n`;
    transaction.details.forEach(item => {
      text += `${item.product_name}\n  ${item.qty} ${item.unit_type} @ ${formatRupiah(item.unit_price)} = ${formatRupiah(item.subtotal)}\n`;
    });
    text += `--------------------------------\n`;
    text += `*TOTAL: ${formatRupiah(transaction.total_amount)}*\n`;
    text += `Terima kasih atas kemitraan Anda.`;

    navigator.clipboard.writeText(text);
    alert('Rincian nota berhasil disalin ke clipboard! Siap dikirim ke WhatsApp toko.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="p-3.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Nota Transaksi Siap Cetak</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-200 text-stone-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Content Area (Printable) */}
        <div className="p-6 overflow-y-auto bg-stone-50/50 flex-1">
          <div 
            id="printable-receipt"
            className="p-5 bg-white border border-stone-200 rounded-xl shadow-xs font-mono text-xs text-stone-800 space-y-3"
          >
            {/* Store & Header */}
            <div className="text-center pb-3 border-b border-dashed border-stone-300">
              <h2 className="font-serif font-extrabold text-sm tracking-wide text-amber-900">ROTI AOKA</h2>
              <p className="text-[10px] text-stone-600">Pusat Distribusi Resmi Roti Aoka</p>
              <p className="text-[9px] text-stone-500">PT Indonesia Bakery Family</p>
            </div>

            {/* Meta Info */}
            <div className="text-[11px] space-y-1 pb-2 border-b border-dashed border-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">No. Nota:</span>
                <strong className="text-stone-800 font-bold">{transaction.invoice_number}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Toko Mitra:</span>
                <strong className="text-stone-800">{transaction.store_name || transaction.buyer_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tanggal:</span>
                <span>{transaction.transaction_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Metode Bayar:</span>
                <span className="uppercase font-bold text-amber-800">{transaction.payment_method}</span>
              </div>
            </div>

            {/* Itemized List */}
            <div className="space-y-2 py-1 border-b border-dashed border-stone-300">
              {transaction.details.map((item, idx) => (
                <div key={idx} className="text-[11px] leading-tight">
                  <div className="font-semibold text-stone-900 truncate">{item.product_name}</div>
                  <div className="flex justify-between text-stone-600 mt-0.5">
                    <span>{item.qty} {item.unit_type} &times; {formatRupiah(item.unit_price)}</span>
                    <strong className="text-stone-900 font-bold">{formatRupiah(item.subtotal)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Calculation */}
            <div className="pt-1 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-stone-900">
                <span>TOTAL TAGIHAN:</span>
                <span className="text-sm font-extrabold text-amber-900">{formatRupiah(transaction.total_amount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-800 font-semibold">
                <span>STATUS:</span>
                <span className="uppercase tracking-wider">LUNAS / SELESAI</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 border-t border-dashed border-stone-300 text-[10px] text-stone-500 leading-relaxed">
              <p>Terima kasih atas kerja sama dan kemitraan Anda.</p>
              <p>Roti lembut, empuk, kualitas terbaik!</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3.5 border-t border-stone-200 bg-white flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-4 h-4 text-stone-500" />
            <span>Salin WA</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
