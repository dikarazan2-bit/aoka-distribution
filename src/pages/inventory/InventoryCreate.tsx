import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Warehouse, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Package, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InventoryCreate: React.FC = () => {
  const navigate = useNavigate();
  const { products, addBatch } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 1);
  const [batchCode, setBatchCode] = useState<string>(() => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BATCH-AOKA-${today}-${rand}`;
  });
  const [unitType, setUnitType] = useState<'kardus' | 'bungkus'>('kardus');
  const [quantity, setQuantity] = useState<number>(20); // 20 dus default
  const [buyPricePerPiece, setBuyPricePerPiece] = useState<number>(1800);
  const [purchasedAt, setPurchasedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expDate, setExpDate] = useState<string>(() => {
    // Default 3 bulan ke depan
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('Pengiriman langsung dari Pabrik Aoka');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const ppb = selectedProduct?.pieces_per_box > 0 ? selectedProduct.pieces_per_box : 60;
  const totalPieces = unitType === 'kardus' ? (quantity * ppb) : quantity;
  const totalValuation = totalPieces * buyPricePerPiece;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('Jumlah stok masuk harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBatch({
        batch_code: batchCode,
        product_id: selectedProductId,
        product_name: selectedProduct.name,
        initial_stock: totalPieces,
        current_stock: totalPieces,
        buy_price: buyPricePerPiece,
        purchased_at: purchasedAt,
        exp_date: expDate,
        notes: notes
      });

      alert(`Sukses menambahkan stok masuk ${quantity} ${unitType} (${totalPieces} bungkus) untuk ${selectedProduct.name}! Stok gudang telah bertambah.`);
      navigate('/inventory');
    } catch (err) {
      console.error(err);
      alert('Gagal mencatat batch stok masuk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Gudang & Batch FIFO</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-sm space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-2">
            <Warehouse className="w-3.5 h-3.5" />
            <span>Form Masuk Barang Pabrik</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            Pencatatan Batch Stok Baru
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Data batch ini akan langsung masuk ke antrean FIFO gudang dan menambah stok kasir real-time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Pilih Varian Produk */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Pilih Varian Roti Aoka
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — Rasa: {p.flavor} ({p.category_name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kode Batch */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Kode Batch Pabrik
              </label>
              <input
                type="text"
                required
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-amber-500 focus:outline-hidden uppercase"
              />
            </div>

            {/* Satuan & Kuantitas */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Satuan Penerimaan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnitType('kardus')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    unitType === 'kardus'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Kardus / Dus (60 pcs)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitType('bungkus')}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    unitType === 'bungkus'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Bungkus / Pcs
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Jumlah Masuk */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Jumlah Masuk ({unitType.toUpperCase()})
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* HPP per bungkus */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Harga Beli / HPP Modal per Bungkus (Rp)
              </label>
              <input
                type="number"
                min="0"
                required
                value={buyPricePerPiece}
                onChange={(e) => setBuyPricePerPiece(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal Beli */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Tanggal Pembelian / Masuk
              </label>
              <input
                type="date"
                required
                value={purchasedAt}
                onChange={(e) => setPurchasedAt(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Tanggal Kadaluarsa (EXP) */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Estimasi Tanggal Kadaluarsa (EXP)
              </label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              Catatan Surat Jalan / Supplier
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: No. Polisi Truk / No. DO Pabrik"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Kalkulasi Ringkasan Otomatis */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2 text-xs text-amber-950">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <Sparkles className="w-4 h-4" />
              <span>Ringkasan Alokasi Stok Masuk:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-200">
              <div>
                Total Fisik Bungkus: <strong className="text-amber-950">{totalPieces.toLocaleString('id-ID')} Bungkus</strong>
              </div>
              <div>
                Konversi Dus: <strong className="text-amber-950">{Math.floor(totalPieces / ppb)} Dus</strong>
              </div>
              <div>
                HPP per Dus: <strong className="text-amber-950">Rp {(buyPricePerPiece * ppb).toLocaleString('id-ID')}</strong>
              </div>
              <div>
                Total Nilai Pembelian: <strong className="text-amber-950 font-bold">Rp {totalValuation.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Batch ke Gudang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
