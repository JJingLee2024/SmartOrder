
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store, Zap, BarChart3, Clock, ChevronRight, X } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Shop } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  useEffect(() => {
    setShops(dataService.getShops());
    const handleShopCreated = () => setShops(dataService.getShops());
    window.addEventListener('shop-created', handleShopCreated);
    return () => window.removeEventListener('shop-created', handleShopCreated);
  }, []);

  const handleConfirmCreate = () => {
    const user = dataService.getOrCreateUser();
    if (newShopName.trim()) {
      const newShop = dataService.addShop(newShopName.trim(), user.id);
      window.dispatchEvent(new Event('shop-created'));
      setIsModalOpen(false);
      setNewShopName('');
      navigate(`/shop/${newShop.id}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          歡迎使用 <span className="text-blue-600">SmartOrder</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          整合訂位、桌況與點餐的極簡系統，專為追求數據化經營的店主打造。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Zap size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">快速建單</h3>
          <p className="text-sm text-slate-500">拍照上傳，AI 自動解析菜單，幾分鐘內即可開始營業。</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Clock size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">桌況管理</h3>
          <p className="text-sm text-slate-500">區分預訂與現場客，入座時間自動記錄，告別忙亂。</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">數據分析</h3>
          <p className="text-sm text-slate-500">掌握客群比例與熱門菜色，用數據優化店舖經營。</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">開始你的第一間店舖</h2>
        
        {shops.length === 0 ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-blue-200 transform hover:-translate-y-1"
          >
            <Plus size={24} strokeWidth={3} />
            建立新店舖
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shops.map(shop => (
              <button
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="flex items-center justify-between p-6 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-2xl text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm group-hover:shadow-md transition-all">
                    <Store size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{shop.name}</h4>
                    <p className="text-xs text-slate-400">建立於 {new Date(shop.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center p-6 bg-white border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl text-slate-400 hover:text-blue-500 transition-all"
            >
              <Plus size={24} className="mr-2" />
              <span className="font-medium">新增其他店舖</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Shop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6">建立新店舖</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">店舖名稱</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newShopName}
                  onChange={e => setNewShopName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirmCreate()}
                  placeholder="例如：美味早午餐"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <button 
                onClick={handleConfirmCreate}
                disabled={!newShopName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all mt-4"
              >
                開始建立
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
