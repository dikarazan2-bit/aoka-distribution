import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store as StoreIcon, 
  Plus, 
  Search, 
  Edit2, 
  Phone, 
  MapPin, 
  User, 
  ShoppingBag, 
  Receipt,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Store } from '../../types';

export const StoreList: React.FC = () => {
  const { stores, addStore, updateStore, transactions } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Store, 'id'>>({
    store_name: '',
    store_code: '',
    address: '',
    phone: '',
    contact_person: '',
    status: 'aktif'
  });

  const filteredStores = stores.filter(s => 
    s.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.store_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingStore(null);
    const randCode = 'TK-' + (stores.length + 1).toString().padStart(3, '0');
    setFormData({
      store_name: '',
      store_code: randCode,
      address: '',
      phone: '',
      contact_person: '',
      status: 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      store_name: store.store_name,
      store_code: store.store_code,
      address: store.address || '',
      phone: store.phone || '',
      contact_person: store.contact_person || '',
      status: store.status || 'aktif'
    });
    setIsModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.store_name.trim()) {
      alert('Nama toko mitra tidak boleh kosong.');
      return;
    }

    if (editingStore) {
      await updateStore(editingStore.id, formData);
    } else {
      await addStore(formData);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold mb-1">
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Master Data Toko Mitra</span>
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900">
            Jaringan Toko Mitra & Agen Distribusi
          </h1>
          <p className="text-xs text-stone-500">
            Kelola data toko langganan, kontak penanggung jawab, dan riwayat transaksi masing-masing toko.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Toko Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Cari toko mitra, kode toko, kontak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map(store => {
          const storeTx = transactions.filter(t => t.store_id === store.id || t.store_name === store.store_name);
          const totalSpent = storeTx.reduce((acc, t) => acc + t.total_amount, 0);

          return (
            <div
              key={store.id}
              className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    {store.store_code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {store.status || 'Aktif'}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-stone-900 text-base mb-1">
                  {store.store_name}
                </h3>

                <div className="space-y-1.5 text-xs text-stone-600 mb-4 mt-3">
                  {store.contact_person && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{store.contact_person}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{store.address}</span>
                    </div>
                  )}
                </div>

                {/* Sales Snapshot */}
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Total Pesanan</span>
                    <span className="font-bold text-stone-900">{storeTx.length} Nota</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-500 uppercase block font-semibold">Akumulasi Belanja</span>
                    <span className="font-bold text-amber-900">Rp {totalSpent.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(store)}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <Link
                  to={`/transactions/create?storeId=${store.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Buat Nota</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingStore ? 'Edit Toko Mitra' : 'Tambah Toko Mitra Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nama Toko Mitra</label>
                <input
                  type="text"
                  required
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  placeholder="Contoh: Bu Siti Snack"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Kode Toko</label>
                  <input
                    type="text"
                    required
                    value={formData.store_code}
                    onChange={(e) => setFormData({ ...formData, store_code: e.target.value })}
                    placeholder="Contoh: TK-001"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Penanggung Jawab / Pemilik</label>
                  <input
                    type="text"
                    value={formData.contact_person || ''}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Contoh: Ibu Siti"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">No. WhatsApp / Telepon</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Alamat Lengkap Toko</label>
                <textarea
                  rows={3}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Raya Pasar Timur No. 12"
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
                  {editingStore ? 'Simpan Perubahan' : 'Daftarkan Toko'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
