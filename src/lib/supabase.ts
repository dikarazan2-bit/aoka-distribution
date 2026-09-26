import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Inisialisasi Supabase client jika variabel env ada
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper untuk format rupiah
export function formatRupiah(amount: number): string {
  const val = Math.round(Number(amount)) || 0;
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
}

// Helper format kuantitas barang
export function formatGoodsQty(boxes: number, pieces: number): string {
  const b = Math.floor(Number(boxes)) || 0;
  const p = Math.round(Number(pieces)) || 0;
  if (b > 0 && p > 0) return `${b} Dus (${p} bks)`;
  if (b > 0) return `${b} Dus`;
  if (p > 0) return `${p} Bungkus`;
  return `0 Dus`;
}
