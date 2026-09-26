import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

export const ProductList: React.FC = () => {
  const { products, categories, addProduct, updateProduct, getLiveProductStock } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    slug: '',
    category_name: categories[0]?.name || 'Roti Panggang',
    flavor: '',
    price_per_kardus: 106000,
    price_per_bungkus: 2500,
    pieces_per_box: 60,
    stock: 600,
    boxes_stock: 10,
    is_active: true
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.flavor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'All' || p.category_name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Open Edit Modal
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      category_name: p.category_name,
      flavor: p.flavor,
      price_per_kardus: p.price_per_kardus,
      price_per_bungkus: p.price_per_bungkus,
      pieces_per_box: p.pieces_per_box,
      stock: p.stock,
      boxes_stock: p.boxes_stock,
      is_active: p.is_active
    });
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category_name: categories[0]?.name || 'Roti Panggang',
      flavor: '',
      price_per_kardus: 106000,
      price_per_bungkus: 2500,
      pieces_per_box: 60,
      stock: 600,
      boxes_stock: 10,
      is_active: true
    });
    setIsAddModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama varian roti tidak boleh kosong.');
      return;
    }

    const ppb = formData.pieces_per_box > 0 ? formData.pieces_per_box : 60;
    const finalStock = formData.boxes_stock * ppb;

    const payload = {
      ...formData,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      stock: finalStock
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, payload);
    } else {
      await addProduct(payload);
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>Master Data Produk</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Daftar 21 Varian Roti Aoka
          </h1>
          <p className="text-xs text-stone-500">
            Katalog resmi produk PT Indonesia Bakery Family dengan penetapan standar harga kardus & bungkus.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Varian Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
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
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                  selectedCategory === cat.name
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari varian atau rasa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(p => {
          const live = getLiveProductStock(p.id);
          const isOut = live.remainingBoxes <= 0;

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                    {p.category_name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOut
                      ? 'bg-rose-100 text-rose-800'
                      : live.remainingBoxes <= 5
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isOut ? 'Habis (0 Dus)' : `${live.remainingBoxes} Dus`}
                  </span>
                </div>

                <h3 className="font-bold text-stone-900 text-sm mb-1 leading-snug">
                  {p.name}
                </h3>
                <div className="text-xs text-stone-500 mb-3">
                  Rasa: <span className="font-semibold text-stone-700">{p.flavor}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1 text-xs mb-3">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Harga Kardus:</span>
                    <span className="font-bold text-amber-900">
                      Rp {p.price_per_kardus.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Harga Satuan:</span>
                    <span className="font-semibold text-stone-700">
                      Rp {p.price_per_bungkus.toLocaleString('id-ID')} / bks
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-stone-200/60 text-stone-500">
                    <span>Isi per Kardus:</span>
                    <span>{p.pieces_per_box || 60} bungkus</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  Total {live.remainingPieces} pcs
                </span>
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingProduct ? 'Edit Varian Roti Aoka' : 'Tambah Varian Roti Baru'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Produk Varian</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Roti Panggang Durian"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Varian Rasa</label>
                  <input
                    type="text"
                    required
                    value={formData.flavor}
                    onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
                    placeholder="Contoh: Durian"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Harga per Dus (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price_per_kardus}
                    onChange={(e) => setFormData({ ...formData, price_per_kardus: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Harga Satuan / Ecer (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price_per_bungkus}
                    onChange={(e) => setFormData({ ...formData, price_per_bungkus: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Isi per Dus (Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.pieces_per_box}
                    onChange={(e) => setFormData({ ...formData, pieces_per_box: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stok Awal Gudang (Dus)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.boxes_stock}
                    onChange={(e) => setFormData({ ...formData, boxes_stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
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
                  {editingProduct ? 'Perbarui Varian' : 'Simpan Produk Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
