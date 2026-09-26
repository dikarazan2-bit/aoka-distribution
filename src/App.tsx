import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TransactionCreate } from './pages/transactions/TransactionCreate';
import { TransactionHistory } from './pages/transactions/TransactionHistory';
import { ProductList } from './pages/products/ProductList';
import { StoreList } from './pages/stores/StoreList';
import { InventoryList } from './pages/inventory/InventoryList';
import { InventoryCreate } from './pages/inventory/InventoryCreate';
import { ReturnList } from './pages/returns/ReturnList';
import { ExpenseList } from './pages/expenses/ExpenseList';
import { ShopCatalog } from './pages/shop/ShopCatalog';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions/create" element={<TransactionCreate />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/stores" element={<StoreList />} />
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/create" element={<InventoryCreate />} />
          <Route path="/returns" element={<ReturnList />} />
          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/shop" element={<ShopCatalog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
