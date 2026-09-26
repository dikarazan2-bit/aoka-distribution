import React, { useState, useMemo } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Minus, 
  Trash2,
  X,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const ShopCatalog: React.FC = () => {
  const { products, categories, getLiveProductStock } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shopCart, setShopCart] = useState<Array<{ product: Product; qty: number; unit: 'kardus' | 'bungkus' }>>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.flavor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || p.category_name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product: Product, unit: 'kardus' | 'bungkus' = 'kardus') => {
    setShopCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id && item.unit === unit);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].qty += 1;
        return next;
      }
      return [...prev, { product, qty: 1, unit }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setShopCart(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setShopCart(prev => {
      const next = [...prev];
      next[index].qty = newQty;
      return next;
    });
  };

  const cartTotalAmount = shopCart.reduce((acc, it) => {
    const price = it.unit === 'kardus' ? it.product.price_per_kardus : it.product.price_per_bungkus;
    return acc + (price * it.qty);
  }, 0);

  // Generate WhatsApp Order Link
  const handleCheckoutWhatsApp = () => {
    if (shopCart.length === 0) return;

    let text = `*PESANAN ROTI AOKA RESMI*\n`;
    text += `Nama Pembeli / Toko: ${customerName || 'Pelanggan Toko'}\n`;
    if (customerAddress) text += `Alamat Pengiriman: ${customerAddress}\n`;
    text += `--------------------------------\n`;

    shopCart.forEach((it, idx) => {
      const price = it.unit === 'kardus' ? it.product.price_per_kardus : it.product.price_per_bungkus;
      text += `${idx + 1}. ${it.product.name} (${it.qty} ${it.unit}) - Rp ${(price * it.qty).toLocaleString('id-ID')}\n`;
    });

    text += `--------------------------------\n`;
    text += `*TOTAL TAGIHAN: Rp ${cartTotalAmount.toLocaleString('id-ID')}*\n\n`;
    text += `Halo admin distribusi Aoka, mohon konfirmasi ketersediaan dan jadwal pengiriman pesanan ini. Terima kasih!`;

    const encoded = encodeURIComponent(text);
    // WhatsApp URL (nomor default admin distribusi 628123456789)
    window.open(`https://wa.me/628123456789?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Hero Showcase Banner */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Resmi Distributor PT Indonesia Bakery Family</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-3">
            Roti Aoka Lembut & Lezat
          </h1>
          <p className="text-amber-100 text-sm md:text-base leading-relaxed">
            Pilihan terlengkap roti panggang, roti gulung keju, sandwich empuk, momotaro, dan varian byway langsung dari distributor resmi.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
              selectedCategory === 'All'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                selectedCategory === c.name
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari roti / varian rasa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Products Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredProducts.map(p => {
          const live = getLiveProductStock(p.id);
          const isOut = live.remainingBoxes <= 0;

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    {p.category_name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOut
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOut ? 'Habis' : 'Stok Ready'}
                  </span>
                </div>

                <div className="h-28 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center mb-4 text-amber-900 border border-amber-100/60">
                  <span className="material-symbols-outlined text-5xl opacity-80">bakery_dining</span>
                </div>

                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-stone-500 mb-3">
                  Rasa: <span className="font-semibold text-stone-700">{p.flavor}</span>
                </p>

                <div className="space-y-1 mb-4">
                  <div className="text-base font-bold font-serif text-amber-900">
                    Rp {p.price_per_kardus.toLocaleString('id-ID')}
                    <span className="text-xs font-normal text-stone-500"> / Dus (60 bks)</span>
                  </div>
                  <div className="text-xs text-stone-600">
                    Eceran: Rp {p.price_per_bungkus.toLocaleString('id-ID')} / bks
                  </div>
                </div>
              </div>

              {/* Order Button */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isOut}
                  onClick={() => handleAddToCart(p, 'kardus')}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Pesan Dus</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Trigger Pill if items in cart */}
      {shopCart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 rounded-full font-bold shadow-xl flex items-center gap-3 transition-transform transform hover:scale-105"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Lihat Keranjang ({shopCart.reduce((a, b) => a + b.qty, 0)})</span>
          <span className="bg-amber-800 px-2.5 py-0.5 rounded-full text-xs">
            Rp {cartTotalAmount.toLocaleString('id-ID')}
          </span>
        </button>
      )}

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-700" />
                  <h3 className="font-serif font-bold text-stone-900 text-lg">Keranjang Belanja</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 mb-4">
                {shopCart.map((item, idx) => {
                  const price = item.unit === 'kardus' ? item.product.price_per_kardus : item.product.price_per_bungkus;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">{item.product.name}</div>
                        <div className="text-[11px] text-stone-500">
                          Rp {price.toLocaleString('id-ID')} / {item.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(idx, item.qty - 1)}
                          className="w-6 h-6 rounded-md bg-white border border-stone-300 font-bold flex items-center justify-center hover:bg-stone-100"
                        >
                          -
                        </button>
                        <span className="font-bold w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQty(idx, item.qty + 1)}
                          className="w-6 h-6 rounded-md bg-white border border-stone-300 font-bold flex items-center justify-center hover:bg-stone-100"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleUpdateQty(idx, 0)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {shopCart.length === 0 && (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    Keranjang masih kosong.
                  </div>
                )}
              </div>

              {/* Customer Info Form */}
              <div className="space-y-3 text-xs border-t border-stone-100 pt-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nama Pemesan / Toko</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Toko Barokah / Pak Budi"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Alamat Pengiriman</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Contoh: Jl. Diponegoro No. 45"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-stone-600">Total Tagihan:</span>
                <span className="font-serif font-bold text-amber-900 text-xl">
                  Rp {cartTotalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                disabled={shopCart.length === 0}
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pesan Sekarang via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
