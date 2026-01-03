
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PieChart, UtensilsCrossed } from 'lucide-react';
import { MenuView } from './MenuView';
import { BookingView } from './BookingView';
import { dataService } from '../services/dataService';
import { Shop } from '../types';

type Tab = 'menu' | 'booking' | 'report' | 'orders';

export const ShopDetail: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [shop, setShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (shopId) {
      const allShops = dataService.getShops();
      const found = allShops.find(s => s.id === shopId);
      if (!found) navigate('/');
      else setShop(found);
    }
  }, [shopId]);

  if (!shop) return null;

  const tabs = [
    { id: 'menu', label: '菜單管理', icon: <BookOpen size={18} /> },
    { id: 'booking', label: '訂位管理', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', label: '訂單管理', icon: <UtensilsCrossed size={18} /> },
    { id: 'report', label: '報表', icon: <PieChart size={18} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{shop.name}</h1>
          <p className="text-sm text-slate-500">店舖控制台</p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-xl glass border border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm shadow-blue-100' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'menu' && <MenuView shopId={shop.id} />}
        {activeTab === 'booking' && <BookingView shopId={shop.id} />}
        {activeTab === 'orders' && <OrdersTab shopId={shop.id} />}
        {activeTab === 'report' && <ReportTab />}
      </div>
    </div>
  );
};

const ReportTab: React.FC = () => (
  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <PieChart size={40} className="text-slate-300" />
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">數據報表開發中</h3>
    <p className="text-slate-500">預計顯示「預訂 vs 現場」佔比、熱門菜色排行榜等關鍵數據。</p>
  </div>
);

const OrdersTab: React.FC<{ shopId: string }> = ({ shopId }) => {
  const [orders, setOrders] = useState(dataService.getOrders(shopId));

  const handleStatusUpdate = (orderId: string, status: any) => {
    dataService.updateOrderStatus(orderId, status);
    setOrders(dataService.getOrders(shopId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">當前訂單</h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 text-slate-400">
          目前暫無訂單
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">桌號 {order.tableNo}</span>
                  <h4 className="text-lg font-bold text-slate-800">訂單 #{order.id.slice(0,4)}</h4>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  order.status === 'new' ? 'bg-orange-100 text-orange-600' :
                  order.status === 'served' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {order.status === 'new' ? '新訂單' : order.status === 'served' ? '已出餐' : '已結帳'}
                </div>
              </div>
              
              <div className="space-y-2 mb-6 border-y border-slate-100 py-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} x {item.quantity}</span>
                    <span className="font-medium text-slate-800">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-slate-400">總金額</span>
                <span className="text-xl font-bold text-blue-600">${order.totalPrice}</span>
              </div>

              <div className="flex gap-2">
                {order.status === 'new' && (
                  <button 
                    onClick={() => handleStatusUpdate(order.id, 'served')}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg font-bold"
                  >
                    出餐
                  </button>
                )}
                {order.status === 'served' && (
                  <button 
                    onClick={() => handleStatusUpdate(order.id, 'paid')}
                    className="flex-1 bg-emerald-600 text-white text-sm py-2 rounded-lg font-bold"
                  >
                    結帳
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
