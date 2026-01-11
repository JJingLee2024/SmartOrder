
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { ShopDetail } from './views/ShopDetail';
import { CustomerOrderView } from './views/CustomerOrderView';

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* 前台點餐頁面：獨立渲染，不包含後台 Sidebar */}
      <Route path="/order/:shopId/:tableNo/:hash" element={<CustomerOrderView />} />
      
      {/* 後台管理頁面：共用 Layout (Sidebar) */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop/:shopId" element={<ShopDetail />} />
            {/* 404 回首頁 */}
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      } />
    </Routes>
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
