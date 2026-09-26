import { Category, Product, Store, Transaction, InventoryBatch, Expense, ReturnItem } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Roti Panggang', slug: 'roti-panggang', icon: 'bakery_dining', description: 'Roti panggang lembut dengan aneka selai buah & keju' },
  { id: 2, name: 'Roti Gulung Mini', slug: 'roti-gulung-mini', icon: 'cookie', description: 'Roti gulung lembut ukuran mini porsi pas' },
  { id: 3, name: 'Roti Gulung Besar', slug: 'roti-gulung-besar', icon: 'cookie', description: 'Roti gulung lembut ukuran besar padat nikmat' },
  { id: 4, name: 'Byway Donat', slug: 'byway-donat', icon: 'donut_large', description: 'Donat lembut bertabur cokelat & keju gurih' },
  { id: 5, name: 'Byway Abon Ayam', slug: 'byway-abon-ayam', icon: 'lunch_dining', description: 'Roti isi abon ayam asli gurih lezat' }
];

export const INITIAL_PRODUCTS: Product[] = [
  // 1. Roti Panggang (9 Varian) - Rp 106.000 / Dus
  { id: 1, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Cokelat', slug: 'aoka-roti-panggang-cokelat', flavor: 'Cokelat', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 2, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Keju', slug: 'aoka-roti-panggang-keju', flavor: 'Keju', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 3, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Vanilla', slug: 'aoka-roti-panggang-vanilla', flavor: 'Vanilla', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 4, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Strawberry', slug: 'aoka-roti-panggang-strawberry', flavor: 'Strawberry', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 5, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Blueberry', slug: 'aoka-roti-panggang-blueberry', flavor: 'Blueberry', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 6, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Durian', slug: 'aoka-roti-panggang-durian', flavor: 'Durian', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 7, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Mangga', slug: 'aoka-roti-panggang-mangga', flavor: 'Mangga', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 8, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Pandan', slug: 'aoka-roti-panggang-pandan', flavor: 'Pandan', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 9, category_id: 1, category_name: 'Roti Panggang', name: 'Aoka Roti Panggang Nanas', slug: 'aoka-roti-panggang-nanas', flavor: 'Nanas', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },

  // 2. Roti Gulung Mini (4 Varian) - Rp 96.000 / Dus
  { id: 10, category_id: 2, category_name: 'Roti Gulung Mini', name: 'Aoka Roti Gulung Mini Cokelat', slug: 'aoka-roti-gulung-mini-cokelat', flavor: 'Cokelat', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 11, category_id: 2, category_name: 'Roti Gulung Mini', name: 'Aoka Roti Gulung Mini Keju', slug: 'aoka-roti-gulung-mini-keju', flavor: 'Keju', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 12, category_id: 2, category_name: 'Roti Gulung Mini', name: 'Aoka Roti Gulung Mini Pandan', slug: 'aoka-roti-gulung-mini-pandan', flavor: 'Pandan', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 13, category_id: 2, category_name: 'Roti Gulung Mini', name: 'Aoka Roti Gulung Mini Kelapa', slug: 'aoka-roti-gulung-mini-kelapa', flavor: 'Kelapa', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },

  // 3. Roti Gulung Besar (3 Varian) - Rp 96.000 / Dus
  { id: 14, category_id: 3, category_name: 'Roti Gulung Besar', name: 'Aoka Roti Gulung Besar Cokelat', slug: 'aoka-roti-gulung-besar-cokelat', flavor: 'Cokelat', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 15, category_id: 3, category_name: 'Roti Gulung Besar', name: 'Aoka Roti Gulung Besar Keju', slug: 'aoka-roti-gulung-besar-keju', flavor: 'Keju', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 16, category_id: 3, category_name: 'Roti Gulung Besar', name: 'Aoka Roti Gulung Besar Pandan', slug: 'aoka-roti-gulung-besar-pandan', flavor: 'Pandan', price_per_kardus: 96000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },

  // 4. Byway Donat (2 Varian) - Rp 106.000 / Dus
  { id: 17, category_id: 4, category_name: 'Byway Donat', name: 'Byway Donat Cokelat', slug: 'byway-donat-cokelat', flavor: 'Cokelat', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 18, category_id: 4, category_name: 'Byway Donat', name: 'Byway Donat Keju', slug: 'byway-donat-keju', flavor: 'Keju', price_per_kardus: 106000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },

  // 5. Byway Abon Ayam (3 Varian) - Rp 97.000 / Dus
  { id: 19, category_id: 5, category_name: 'Byway Abon Ayam', name: 'Byway Abon Ayam Original', slug: 'byway-abon-ayam-original', flavor: 'Original', price_per_kardus: 97000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 20, category_id: 5, category_name: 'Byway Abon Ayam', name: 'Byway Abon Ayam Pedas', slug: 'byway-abon-ayam-pedas', flavor: 'Pedas', price_per_kardus: 97000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
  { id: 21, category_id: 5, category_name: 'Byway Abon Ayam', name: 'Byway Abon Ayam Manis', slug: 'byway-abon-ayam-manis', flavor: 'Manis', price_per_kardus: 97000, price_per_bungkus: 2500, pieces_per_box: 60, stock: 960, boxes_stock: 16, is_active: true },
];

export const INITIAL_STORES: Store[] = [
  { id: 1, store_name: 'Bu Siti', store_code: 'STR-SITI', address: 'Jl. Pasar Wage No. 12', phone: '081234567891', contact_person: 'Ibu Siti', status: 'aktif' },
  { id: 2, store_name: 'Niki Snack', store_code: 'STR-NIKI', address: 'Jl. Ahmad Yani No. 45', phone: '081234567892', contact_person: 'Pak Niki', status: 'aktif' },
  { id: 3, store_name: 'Cura Malang', store_code: 'STR-CURA', address: 'Kec. Cura Malang', phone: '081234567893', contact_person: 'Mas Dani', status: 'aktif' },
  { id: 4, store_name: 'Mustofa', store_code: 'STR-MUST', address: 'Pasar Induk Blok B', phone: '081234567894', contact_person: 'H. Mustofa', status: 'aktif' },
  { id: 5, store_name: 'Toko Hakam', store_code: 'STR-HAKAM', address: 'Jl. Merdeka No. 18', phone: '081234567895', contact_person: 'Pak Hakam', status: 'aktif' },
  { id: 6, store_name: 'Toko Wiwik', store_code: 'STR-WIWIK', address: 'Jl. Pahlawan No. 7', phone: '081234567896', contact_person: 'Bu Wiwik', status: 'aktif' }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    invoice_number: 'NOTA-SITI-20260921-001',
    store_id: 1,
    store_name: 'Bu Siti',
    buyer_name: 'Bu Siti',
    buyer_phone: '081234567891',
    buyer_address: 'Jl. Pasar Wage No. 12',
    transaction_date: '2026-09-21',
    total_amount: 1010000,
    total_hpp: 960000,
    gross_profit: 50000,
    payment_method: 'tunai',
    status: 'selesai',
    notes: 'Distribusi toko mitra Bu Siti',
    created_at: '2026-09-21 10:00:00',
    details: [
      { product_id: 1, product_name: 'Aoka Roti Panggang Cokelat', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 8, product_name: 'Aoka Roti Panggang Pandan', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 4, product_name: 'Aoka Roti Panggang Strawberry', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 5, product_name: 'Aoka Roti Panggang Blueberry', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 2, product_name: 'Aoka Roti Panggang Keju', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 10, product_name: 'Aoka Roti Gulung Mini Cokelat', unit_type: 'kardus', qty: 2, unit_price: 96000, subtotal: 192000 },
      { product_id: 11, product_name: 'Aoka Roti Gulung Mini Keju', unit_type: 'kardus', qty: 1, unit_price: 96000, subtotal: 96000 },
      { product_id: 12, product_name: 'Aoka Roti Gulung Mini Pandan', unit_type: 'kardus', qty: 1, unit_price: 96000, subtotal: 96000 },
      { product_id: 13, product_name: 'Aoka Roti Gulung Mini Kelapa', unit_type: 'kardus', qty: 1, unit_price: 96000, subtotal: 96000 }
    ]
  },
  {
    id: 2,
    invoice_number: 'NOTA-NIKI-20260921-002',
    store_id: 2,
    store_name: 'Niki Snack',
    buyer_name: 'Niki Snack',
    buyer_phone: '081234567892',
    buyer_address: 'Jl. Ahmad Yani No. 45',
    transaction_date: '2026-09-21',
    total_amount: 1010000,
    total_hpp: 960000,
    gross_profit: 50000,
    payment_method: 'tunai',
    status: 'selesai',
    notes: 'Distribusi toko mitra Niki Snack',
    created_at: '2026-09-21 10:15:00',
    details: [
      { product_id: 1, product_name: 'Aoka Roti Panggang Cokelat', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 8, product_name: 'Aoka Roti Panggang Pandan', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 3, product_name: 'Aoka Roti Panggang Vanilla', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 4, product_name: 'Aoka Roti Panggang Strawberry', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 5, product_name: 'Aoka Roti Panggang Blueberry', unit_type: 'kardus', qty: 1, unit_price: 106000, subtotal: 106000 },
      { product_id: 10, product_name: 'Aoka Roti Gulung Mini Cokelat', unit_type: 'kardus', qty: 2, unit_price: 96000, subtotal: 192000 },
      { product_id: 12, product_name: 'Aoka Roti Gulung Mini Pandan', unit_type: 'kardus', qty: 1, unit_price: 96000, subtotal: 96000 },
      { product_id: 13, product_name: 'Aoka Roti Gulung Mini Kelapa', unit_type: 'kardus', qty: 1, unit_price: 96000, subtotal: 96000 },
      { product_id: 11, product_name: 'Aoka Roti Gulung Mini Keju', unit_type: 'kardus', qty: 1, unit_price: 96000, subtotal: 96000 }
    ]
  },
  {
    id: 3,
    invoice_number: 'NOTA-CURA-20260921-003',
    store_id: 3,
    store_name: 'Cura Malang',
    buyer_name: 'Cura Malang',
    buyer_phone: '081234567893',
    buyer_address: 'Kec. Cura Malang',
    transaction_date: '2026-09-21',
    total_amount: 5030000,
    total_hpp: 4776000,
    gross_profit: 254000,
    payment_method: 'tunai',
    status: 'selesai',
    notes: 'Distribusi toko mitra Cura Malang (50 Dus)',
    created_at: '2026-09-21 11:00:00',
    details: [
      { product_id: 1, product_name: 'Aoka Roti Panggang Cokelat', unit_type: 'kardus', qty: 5, unit_price: 106000, subtotal: 530000 },
      { product_id: 8, product_name: 'Aoka Roti Panggang Pandan', unit_type: 'kardus', qty: 3, unit_price: 106000, subtotal: 318000 },
      { product_id: 4, product_name: 'Aoka Roti Panggang Strawberry', unit_type: 'kardus', qty: 3, unit_price: 106000, subtotal: 318000 },
      { product_id: 2, product_name: 'Aoka Roti Panggang Keju', unit_type: 'kardus', qty: 3, unit_price: 106000, subtotal: 318000 },
      { product_id: 10, product_name: 'Aoka Roti Gulung Mini Cokelat', unit_type: 'kardus', qty: 7, unit_price: 96000, subtotal: 672000 }
    ]
  },
  {
    id: 4,
    invoice_number: 'NOTA-MUST-20260921-004',
    store_id: 4,
    store_name: 'Mustofa',
    buyer_name: 'Mustofa',
    buyer_phone: '081234567894',
    buyer_address: 'Pasar Induk Blok B',
    transaction_date: '2026-09-21',
    total_amount: 9040000,
    total_hpp: 8580000,
    gross_profit: 460000,
    payment_method: 'tunai',
    status: 'selesai',
    notes: 'Distribusi toko mitra Mustofa (90 Dus)',
    created_at: '2026-09-21 11:30:00',
    details: [
      { product_id: 6, product_name: 'Aoka Roti Panggang Durian', unit_type: 'kardus', qty: 5, unit_price: 106000, subtotal: 530000 },
      { product_id: 2, product_name: 'Aoka Roti Panggang Keju', unit_type: 'kardus', qty: 5, unit_price: 106000, subtotal: 530000 },
      { product_id: 9, product_name: 'Aoka Roti Panggang Nanas', unit_type: 'kardus', qty: 5, unit_price: 106000, subtotal: 530000 },
      { product_id: 1, product_name: 'Aoka Roti Panggang Cokelat', unit_type: 'kardus', qty: 5, unit_price: 106000, subtotal: 530000 },
      { product_id: 14, product_name: 'Aoka Roti Gulung Besar Cokelat', unit_type: 'kardus', qty: 15, unit_price: 96000, subtotal: 1440000 }
    ]
  }
];

