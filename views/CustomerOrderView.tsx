
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, CheckCircle, AlertTriangle, ChevronRight, Minus, Plus } from 'lucide-react';
import { dataService } from '../services/dataService';
import { cryptoUtils } from '../utils/crypto';
import { ShopMenu, OrderItem } from '../types';

export const CustomerOrderView: React.FC = () => {
  const params = useParams<{ shopId: string, tableNo: string, hash: string }>();
  const { shopId, tableNo, hash } = params;

  const [menu, setMenu] = useState<ShopMenu | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  useEffect(() => {
    // 1. 驗證雜湊
    if (tableNo && hash) {
      const isValid = cryptoUtils.validateHash(tableNo, hash);
      if (!isValid) {
        setError("此點餐連結已過期或不正確，請重新掃描桌上的 QR Code。");
        return;
      }
    }

    // 2. 獲取菜單
    if (shopId) {
      const shopMenu = dataService.getMenuByShopId(shopId);
      if (shopMenu) {
        setMenu(shopMenu);
      } else {
        setError("目前找不到這家餐廳的菜單。");
      }
    }
  }, [shopId, tableNo, hash]);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const filteredItems = menu?.items.filter(item => 
    activeCategory === '全部' || item.category === activeCategory
  ) || [];

  const cartItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = menu?.items.reduce((sum, item) => {
    return sum + (item.price * (cart[item.id] || 0));
  }, 0) || 0;

  const handleSubmit = () => {
    if (!menu || !shopId || !tableNo) return;
    
    const orderItems: OrderItem[] = menu.items
      .filter(item => cart[item.id] > 0)
      .map(item => ({
        menuItemId: item.id,
        name: item.name,
        quantity: cart[item.id],
        price: item.price
      }));

    if (orderItems.length === 0) return;

    dataService.addOrder({
      shopId,
      tableNo,
      items: orderItems,
      totalPrice,
      status: 'new'
    });
    
    setSubmitted(true);
    // 觸發自定義事件通知後台
    window.dispatchEvent(new Event('order-updated'));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">無法載入菜單</h2>
        <p className="text-slate-500 max-w-xs">{error}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-100 border-4 border-white">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">訂單送出成功！</h1>
        <p className="text-slate-500 mb-10 leading-relaxed">主廚已在處理您的餐點，<br/>請稍候片刻，祝您用餐愉快。</p>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 w-full max-w-sm shadow-xl">
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">您所在的桌號</p>
          <p className="text-6xl font-black text-blue-600 tabular-nums">{tableNo}</p>
        </div>
      </div>
    );
  }

  if (!menu) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-medium">正在取得最新菜單...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl px-6 pt-14 pb-6 border-b border-slate-100 sticky top-0 z-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Table {tableNo}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">{menu.brandName}</h1>
          </div>
          <div className="relative">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
              <ShoppingCart size={24} />
            </div>
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white shadow-lg">
                {cartItemsCount}
              </span>
            )}
          </div>
        </div>
        
        {/* Categories Tab */}
        <div className="flex gap-3 mt-8 overflow-x-auto no-scrollbar pb-2">
          {['全部', ...menu.categories].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all ${
                activeCategory === cat 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="p-6 space-y-6 max-w-md mx-auto">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-[32px] border border-slate-100 flex gap-5 shadow-sm active:scale-[0.97] transition-all group">
            <div className="w-28 h-28 bg-slate-50 rounded-[24px] overflow-hidden flex-shrink-0 border border-slate-50 group-hover:scale-105 transition-transform">
              <img src={`https://picsum.photos/seed/${item.id}/200`} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
              <div>
                <h4 className="font-black text-slate-800 text-base leading-tight truncate">{item.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{item.category}</p>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-blue-600 font-black text-xl tracking-tight">${item.price}</span>
                <div className="flex items-center bg-slate-50 rounded-full p-1.5 border border-slate-100 shadow-inner">
                  {cart[item.id] > 0 && (
                    <>
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 active:scale-90 transition-transform"><Minus size={18} /></button>
                      <span className="w-10 text-center font-black text-slate-800 text-sm tabular-nums">{cart[item.id]}</span>
                    </>
                  )}
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"><Plus size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-slate-300 font-medium">此分類目前沒有餐點</div>
        )}
      </div>

      {/* Cart Summary Bar */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-2xl border-t border-slate-100 z-50 flex flex-col gap-4 animate-in slide-in-from-bottom duration-500 rounded-t-[40px] shadow-2xl">
          <div className="flex justify-between items-center px-4">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">已選 {cartItemsCount} 項餐點</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-blue-600">$</span>
                <span className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">{totalPrice}</span>
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-10 py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-100 transition-all"
            >
              送出訂單 <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
