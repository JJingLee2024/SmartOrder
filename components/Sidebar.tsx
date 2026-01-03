
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Store, UserCircle, ChevronRight, X } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Shop, User } from '../types';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newShopName, setNewShopName] = useState('');

  useEffect(() => {
    setUser(dataService.getOrCreateUser());
    setShops(dataService.getShops());
    
    const handleShopCreated = () => setShops(dataService.getShops());
    window.addEventListener('shop-created', handleShopCreated);
    return () => window.removeEventListener('shop-created', handleShopCreated);
  }, []);

  const currentShopId = location.pathname.split('/')[2];

  const handleConfirmCreate = () => {
    const currentUser = user || dataService.getOrCreateUser();
    if (newShopName.trim()) {
      const newShop = dataService.addShop(newShopName.trim(), currentUser.id);
      window.dispatchEvent(new Event('shop-created'));
      setIsModalOpen(false);
      setNewShopName('');
      navigate(`/shop/${newShop.id}`);
    }
  };

  return (
    <>
      <div className="w-64 h-full glass border-r border-slate-200 flex flex-col z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Store size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">SmartOrder</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            店舖列表
          </div>
          
          {shops.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              尚未建立店舖
            </div>
          ) : (
            shops.map(shop => (
              <button
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
                  currentShopId === shop.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                  : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Store size={18} />
                <span className="truncate font-medium flex-1 text-sm">{shop.name}</span>
                {currentShopId === shop.id && <ChevronRight size={14} />}
              </button>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg mb-4"
          >
            <Plus size={18} />
            <span>新開店舖</span>
          </button>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <UserCircle size={20} className="text-slate-500" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-700">{user?.name || '匿名用戶'}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">ID: {user?.id.slice(0, 8)}</p>
            </div>
          </div>
        </div>
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
    </>
  );
};
