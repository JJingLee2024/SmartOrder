
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, CheckCircle, ChevronLeft } from 'lucide-react';
import { dataService } from '../services/dataService';
import { ShopMenu, OrderItem } from '../types';

export const CustomerOrderView: React.FC = () => {
  const { shopId, tableNo } = useParams<{ shopId: string, tableNo: string }>();
  const [menu, setMenu] = useState<ShopMenu | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (shopId) {
      setMenu(dataService.getMenuByShopId(shopId) || null);
    }
  }, [shopId]);

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

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
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">訂單已成功送出！</h1>
        <p className="text-slate-500 mb-8">廚房已收到您的點單，請稍候片刻。</p>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-xs shadow-sm">
          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">桌號</p>
          <p className="text-3xl font-black text-blue-600">{tableNo}</p>
        </div>
      </div>
    );
  }

  if (!menu) return <div className="p-12 text-center text-slate-400">載入菜單中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <div className="bg-blue-600 p-6 text-white">
        <h1 className="text-xl font-bold">{menu.brandName}</h1>
        <p className="text-sm opacity-80">桌號: {tableNo}</p>
      </div>

      <div className="p-4 space-y-4">
        {menu.items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
              <img src={`https://picsum.photos/seed/${item.id}/200`} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800">{item.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-600 font-bold">${item.price}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold text-slate-600 active:bg-slate-100"
                  >
                    -
                  </button>
                  <span className="w-4 text-center font-bold text-slate-800">{cart[item.id] || 0}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold active:bg-blue-700 shadow-md shadow-blue-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPrice > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 flex flex-col gap-3">
          <div className="flex justify-between items-center px-2">
            <span className="text-slate-500 text-sm">小計</span>
            <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
          >
            <ShoppingCart size={20} />
            送出訂單
          </button>
        </div>
      )}
    </div>
  );
};