export const INITIAL_BATCHES: InventoryBatch[] = [
  { id: 1, batch_code: 'BATCH-20260920-001', product_id: 1, product_name: 'Aoka Roti Panggang Cokelat', initial_stock: 1200, current_stock: 960, buy_price: 1700, purchased_at: '2026-09-20', exp_date: '2026-12-20', notes: 'Kiriman pabrik Bandung' },
  { id: 2, batch_code: 'BATCH-20260920-002', product_id: 2, product_name: 'Aoka Roti Panggang Keju', initial_stock: 1200, current_stock: 960, buy_price: 1700, purchased_at: '2026-09-20', exp_date: '2026-12-20', notes: 'Kiriman pabrik Bandung' },
  { id: 3, batch_code: 'BATCH-20260920-003', product_id: 17, product_name: 'Byway Donat Cokelat', initial_stock: 1200, current_stock: 960, buy_price: 1700, purchased_at: '2026-09-20', exp_date: '2026-12-20', notes: 'Byway Donat Fresh' },
  { id: 4, batch_code: 'BATCH-20260920-004', product_id: 19, product_name: 'Byway Abon Ayam Original', initial_stock: 1200, current_stock: 960, buy_price: 1550, purchased_at: '2026-09-20', exp_date: '2026-12-20', notes: 'Byway Abon Fresh' }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 1, expense_date: '2026-09-22', category: 'BBM & Transport', amount: 150000, notes: 'Solar armada pengantaran toko' },
  { id: 2, expense_date: '2026-09-22', category: 'Makan & Konsumsi', amount: 45000, notes: 'Makan siang supir & helper pengiriman' }
];

export const INITIAL_RETURNS: ReturnItem[] = [
  { id: 1, store_id: 1, store_name: 'Bu Siti', product_id: 4, product_name: 'Aoka Roti Panggang Strawberry', qty: 3, reason: 'kemasan_rusak', condition_status: 'damaged', action_taken: 'waste', loss_amount: 7500, notes: 'Kemasan sobek saat handling', return_date: '2026-09-22' }
];
