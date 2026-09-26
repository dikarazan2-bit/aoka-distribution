-- =====================================================================
-- SKEMA DATABASE AOKA DISTRIBUTION ERP (SUPABASE / POSTGRESQL)
-- Siap dieksekusi di Supabase SQL Editor
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL KATEGORI PRODUK
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) DEFAULT 'bakery_dining',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL MASTER PRODUK ROTI AOKA (21 VARIAN)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    flavor VARCHAR(100) NOT NULL,
    price_per_kardus NUMERIC(12, 2) NOT NULL DEFAULT 106000,
    price_per_bungkus NUMERIC(12, 2) NOT NULL DEFAULT 2500,
    pieces_per_box INTEGER NOT NULL DEFAULT 60,
    stock INTEGER NOT NULL DEFAULT 0, -- dalam satuan bungkus
    boxes_stock INTEGER NOT NULL DEFAULT 0, -- dalam satuan dus
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL TOKO MITRA
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(150) NOT NULL,
    store_code VARCHAR(50) UNIQUE,
    address TEXT,
    phone VARCHAR(30),
    contact_person VARCHAR(100),
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL HARGA KHUSUS PER TOKO
CREATE TABLE IF NOT EXISTS store_product_prices (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    price_per_kardus NUMERIC(12, 2) NOT NULL,
    price_per_bungkus NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, product_id)
);

