import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Category, Store, Transaction, TransactionDetail, InventoryBatch, ReturnItem, Expense } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_STORES, INITIAL_TRANSACTIONS, INITIAL_BATCHES, INITIAL_EXPENSES, INITIAL_RETURNS } from '../lib/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  products: Product[];
  categories: Category[];
  stores: Store[];
  transactions: Transaction[];
  batches: InventoryBatch[];
  returns: ReturnItem[];
  expenses: Expense[];
  customPrices: Record<number, Record<number, { kardus: number; bungkus: number }>>;
  isSupabaseOnline: boolean;
  isLoading: boolean;
  
  // Actions
  getStoreProductPrice: (storeId: number | null, productId: number, unitType: 'kardus' | 'bungkus') => number;
  getLiveProductStock: (productId: number, allocatedPiecesCount?: number) => {
    remainingBoxes: number;
    remainingPieces: number;
    isOutOfStock: boolean;
    initialBoxes: number;
    initialPieces: number;
  };
  addTransaction: (data: Omit<Transaction, 'id' | 'created_at'>, actionNext?: boolean) => Promise<Transaction>;
  addBatchTransactions: (batchList: Array<{ store: Store; date: string; payMethod: 'tunai' | 'transfer' | 'tempo'; items: TransactionDetail[]; notes?: string }>) => Promise<Transaction[]>;
  deleteTransaction: (id: number) => Promise<void>;
  updateCategoryPrices: (categoryName: string, priceDus?: number, priceBks?: number, storeId?: number | null, saveToMaster?: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  addStore: (store: Omit<Store, 'id'>) => Promise<void>;
  updateStore: (id: number, store: Partial<Store>) => Promise<void>;
  addBatch: (batch: Omit<InventoryBatch, 'id'>) => Promise<void>;
  addReturn: (ret: Omit<ReturnItem, 'id'>) => Promise<void>;
  addExpense: (exp: Omit<Expense, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aoka_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('aoka_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('aoka_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [batches, setBatches] = useState<InventoryBatch[]>(() => {
    const saved = localStorage.getItem('aoka_batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCHES;
  });

  const [returns, setReturns] = useState<ReturnItem[]>(() => {
    const saved = localStorage.getItem('aoka_returns');
    return saved ? JSON.parse(saved) : INITIAL_RETURNS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('aoka_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [customPrices, setCustomPrices] = useState<Record<number, Record<number, { kardus: number; bungkus: number }>>>(() => {
    const saved = localStorage.getItem('aoka_custom_prices');
    return saved ? JSON.parse(saved) : {};
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isSupabaseOnline = isSupabaseConfigured;

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aoka_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aoka_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('aoka_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('aoka_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('aoka_returns', JSON.stringify(returns));
  }, [returns]);

  useEffect(() => {
    localStorage.setItem('aoka_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('aoka_custom_prices', JSON.stringify(customPrices));
  }, [customPrices]);

  // Initial load from Supabase if keys exist
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function loadFromSupabase() {
      try {
        setIsLoading(true);
        const { data: supaProducts } = await supabase.from('products').select('*');
        if (supaProducts && supaProducts.length > 0) setProducts(supaProducts);

        const { data: supaStores } = await supabase.from('stores').select('*');
        if (supaStores && supaStores.length > 0) setStores(supaStores);

        const { data: supaTransactions } = await supabase.from('transactions').select('*, details:transaction_details(*)');
        if (supaTransactions && supaTransactions.length > 0) setTransactions(supaTransactions);

        const { data: supaBatches } = await supabase.from('inventory_batches').select('*');
        if (supaBatches && supaBatches.length > 0) setBatches(supaBatches);

        const { data: supaExpenses } = await supabase.from('expenses').select('*');
        if (supaExpenses && supaExpenses.length > 0) setExpenses(supaExpenses);

        const { data: supaReturns } = await supabase.from('returns').select('*');
        if (supaReturns && supaReturns.length > 0) setReturns(supaReturns);
      } catch (err) {
        console.warn('Gagal memuat data dari Supabase, beralih ke cache lokal:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadFromSupabase();
  }, []);

  // Helper resolve harga toko
  const getStoreProductPrice = (storeId: number | null, productId: number, unitType: 'kardus' | 'bungkus'): number => {
    if (storeId && customPrices[storeId] && customPrices[storeId][productId]) {
      const custom = customPrices[storeId][productId];
      if (unitType === 'kardus' && custom.kardus > 0) return custom.kardus;
      if (unitType === 'bungkus' && custom.bungkus > 0) return custom.bungkus;
    }
    const p = products.find(item => item.id === productId);
    if (!p) return unitType === 'kardus' ? 106000 : 2500;
    if (unitType === 'kardus') {
      return p.price_per_kardus > 0 ? p.price_per_kardus : (p.price_per_bungkus * (p.pieces_per_box || 60));
    }
    return p.price_per_bungkus > 0 ? p.price_per_bungkus : 2500;
  };

  // Helper live stock monitoring
  const getLiveProductStock = (productId: number, allocatedPiecesCount = 0) => {
    const p = products.find(item => item.id === productId);
    if (!p) {
      return { remainingBoxes: 0, remainingPieces: 0, isOutOfStock: true, initialBoxes: 0, initialPieces: 0 };
    }
    const ppb = p.pieces_per_box > 0 ? p.pieces_per_box : 60;
    const initialBoxes = p.boxes_stock || 0;
    const initialPieces = p.stock || (initialBoxes * ppb);

    const remainingPieces = Math.max(0, initialPieces - allocatedPiecesCount);
    const remainingBoxes = Math.floor(remainingPieces / ppb);
    const isOutOfStock = remainingPieces <= 0;

    return {
      remainingBoxes,
      remainingPieces,
      isOutOfStock,
      initialBoxes,
      initialPieces,
    };
  };

  // Action: Tambah Transaksi Single
  const addTransaction = async (data: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const newTx: Transaction = {
      ...data,
      id: newId,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    // 1. Kurangi stok produk secara permanen
    setProducts(prevProds => {
      return prevProds.map(prod => {
        const itemDeduct = data.details.find(d => d.product_id === prod.id);
        if (!itemDeduct) return prod;
        const ppb = prod.pieces_per_box > 0 ? prod.pieces_per_box : 60;
        const deductPieces = itemDeduct.unit_type === 'kardus' ? (itemDeduct.qty * ppb) : itemDeduct.qty;
        const newStock = Math.max(0, prod.stock - deductPieces);
        const newBoxes = Math.floor(newStock / ppb);
        return {
          ...prod,
          stock: newStock,
          boxes_stock: newBoxes
        };
      });
    });

    // 2. Simpan transaksi
    setTransactions(prev => [newTx, ...prev]);

    // 3. Simpan ke Supabase jika aktif
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedTx, error } = await supabase.from('transactions').insert({
          invoice_number: newTx.invoice_number,
          store_id: newTx.store_id,
          buyer_name: newTx.buyer_name,
          buyer_phone: newTx.buyer_phone,
          buyer_address: newTx.buyer_address,
          transaction_date: newTx.transaction_date,
          total_amount: newTx.total_amount,
          total_hpp: newTx.total_hpp,
          gross_profit: newTx.gross_profit,
          payment_method: newTx.payment_method,
          status: newTx.status,
          notes: newTx.notes
        }).select().single();

        if (insertedTx && !error) {
          const detailsPayload = newTx.details.map(d => ({
            transaction_id: insertedTx.id,
            product_id: d.product_id,
            product_name: d.product_name,
            unit_type: d.unit_type,
            qty: d.qty,
            unit_price: d.unit_price,
            subtotal: d.subtotal
          }));
          await supabase.from('transaction_details').insert(detailsPayload);
        }
      } catch (err) {
        console.error('Error insert transaksi ke Supabase:', err);
      }
    }

    return newTx;
  };

  // Action: Tambah Transaksi Antrean Batch Sekaligus
  const addBatchTransactions = async (batchList: Array<{ store: Store; date: string; payMethod: 'tunai' | 'transfer' | 'tempo'; items: TransactionDetail[]; notes?: string }>): Promise<Transaction[]> => {
    const created: Transaction[] = [];
    let curId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

    for (let i = 0; i < batchList.length; i++) {
      const b = batchList[i];
      const totalAmount = b.items.reduce((acc, it) => acc + it.subtotal, 0);
      const totalHpp = b.items.reduce((acc, it) => acc + ((it.hpp_recorded || (it.unit_price * 0.95)) * it.qty), 0);
      const randCode = Math.random().toString(36).substring(2, 7).toUpperCase();
      const invNum = `NOTA-${b.store.store_code || 'DIST'}-${b.date.replace(/-/g, '')}-${randCode}`;

      const newTx: Transaction = {
        id: curId++,
        invoice_number: invNum,
        store_id: b.store.id,
        store_name: b.store.store_name,
        buyer_name: b.store.store_name,
        buyer_phone: b.store.phone,
        buyer_address: b.store.address,
        transaction_date: b.date,
        total_amount: totalAmount,
        total_hpp: totalHpp,
        gross_profit: totalAmount - totalHpp,
        payment_method: b.payMethod,
        status: 'selesai',
        notes: b.notes || 'Batch Antrean Quick Prompt',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        details: b.items
      };

      created.push(newTx);
    }

    // Kurangi stok produk secara total
    setProducts(prevProds => {
      return prevProds.map(prod => {
        let totalDeductPieces = 0;
        created.forEach(tx => {
          tx.details.forEach(item => {
            if (item.product_id === prod.id) {
              const ppb = prod.pieces_per_box > 0 ? prod.pieces_per_box : 60;
              totalDeductPieces += item.unit_type === 'kardus' ? (item.qty * ppb) : item.qty;
            }
          });
        });
        if (totalDeductPieces === 0) return prod;
        const ppb = prod.pieces_per_box > 0 ? prod.pieces_per_box : 60;
        const newStock = Math.max(0, prod.stock - totalDeductPieces);
        return {
          ...prod,
          stock: newStock,
          boxes_stock: Math.floor(newStock / ppb)
        };
      });
    });

    setTransactions(prev => [...created.reverse(), ...prev]);
    return created;
  };

  // Action: Hapus Transaksi & Kembalikan Stok
  const deleteTransaction = async (id: number) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    // Kembalikan stok
    setProducts(prevProds => {
      return prevProds.map(prod => {
        const item = target.details.find(d => d.product_id === prod.id);
        if (!item) return prod;
        const ppb = prod.pieces_per_box > 0 ? prod.pieces_per_box : 60;
        const returnPieces = item.unit_type === 'kardus' ? (item.qty * ppb) : item.qty;
        const newStock = prod.stock + returnPieces;
        return {
          ...prod,
          stock: newStock,
          boxes_stock: Math.floor(newStock / ppb)
        };
      });
    });

    setTransactions(prev => prev.filter(t => t.id !== id));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('transactions').delete().eq('id', id);
    }
  };

  // Action: Update Harga Kategori
  const updateCategoryPrices = async (
    categoryName: string,
    priceDus?: number,
    priceBks?: number,
    storeId?: number | null,
    saveToMaster?: boolean
  ) => {
    const matchingProds = products.filter(p => p.category_name.toLowerCase().includes(categoryName.toLowerCase()));

    // 1. Simpan harga khusus toko jika storeId diberikan
    if (storeId && (priceDus || priceBks)) {
      setCustomPrices(prev => {
        const next = { ...prev };
        if (!next[storeId]) next[storeId] = {};
        matchingProds.forEach(p => {
          const old = next[storeId][p.id] || { kardus: p.price_per_kardus, bungkus: p.price_per_bungkus };
          next[storeId][p.id] = {
            kardus: priceDus || old.kardus,
            bungkus: priceBks || old.bungkus
          };
        });
        return next;
      });
    }

    // 2. Simpan ke master data produk jika diminta
    if (saveToMaster) {
      setProducts(prev => {
        return prev.map(p => {
          if (p.category_name.toLowerCase().includes(categoryName.toLowerCase())) {
            return {
              ...p,
              price_per_kardus: priceDus || p.price_per_kardus,
              price_per_bungkus: priceBks || p.price_per_bungkus
            };
          }
          return p;
        });
      });
    }
  };

  // Actions CRUD Lainnya
  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProd = { ...productData, id: newId };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = async (id: number, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...productData } : p));
  };

  const addStore = async (storeData: Omit<Store, 'id'>) => {
    const newId = stores.length > 0 ? Math.max(...stores.map(s => s.id)) + 1 : 1;
    const newStore = { ...storeData, id: newId };
    setStores(prev => [...prev, newStore]);
  };

  const updateStore = async (id: number, storeData: Partial<Store>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...storeData } : s));
  };

  const addBatch = async (batchData: Omit<InventoryBatch, 'id'>) => {
    const newId = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
    const newBatch = { ...batchData, id: newId };
    setBatches(prev => [newBatch, ...prev]);

    // Tambah stok ke master produk
    setProducts(prev => prev.map(p => {
      if (p.id === batchData.product_id) {
        const ppb = p.pieces_per_box > 0 ? p.pieces_per_box : 60;
        const newStock = p.stock + batchData.initial_stock;
        return {
          ...p,
          stock: newStock,
          boxes_stock: Math.floor(newStock / ppb)
        };
      }
      return p;
    }));
  };

  const addReturn = async (returnData: Omit<ReturnItem, 'id'>) => {
    const newId = returns.length > 0 ? Math.max(...returns.map(r => r.id)) + 1 : 1;
    const newReturn = { ...returnData, id: newId };
    setReturns(prev => [newReturn, ...prev]);

    // Jika restock, kembalikan ke stok
    if (returnData.action_taken === 'restock' && returnData.product_id) {
      setProducts(prev => prev.map(p => {
        if (p.id === returnData.product_id) {
          const ppb = p.pieces_per_box > 0 ? p.pieces_per_box : 60;
          const newStock = p.stock + returnData.qty;
          return { ...p, stock: newStock, boxes_stock: Math.floor(newStock / ppb) };
        }
        return p;
      }));
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id'>) => {
    const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;
    const newExpense = { ...expenseData, id: newId };
    setExpenses(prev => [newExpense, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      products,
      categories,
      stores,
      transactions,
      batches,
      returns,
      expenses,
      customPrices,
      isSupabaseOnline,
      isLoading,
      getStoreProductPrice,
      getLiveProductStock,
      addTransaction,
      addBatchTransactions,
      deleteTransaction,
      updateCategoryPrices,
      addProduct,
      updateProduct,
      addStore,
      updateStore,
      addBatch,
      addReturn,
      addExpense
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
