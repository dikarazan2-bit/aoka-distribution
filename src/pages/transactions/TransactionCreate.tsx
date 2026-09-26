import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store as StoreIcon, 
  Layers, 
  Trash2, 
  Plus, 
  Printer, 
  Sparkles, 
  RefreshCw, 
  Calendar, 
  Tag, 
  Edit3, 
  CheckCircle2, 
  Search, 
  ListOrdered,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Store, TransactionDetail, Transaction } from '../../types';
import { ReceiptModal } from '../../components/transactions/ReceiptModal';
import { CategoryPriceModal } from '../../components/transactions/CategoryPriceModal';

export const TransactionCreate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStoreId = searchParams.get('storeId') ? Number(searchParams.get('storeId')) : undefined;

  const { 
    products, 
    categories, 
    stores, 
    getStoreProductPrice, 
    getLiveProductStock, 
    addTransaction, 
    addBatchTransactions 
  } = useApp();

  // Mode: 'single' (Form Kasir Utama) | 'batch' (Antrean Multi-Toko Cepat)
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Form State: Single Store
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(initialStoreId || (stores[0]?.id));
  const [buyerName, setBuyerName] = useState<string>(stores.find(s => s.id === initialStoreId)?.store_name || stores[0]?.store_name || '');
  const [buyerPhone, setBuyerPhone] = useState<string>(stores.find(s => s.id === initialStoreId)?.phone || '');
  const [buyerAddress, setBuyerAddress] = useState<string>(stores.find(s => s.id === initialStoreId)?.address || '');
  const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'transfer' | 'tempo'>('tunai');
  const [notes, setNotes] = useState<string>('');

  // Cart Items State
  const [cartItems, setCartItems] = useState<TransactionDetail[]>([]);

  // Search & Filter Category State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal States
  const [showPriceModal, setShowPriceModal] = useState<boolean>(false);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Batch Mode State
  const [batchRawInput, setBatchRawInput] = useState<string>(
    `Bu Siti: 5 dus Roti Panggang Cokelat, 3 dus Roti Gulung Keju\nNiki Snack: 10 dus Roti Panggang Keju\nMustofa: 8 dus Momotaro Red Bean`
  );
  const [batchParsedQueue, setBatchParsedQueue] = useState<Array<{
    storeName: string;
    matchedStore?: Store;
    items: Array<{ product: Product; qty: number; unitType: 'kardus' | 'bungkus'; unitPrice: number; subtotal: number }>;
    totalAmount: number;
    hasError?: boolean;
    errorMsg?: string;
  }>>([]);

  // Sinkronisasi data ketika toko dipilih
  const handleStoreChange = (storeIdStr: string) => {
    if (storeIdStr === 'custom') {
      setSelectedStoreId(undefined);
      setBuyerName('');
      setBuyerPhone('');
      setBuyerAddress('');
      return;
    }
    const sId = Number(storeIdStr);
    setSelectedStoreId(sId);
    const found = stores.find(s => s.id === sId);
    if (found) {
      setBuyerName(found.store_name);
      setBuyerPhone(found.phone || '');
      setBuyerAddress(found.address || '');

      // Recalculate harga item di keranjang dengan harga toko baru
      setCartItems(prev => prev.map(item => {
        const newUnitPrice = getStoreProductPrice(sId, item.product_id, item.unit_type);
        return {
          ...item,
          unit_price: newUnitPrice,
          subtotal: newUnitPrice * item.qty
        };
      }));
    }
  };

  // Hitung alokasi qty di keranjang saat ini untuk live stock checking
  const cartAllocatedPieces = useMemo(() => {
    const map: Record<number, number> = {};
    cartItems.forEach(item => {
      const p = products.find(prod => prod.id === item.product_id);
      const ppb = p?.pieces_per_box || 60;
      const pieces = item.unit_type === 'kardus' ? (item.qty * ppb) : item.qty;
      map[item.product_id] = (map[item.product_id] || 0) + pieces;
    });
    return map;
  }, [cartItems, products]);

  // Tambah produk ke keranjang
  const handleAddToCart = (product: Product, unitType: 'kardus' | 'bungkus' = 'kardus') => {
    const existingIndex = cartItems.findIndex(i => i.product_id === product.id && i.unit_type === unitType);
    const unitPrice = getStoreProductPrice(selectedStoreId || null, product.id, unitType);

    if (existingIndex >= 0) {
      setCartItems(prev => {
        const next = [...prev];
        const newQty = next[existingIndex].qty + 1;
        next[existingIndex] = {
          ...next[existingIndex],
          qty: newQty,
          subtotal: newQty * unitPrice
        };
        return next;
      });
    } else {
      const newItem: TransactionDetail = {
        product_id: product.id,
        product_name: product.name,
        unit_type: unitType,
        qty: 1,
        unit_price: unitPrice,
        subtotal: unitPrice,
        hpp_recorded: unitType === 'kardus' ? (product.price_per_bungkus * 0.85 * (product.pieces_per_box || 60)) : (product.price_per_bungkus * 0.85)
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  // Ubah kuantitas produk dalam keranjang
  const handleUpdateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCartItems(prev => {
      const next = [...prev];
      const item = next[index];
      next[index] = {
        ...item,
        qty: newQty,
        subtotal: newQty * item.unit_price
      };
      return next;
    });
  };

  // Ubah tipe satuan (kardus <-> bungkus)
  const handleToggleUnitType = (index: number) => {
    setCartItems(prev => {
      const next = [...prev];
      const item = next[index];
      const newUnit = item.unit_type === 'kardus' ? 'bungkus' : 'kardus';
      const newPrice = getStoreProductPrice(selectedStoreId || null, item.product_id, newUnit);
      next[index] = {
        ...item,
        unit_type: newUnit,
        unit_price: newPrice,
        subtotal: newPrice * item.qty
      };
      return next;
    });
  };

  // Hapus item dari keranjang
  const handleRemoveItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // 1-Click Swap Out-of-Stock Variant
  const handleSwapVariant = (fromProductId: number) => {
    const fromProd = products.find(p => p.id === fromProductId);
    if (!fromProd) return;

    // Cari alternatif yang tersedia di kategori yang sama atau kategori lain
    const readyAlternative = products.find(p => {
      if (p.id === fromProductId) return false;
      const live = getLiveProductStock(p.id, cartAllocatedPieces[p.id] || 0);
      return live.remainingBoxes > 0 && p.category_name === fromProd.category_name;
    }) || products.find(p => {
      if (p.id === fromProductId) return false;
      const live = getLiveProductStock(p.id, cartAllocatedPieces[p.id] || 0);
      return live.remainingBoxes > 0;
    });

    if (!readyAlternative) {
      alert('Maaf, semua stok varian alternatif di gudang sedang kosong.');
      return;
    }

    // Ganti di keranjang jika ada item ini
    setCartItems(prev => {
      const exists = prev.some(item => item.product_id === fromProductId);
      if (exists) {
        return prev.map(item => {
          if (item.product_id === fromProductId) {
            const newPrice = getStoreProductPrice(selectedStoreId || null, readyAlternative.id, item.unit_type);
            return {
              ...item,
              product_id: readyAlternative.id,
              product_name: readyAlternative.name,
              unit_price: newPrice,
              subtotal: newPrice * item.qty
            };
          }
          return item;
        });
      } else {
        // Jika belum ada di keranjang, langsung tambahkan alternatif
        handleAddToCart(readyAlternative, 'kardus');
        return prev;
      }
    });

    alert(`Berhasil dialihkan ke: ${readyAlternative.name} (Stok Ready)`);
  };

  // Total Belanjaan
  const grandTotal = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.subtotal, 0);
  }, [cartItems]);

  const totalHpp = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + ((it.hpp_recorded || (it.unit_price * 0.85)) * it.qty), 0);
  }, [cartItems]);

  // Submit Transaksi Single
  const handleSubmitSingleTransaction = async (andPrint = false) => {
    if (cartItems.length === 0) {
      alert('Silakan pilih minimal satu varian roti untuk nota penjualan.');
      return;
    }
    if (!buyerName.trim()) {
      alert('Nama toko mitra atau pembeli tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedStore = stores.find(s => s.id === selectedStoreId);
      const codePart = selectedStore?.store_code || 'UMUM';
      const datePart = transactionDate.replace(/-/g, '');
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const invoiceNumber = `NOTA-${codePart}-${datePart}-${randPart}`;

      const newTx = await addTransaction({
        invoice_number: invoiceNumber,
        store_id: selectedStoreId,
        store_name: buyerName,
        buyer_name: buyerName,
        buyer_phone: buyerPhone,
        buyer_address: buyerAddress,
        transaction_date: transactionDate,
        total_amount: grandTotal,
        total_hpp: totalHpp,
        gross_profit: grandTotal - totalHpp,
        payment_method: paymentMethod,
        status: 'selesai',
        notes: notes,
        details: cartItems
      });

      setSuccessMessage(`Transaksi ${newTx.invoice_number} berhasil disimpan!`);
      if (andPrint) {
        setCompletedTx(newTx);
      }

      // Reset keranjang
      setCartItems([]);
      setNotes('');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan transaksi. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parser Antrean Cepat (Batch Prompt)
  const handleParseBatch = () => {
    const lines = batchRawInput.split('\n').filter(l => l.trim().length > 0);
    const parsedQueue: Array<{
      storeName: string;
      matchedStore?: Store;
      items: Array<{ product: Product; qty: number; unitType: 'kardus' | 'bungkus'; unitPrice: number; subtotal: number }>;
      totalAmount: number;
      hasError?: boolean;
      errorMsg?: string;
    }> = [];

    lines.forEach(line => {
      // Format 1: "Nama Toko: 5 dus Roti Panggang Cokelat, 2 dus Roti Gulung"
      // Format 2: "Nama Toko 10 dus panggang cokelat"
      let storePart = '';
      let itemsPart = '';

      if (line.includes(':')) {
        const parts = line.split(':');
        storePart = parts[0].trim();
        itemsPart = parts.slice(1).join(':').trim();
      } else {
        const match = line.match(/^([a-zA-Z0-9\s]+?)\s+(\d+\s*(?:dus|kardus|bks|bungkus).*)$/i);
        if (match) {
          storePart = match[1].trim();
          itemsPart = match[2].trim();
        } else {
          storePart = 'Toko Umum';
          itemsPart = line.trim();
        }
      }

      // Cari toko terdekat
      const matchedStore = stores.find(s => 
        s.store_name.toLowerCase().includes(storePart.toLowerCase()) || 
        storePart.toLowerCase().includes(s.store_name.toLowerCase())
      ) || stores[0];

      // Parse daftar item yang dipisahkan koma atau kata hubung
      const itemStrings = itemsPart.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      const parsedItems: Array<{ product: Product; qty: number; unitType: 'kardus' | 'bungkus'; unitPrice: number; subtotal: number }> = [];
      let totalAmount = 0;
      let hasError = false;
      let errorMsg = '';

      itemStrings.forEach(str => {
        // Ambil kuantitas dan satuan
        const qtyMatch = str.match(/(\d+)\s*(dus|kardus|box|bks|bungkus|pcs)?\s*(.*)/i);
        if (!qtyMatch) return;

        const qty = parseInt(qtyMatch[1], 10);
        const unitRaw = (qtyMatch[2] || 'dus').toLowerCase();
        const unitType: 'kardus' | 'bungkus' = (unitRaw.includes('bks') || unitRaw.includes('bungkus') || unitRaw.includes('pcs')) ? 'bungkus' : 'kardus';
        const productNameQuery = qtyMatch[3].trim().toLowerCase();

        // Cari varian produk
        const matchedProduct = products.find(p => {
          const pName = p.name.toLowerCase();
          const pFlav = p.flavor.toLowerCase();
          return pName.includes(productNameQuery) || 
                 pFlav.includes(productNameQuery) ||
                 productNameQuery.includes(pFlav);
        }) || products[0];

        const unitPrice = getStoreProductPrice(matchedStore?.id || null, matchedProduct.id, unitType);
        const subtotal = unitPrice * qty;
        totalAmount += subtotal;

        parsedItems.push({
          product: matchedProduct,
          qty,
          unitType,
          unitPrice,
          subtotal
        });
      });

      if (parsedItems.length === 0) {
        hasError = true;
        errorMsg = 'Gagal mengenali format nama roti atau jumlah dus.';
      }

      parsedQueue.push({
        storeName: matchedStore?.store_name || storePart,
        matchedStore,
        items: parsedItems,
        totalAmount,
        hasError,
        errorMsg
      });
    });

    setBatchParsedQueue(parsedQueue);
  };

  // Eksekusi Simpan Antrean Cepat Sekaligus
  const handleProcessAllBatch = async () => {
    if (batchParsedQueue.length === 0) {
      alert('Silakan parse antrean transaksi terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = batchParsedQueue.map(q => ({
        store: q.matchedStore || stores[0],
        date: transactionDate,
        payMethod: paymentMethod,
        items: q.items.map(it => ({
          product_id: it.product.id,
          product_name: it.product.name,
          unit_type: it.unitType,
          qty: it.qty,
          unit_price: it.unitPrice,
          subtotal: it.subtotal,
          hpp_recorded: it.unitPrice * 0.85
        })),
        notes: 'Batch Quick Prompt Kasir'
      }));

      const created = await addBatchTransactions(payload);
      alert(`Sukses memproses ${created.length} nota distribusi toko secara otomatis! Stok gudang telah terpotong.`);
      setBatchParsedQueue([]);
      setBatchRawInput('');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses batch transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter daftar produk di katalog bawah
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.flavor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'All' || p.category_name === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS Distribusi & Kasir</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Pencatatan Nota Transaksi Toko
          </h1>
          <p className="text-xs text-stone-500">
            Kalkulasi sisa stok otomatis, 1-click swap varian habis, dan cetak struk thermal 80mm.
          </p>
        </div>

        {/* Switch Mode Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'single'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Nota Toko Satuan</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('batch');
              if (batchParsedQueue.length === 0) handleParseBatch();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Antrean Cepat (Batch Prompt)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="font-bold underline text-emerald-800">
            Tutup
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 1: SINGLE STORE TRANSACTION */}
      {/* ============================================================== */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLS: FORM HEADER & PRODUCT SELECTION */}
          <div className="lg:col-span-7 space-y-6">
            {/* Store & Transaction Info Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <StoreIcon className="w-4 h-4 text-amber-600" />
                  <span>Informasi Toko Mitra & Nota</span>
                </span>
                {/* Trigger Modal Edit Harga Kategori */}
                <button
                  type="button"
                  onClick={() => setShowPriceModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  <span>Edit Harga per Kategori</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Toko Selector */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pilih Toko Mitra</label>
                  <select
                    value={selectedStoreId || 'custom'}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.store_name} ({st.store_code})
                      </option>
                    ))}
                    <option value="custom">+ Toko / Pembeli Baru (Manual)</option>
                  </select>
                </div>

                {/* Tanggal Transaksi */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tanggal Transaksi</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Nama Toko / Pembeli */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Nama Toko / Penerima</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Contoh: Toko Berkah Aoka"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['tunai', 'transfer', 'tempo'] as const).map(met => (
                      <button
                        key={met}
                        type="button"
                        onClick={() => setPaymentMethod(met)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                          paymentMethod === met
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {met}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Selector with Live Stock Badges */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Katalog Varian Roti Aoka</span>
                </span>

                {/* Search Box */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Cari varian / rasa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-all ${
                    selectedCategory === 'All'
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Semua ({products.length})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-amber-700 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Product Cards Grid with Live Sisa Stok Gudang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
                {filteredProducts.map(p => {
                  const allocated = cartAllocatedPieces[p.id] || 0;
                  const liveStock = getLiveProductStock(p.id, allocated);
                  const isOut = liveStock.remainingBoxes <= 0;
                  const priceKardus = getStoreProductPrice(selectedStoreId || null, p.id, 'kardus');

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isOut
                          ? 'border-rose-200 bg-rose-50/40 opacity-90'
                          : 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Status Badge Sisa Stok Gudang */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md uppercase">
                            {p.category_name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isOut
                              ? 'bg-rose-200 text-rose-900 font-extrabold'
                              : liveStock.remainingBoxes <= 5
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOut ? 'STOK HABIS (0 DUS)' : `Sisa ${liveStock.remainingBoxes} Dus (${liveStock.remainingPieces} bks)`}
                          </span>
                        </div>

                        {/* Title & Flavor */}
                        <h4 className="font-bold text-xs text-stone-900 leading-tight">
                          {p.name}
                        </h4>
                        <div className="text-[11px] text-stone-500 font-medium mb-2">
                          Rasa: {p.flavor}
                        </div>

                        <div className="text-xs font-bold text-amber-900 mb-3">
                          Rp {priceKardus.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-stone-500">/ Dus (60 pcs)</span>
                        </div>
                      </div>

                      {/* Action Buttons: Add / 1-Click Swap */}
                      <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
                        {isOut ? (
                          <button
                            type="button"
                            onClick={() => handleSwapVariant(p.id)}
                            className="w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-all shadow-xs"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>1-Click Swap Varian Ready</span>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(p, 'kardus')}
                              className="flex-1 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-all"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Dus</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(p, 'bungkus')}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-lg text-xs transition-all"
                              title="Tambah Satuan Bungkus / Pcs"
                            >
                              + Bks
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: ORDER SUMMARY & CASHIER ACTIONS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-md flex flex-col justify-between min-h-[580px]">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base">Keranjang Nota</h3>
                    <p className="text-[11px] text-stone-500">{cartItems.length} varian dipilih</p>
                  </div>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCartItems([])}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Kosongkan
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 mb-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/70 text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-stone-900">{item.product_name}</div>
                          <div className="text-[11px] text-stone-500">
                            Rp {item.unit_price.toLocaleString('id-ID')} / {item.unit_type}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Controls: Unit Toggle & Qty buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/50">
                        <button
                          type="button"
                          onClick={() => handleToggleUnitType(idx)}
                          className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 font-bold text-[10px] hover:bg-stone-300"
                        >
                          Satuan: {item.unit_type.toUpperCase()} ⮂
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(idx, item.qty - 1)}
                            className="w-6 h-6 rounded-md bg-white border border-stone-300 font-bold flex items-center justify-center hover:bg-stone-100"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateQty(idx, parseInt(e.target.value) || 1)}
                            className="w-12 text-center py-0.5 bg-white border border-stone-300 rounded-md font-bold text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(idx, item.qty + 1)}
                            className="w-6 h-6 rounded-md bg-white border border-stone-300 font-bold flex items-center justify-center hover:bg-stone-100"
                          >
                            +
                          </button>
                          <span className="font-bold text-stone-900 w-20 text-right">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {cartItems.length === 0 && (
                    <div className="py-12 text-center text-stone-400 text-xs">
                      <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-700" />
                      Belum ada varian roti di keranjang.
                      <p className="text-[11px] text-stone-400 mt-1">Klik tombol "+ Dus" pada katalog di sebelah kiri.</p>
                    </div>
                  )}
                </div>

                {/* Notes Input */}
                <div className="mb-4">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Catatan Tambahan (Opsional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Titip nota tempo 7 hari / driver Pak Budi"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Bottom Summary & Submit Buttons */}
              <div className="border-t border-stone-200 pt-4 space-y-3">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Total Item & Satuan:</span>
                    <span className="font-bold text-stone-900">
                      {cartItems.reduce((acc, it) => acc + it.qty, 0)} {cartItems[0]?.unit_type || 'dus'}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-serif font-bold text-stone-950 pt-2 border-t border-stone-100">
                    <span>Total Tagihan:</span>
                    <span className="text-amber-900 text-lg">Rp {grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting || cartItems.length === 0}
                    onClick={() => handleSubmitSingleTransaction(false)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Simpan Saja</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || cartItems.length === 0}
                    onClick={() => handleSubmitSingleTransaction(true)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Simpan & Cetak</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: BATCH QUICK PROMPT QUEUE */}
      {/* ============================================================== */}
      {activeTab === 'batch' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 6 COLS: TEXT PROMPT INPUT */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Input Teks Multi-Toko Cepat</span>
              </span>
              <button
                type="button"
                onClick={handleParseBatch}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Parse Antrean</span>
              </button>
            </div>

            <p className="text-xs text-stone-500">
              Ketik pesanan beberapa toko sekaligus (satu toko per baris). Sistem otomatis mendeteksi nama toko, jumlah dus, dan nama varian rasa roti Aoka.
            </p>

            <textarea
              rows={9}
              value={batchRawInput}
              onChange={(e) => setBatchRawInput(e.target.value)}
              placeholder="Contoh:&#10;Bu Siti: 5 dus panggang cokelat, 3 dus gulung keju&#10;Niki Snack: 10 dus panggang keju&#10;Mustofa: 8 dus momotaro red bean"
              className="w-full p-3 font-mono text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">💡 Format Rekomendasi:</span>
              <code className="text-[11px] block text-amber-800">[Nama Toko]: [Jumlah] dus [Varian], [Jumlah] dus [Varian]</code>
              <p className="text-[10px] text-amber-700 mt-1">
                Contoh: <span className="font-semibold">Cura Malang: 10 dus sandwich blueberry, 5 dus gulung cokelat</span>
              </p>
            </div>
          </div>

          {/* RIGHT 6 COLS: PARSED QUEUE & EXECUTE ALL */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-amber-600" />
                  <span>Preview Antrean Siap Proses ({batchParsedQueue.length} Toko)</span>
                </span>
              </div>
              <button
                type="button"
                disabled={isSubmitting || batchParsedQueue.length === 0}
                onClick={handleProcessAllBatch}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Proses Semua Antrean Sekaligus</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {batchParsedQueue.map((queueItem, qIdx) => (
                <div key={qIdx} className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-stone-900 flex items-center gap-2">
                      <StoreIcon className="w-3.5 h-3.5 text-amber-700" />
                      <span>{queueItem.storeName}</span>
                      {queueItem.matchedStore && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          Terdaftar: {queueItem.matchedStore.store_code}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-amber-900">
                      Rp {queueItem.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {queueItem.hasError ? (
                    <div className="p-2 rounded bg-rose-100 text-rose-800 flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{queueItem.errorMsg}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 pl-5 border-l-2 border-amber-300">
                      {queueItem.items.map((it, itIdx) => (
                        <div key={itIdx} className="flex justify-between text-[11px] text-stone-600">
                          <span>{it.qty} {it.unitType} {it.product.name}</span>
                          <span className="font-medium text-stone-800">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {batchParsedQueue.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-xs">
                  Belum ada antrean yang diparse. Masukkan teks di sebelah kiri lalu klik "Parse Antrean".
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Price Modal */}
      <CategoryPriceModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        storeId={selectedStoreId}
        storeName={buyerName}
      />

      {/* Receipt Modal */}
      {completedTx && (
        <ReceiptModal
          transaction={completedTx}
          isOpen={!!completedTx}
          onClose={() => setCompletedTx(null)}
        />
      )}
    </div>
  );
};