-- 6. TABEL INVENTORI BATCH FIFO GUDANG
CREATE TABLE IF NOT EXISTS inventory_batches (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(100) NOT NULL,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    initial_stock INTEGER NOT NULL, -- bungkus
    current_stock INTEGER NOT NULL, -- bungkus tersisa
    buy_price NUMERIC(12, 2) NOT NULL, -- HPP per bungkus
    purchased_at DATE NOT NULL DEFAULT CURRENT_DATE,
    exp_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL TRANSAKSI DISTRIBUSI TOKO
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
    buyer_name VARCHAR(150) NOT NULL,
    buyer_phone VARCHAR(30),
    buyer_address TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_hpp NUMERIC(14, 2) NOT NULL DEFAULT 0,
    gross_profit NUMERIC(14, 2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'tunai', -- tunai, transfer, tempo
    status VARCHAR(30) NOT NULL DEFAULT 'selesai',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABEL RINCIAN TRANSAKSI (ITEMS)
CREATE TABLE IF NOT EXISTS transaction_details (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    unit_type VARCHAR(20) NOT NULL DEFAULT 'kardus', -- kardus / bungkus
    qty INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
    hpp_recorded NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABEL RETUR BARANG
CREATE TABLE IF NOT EXISTS returns (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id) ON DELETE SET NULL,
    store_name VARCHAR(150),
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    reason VARCHAR(50) NOT NULL, -- expired, kemasan_rusak, sisa_konsinyasi, cacat_pabrik, lainnya
    condition_status VARCHAR(50) NOT NULL, -- damaged, expired, restockable
    action_taken VARCHAR(50) NOT NULL DEFAULT 'waste', -- waste, restock
    loss_amount NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TABEL BIAYA OPERASIONAL
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(100) NOT NULL, -- BBM & Transport, Gaji & Upah, Makan & Konsumsi, Kendaraan & Servis, Listrik & Air, Lainnya
    amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC POLICIES
-- =====================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write stores" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write store_product_prices" ON store_product_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write inventory_batches" ON inventory_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write transaction_details" ON transaction_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write returns" ON returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- SEED DATA AWAL (21 VARIAN ROTI AOKA & TOKO MITRA)
-- =====================================================================

-- Insert Kategori
INSERT INTO categories (id, name, slug, icon) VALUES
(1, 'Roti Panggang', 'roti-panggang', 'bakery_dining'),
(2, 'Roti Gulung Mini', 'roti-gulung-mini', 'cookie'),
(3, 'Roti Gulung Besar', 'roti-gulung-besar', 'cookie'),
(4, 'Byway Donat', 'byway-donat', 'donut_large'),
(5, 'Byway Abon Ayam', 'byway-abon-ayam', 'lunch_dining')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Insert 21 Varian Roti Aoka
INSERT INTO products (id, category_id, category_name, name, slug, flavor, price_per_kardus, price_per_bungkus, pieces_per_box, stock, boxes_stock) VALUES
(1, 1, 'Roti Panggang', 'Aoka Roti Panggang Cokelat', 'aoka-roti-panggang-cokelat', 'Cokelat', 106000, 2500, 60, 960, 16),
(2, 1, 'Roti Panggang', 'Aoka Roti Panggang Keju', 'aoka-roti-panggang-keju', 'Keju', 106000, 2500, 60, 960, 16),
(3, 1, 'Roti Panggang', 'Aoka Roti Panggang Vanilla', 'aoka-roti-panggang-vanilla', 'Vanilla', 106000, 2500, 60, 960, 16),
(4, 1, 'Roti Panggang', 'Aoka Roti Panggang Strawberry', 'aoka-roti-panggang-strawberry', 'Strawberry', 106000, 2500, 60, 960, 16),
(5, 1, 'Roti Panggang', 'Aoka Roti Panggang Blueberry', 'aoka-roti-panggang-blueberry', 'Blueberry', 106000, 2500, 60, 960, 16),
(6, 1, 'Roti Panggang', 'Aoka Roti Panggang Durian', 'aoka-roti-panggang-durian', 'Durian', 106000, 2500, 60, 960, 16),
(7, 1, 'Roti Panggang', 'Aoka Roti Panggang Mangga', 'aoka-roti-panggang-mangga', 'Mangga', 106000, 2500, 60, 960, 16),
(8, 1, 'Roti Panggang', 'Aoka Roti Panggang Pandan', 'aoka-roti-panggang-pandan', 'Pandan', 106000, 2500, 60, 960, 16),
(9, 1, 'Roti Panggang', 'Aoka Roti Panggang Nanas', 'aoka-roti-panggang-nanas', 'Nanas', 106000, 2500, 60, 960, 16),
(10, 2, 'Roti Gulung Mini', 'Aoka Roti Gulung Mini Cokelat', 'aoka-roti-gulung-mini-cokelat', 'Cokelat', 96000, 2500, 60, 960, 16),
(11, 2, 'Roti Gulung Mini', 'Aoka Roti Gulung Mini Keju', 'aoka-roti-gulung-mini-keju', 'Keju', 96000, 2500, 60, 960, 16),
(12, 2, 'Roti Gulung Mini', 'Aoka Roti Gulung Mini Pandan', 'aoka-roti-gulung-mini-pandan', 'Pandan', 96000, 2500, 60, 960, 16),
(13, 2, 'Roti Gulung Mini', 'Aoka Roti Gulung Mini Kelapa', 'aoka-roti-gulung-mini-kelapa', 'Kelapa', 96000, 2500, 60, 960, 16),
(14, 3, 'Roti Gulung Besar', 'Aoka Roti Gulung Besar Cokelat', 'aoka-roti-gulung-besar-cokelat', 'Cokelat', 96000, 2500, 60, 960, 16),
(15, 3, 'Roti Gulung Besar', 'Aoka Roti Gulung Besar Keju', 'aoka-roti-gulung-besar-keju', 'Keju', 96000, 2500, 60, 960, 16),
(16, 3, 'Roti Gulung Besar', 'Aoka Roti Gulung Besar Pandan', 'aoka-roti-gulung-besar-pandan', 'Pandan', 96000, 2500, 60, 960, 16),
(17, 4, 'Byway Donat', 'Byway Donat Cokelat', 'byway-donat-cokelat', 'Cokelat', 106000, 2500, 60, 960, 16),
(18, 4, 'Byway Donat', 'Byway Donat Keju', 'byway-donat-keju', 'Keju', 106000, 2500, 60, 960, 16),
(19, 5, 'Byway Abon Ayam', 'Byway Abon Ayam Original', 'byway-abon-ayam-original', 'Original', 97000, 2500, 60, 960, 16),
(20, 5, 'Byway Abon Ayam', 'Byway Abon Ayam Pedas', 'byway-abon-ayam-pedas', 'Pedas', 97000, 2500, 60, 960, 16),
(21, 5, 'Byway Abon Ayam', 'Byway Abon Ayam Manis', 'byway-abon-ayam-manis', 'Manis', 97000, 2500, 60, 960, 16)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price_per_kardus = EXCLUDED.price_per_kardus;

-- Insert Toko Mitra
INSERT INTO stores (id, store_name, store_code, address, phone, contact_person) VALUES
(1, 'Bu Siti', 'STR-SITI', 'Jl. Pasar Wage No. 12', '081234567891', 'Ibu Siti'),
(2, 'Niki Snack', 'STR-NIKI', 'Jl. Ahmad Yani No. 45', '081234567892', 'Pak Niki'),
(3, 'Cura Malang', 'STR-CURA', 'Kec. Cura Malang', '081234567893', 'Mas Dani'),
(4, 'Mustofa', 'STR-MUST', 'Pasar Induk Blok B', '081234567894', 'H. Mustofa'),
(5, 'Toko Hakam', 'STR-HAKAM', 'Jl. Merdeka No. 18', '081234567895', 'Pak Hakam'),
(6, 'Toko Wiwik', 'STR-WIWIK', 'Jl. Pahlawan No. 7', '081234567896', 'Bu Wiwik')
ON CONFLICT (id) DO UPDATE SET store_name = EXCLUDED.store_name;

-- Reset Sequences agar insert otomatis berjalan lancar
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));
