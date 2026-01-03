
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { ShopDetail } from './views/ShopDetail';
import { CustomerOrderView } from './views/CustomerOrderView';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isCustomerPage = location.pathname.startsWith('/order');

  if (isCustomerPage) {
    return (
      <Routes>
        <Route path="/order/:shopId/:tableNo" element={<CustomerOrderView />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:shopId" element={<ShopDetail />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
