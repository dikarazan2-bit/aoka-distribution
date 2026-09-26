import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../lib/supabase';
import { Tag, Check, X, Sparkles } from 'lucide-react';

interface CategoryPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCategoryName?: string;
  storeId?: number | null;
  storeName?: string;
  onApplyCategoryPrice?: (categoryName: string, priceDus: number, priceBks: number, saveToStore: boolean, saveToMaster: boolean) => void;
}

export const CategoryPriceModal: React.FC<CategoryPriceModalProps> = ({
  isOpen,
  onClose,
  targetCategoryName,
  storeId,
  storeName,
  onApplyCategoryPrice
}) => {
  const { categories, products, getStoreProductPrice, updateCategoryPrices } = useApp();

  const [selectedCat, setSelectedCat] = useState<string>(targetCategoryName || 'Roti Panggang');
  const [priceDus, setPriceDus] = useState<number>(106000);
  const [priceBks, setPriceBks] = useState<number>(2500);
  const [saveToStore, setSaveToStore] = useState<boolean>(true);
  const [saveToMaster, setSaveToMaster] = useState<boolean>(false);

  useEffect(() => {
    if (targetCategoryName) {
      setSelectedCat(targetCategoryName);
    }
  }, [targetCategoryName]);

  useEffect(() => {
    const catProds = products.filter(p => p.category_name.toLowerCase().includes(selectedCat.toLowerCase()));
    if (catProds.length > 0) {
      const p = catProds[0];
      const pDus = getStoreProductPrice(storeId || null, p.id, 'kardus');
      const pBks = getStoreProductPrice(storeId || null, p.id, 'bungkus');
      setPriceDus(pDus);
      setPriceBks(pBks);
    }
  }, [selectedCat, storeId]);

  if (!isOpen) return null;

  const presetsByCat: Record<string, number[]> = {
    'roti panggang': [106000, 105000, 104000, 100000],
    'roti gulung mini': [96000, 95000, 94000, 90000],
    'roti gulung besar': [96000, 95000, 94000, 90000],
    'byway donat': [106000, 105000, 104000, 100000],
    'byway abon ayam': [97000, 96000, 95000, 92000],
  };

  const currentPresets = presetsByCat[selectedCat.toLowerCase()] || [106000, 100000, 96000, 90000];

  const handleApply = async () => {
    if (onApplyCategoryPrice) {
      onApplyCategoryPrice(selectedCat, priceDus, priceBks, saveToStore, saveToMaster);
    } else {
      await updateCategoryPrices(selectedCat, priceDus, priceBks, saveToStore ? storeId : null, saveToMaster);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Tag className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="font-serif font-bold text-sm">Pengaturan Harga Barang per Kategori</h3>
              <p className="text-[11px] text-amber-100">
                Target: {storeName ? <strong>{storeName}</strong> : 'Formulir Aktif'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Pilih Kategori */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Pilih Kategori Produk:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.name)}
                  className={`
                    p-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center gap-2
                    ${selectedCat === cat.name 
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20' 
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-base text-amber-600 shrink-0">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Input Harga Dus & Bungkus */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">Harga per Kardus (Dus):</label>
                <span className="text-[11px] font-mono text-amber-800 font-bold">{formatRupiah(priceDus)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">Rp</span>
                <input
                  type="number"
                  value={priceDus || ''}
                  onChange={(e) => setPriceDus(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] font-bold text-stone-500">Preset Cepat:</span>
                {currentPresets.map(pr => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setPriceDus(pr)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-600 hover:text-white border border-stone-200 text-[10px] font-mono font-bold text-stone-700 transition-colors shadow-2xs"
                  >
                    {Math.round(pr / 1000)}rb
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800">Harga per Bungkus (Eceran):</label>
                <span className="text-[11px] font-mono text-amber-800 font-bold">{formatRupiah(priceBks)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-stone-400">Rp</span>
                <input
                  type="number"
                  value={priceBks || ''}
                  onChange={(e) => setPriceBks(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Opsi Penyimpanan */}
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={saveToStore}
                onChange={(e) => setSaveToStore(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span>Simpan sebagai harga khusus toko ini (diingat otomatis untuk transaksi berikutnya)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-700">
              <input
                type="checkbox"
                checked={saveToMaster}
                onChange={(e) => setSaveToMaster(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span>Perbarui juga ke Master Data Produk (Harga standar pabrik & gudang)</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Perubahan Harga</span>
          </button>
        </div>
      </div>
    </div>
  );
};
