export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Product {
  id: number;
  category_id?: number;
  category_name: string;
  name: string;
  slug: string;
  flavor: string;
  price_per_kardus: number;
  price_per_bungkus: number;
  pieces_per_box: number;
  stock: number; // in pieces / bungkus
  boxes_stock: number; // in boxes / dus
  image_url?: string;
  is_active: boolean;
}

export interface Store {
  id: number;
  store_name: string;
  store_code: string;
  address?: string;
  phone?: string;
  contact_person?: string;
  status?: string;
}

export interface StoreProductPrice {
  id?: number;
  store_id: number;
  product_id: number;
  price_per_kardus: number;
  price_per_bungkus: number;
}

export interface InventoryBatch {
  id: number;
  batch_code: string;
  product_id: number;
  product_name?: string;
  initial_stock: number; // pieces
  current_stock: number; // pieces
  buy_price: number; // HPP per piece
  purchased_at: string;
  exp_date?: string;
  notes?: string;
}

export interface TransactionDetail {
  id?: number;
  transaction_id?: number;
  product_id: number;
  product_name: string;
  unit_type: 'kardus' | 'bungkus';
  qty: number;
  unit_price: number;
  subtotal: number;
  hpp_recorded?: number;
}

export interface Transaction {
  id: number;
  invoice_number: string;
  store_id?: number;
  store_name?: string;
  buyer_name: string;
  buyer_phone?: string;
  buyer_address?: string;
  transaction_date: string;
  total_amount: number;
  total_hpp: number;
  gross_profit: number;
  payment_method: 'tunai' | 'transfer' | 'tempo';
  status: string;
  notes?: string;
  created_at: string;
  details: TransactionDetail[];
}

export interface ReturnItem {
  id: number;
  store_id?: number;
  store_name?: string;
  product_id?: number;
  product_name: string;
  qty: number;
  reason: 'expired' | 'kemasan_rusak' | 'sisa_konsinyasi' | 'cacat_pabrik' | 'lainnya';
  condition_status: 'damaged' | 'expired' | 'restockable';
  action_taken: 'waste' | 'restock';
  loss_amount: number;
  notes?: string;
  return_date: string;
}

export interface Expense {
  id: number;
  expense_date: string;
  category: 'BBM & Transport' | 'Gaji & Upah' | 'Makan & Konsumsi' | 'Kendaraan & Servis' | 'Listrik & Air' | 'Lainnya';
  amount: number;
  notes?: string;
}
