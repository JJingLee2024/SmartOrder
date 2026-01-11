
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PieChart, UtensilsCrossed, Bell } from 'lucide-react';
import { MenuView } from './MenuView';
import { BookingView } from './BookingView';
import { dataService } from '../services/dataService';
import { Shop, Order } from '../types';

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

const OrdersTab: React.FC<{ shopId: string }> = ({ shopId }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = () => {
    setOrders(dataService.getOrders(shopId).sort((a,b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    refreshOrders();
    // 監聽訂單更新事件
    window.addEventListener('order-updated', refreshOrders);
    return () => window.removeEventListener('order-updated', refreshOrders);
  }, [shopId]);

  const handleStatusUpdate = (orderId: string, status: Order['status']) => {
    dataService.updateOrderStatus(orderId, status);
    refreshOrders();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            當前訂單 {orders.filter(o => o.status === 'new').length > 0 && <Bell size={18} className="text-red-500 animate-pulse" />}
          </h2>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center border border-slate-200 text-slate-400">
          目前暫無訂單
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map(order => (
            <div key={order.id} className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${order.status === 'new' ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">桌號 {order.tableNo}</span>
                  <h4 className="text-lg font-bold text-slate-800">#{order.id.slice(-4)}</h4>
                  <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  order.status === 'new' ? 'bg-orange-100 text-orange-600' :
                  order.status === 'served' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {order.status === 'new' ? '新訂單' : order.status === 'served' ? '已出餐' : '已結帳'}
                </div>
              </div>
              
              <div className="space-y-2 mb-6 border-y border-slate-50 py-4 max-h-40 overflow-y-auto">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.name} <span className="text-xs font-bold text-slate-400">x{item.quantity}</span></span>
                    <span className="font-medium text-slate-800">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-slate-400 font-bold uppercase">總金額</span>
                <span className="text-xl font-black text-blue-600">${order.totalPrice}</span>
              </div>

              <div className="flex gap-2">
                {order.status === 'new' && (
                  <button onClick={() => handleStatusUpdate(order.id, 'served')} className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-xl font-bold">出餐</button>
                )}
                {order.status === 'served' && (
                  <button onClick={() => handleStatusUpdate(order.id, 'paid')} className="flex-1 bg-emerald-600 text-white text-sm py-2.5 rounded-xl font-bold">結帳</button>
                )}
                {order.status === 'paid' && (
                  <div className="flex-1 text-center py-2.5 text-emerald-500 text-xs font-bold flex items-center justify-center gap-1">已結清</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReportTab: React.FC = () => (
  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><PieChart size={40} className="text-slate-300" /></div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">數據報表開發中</h3>
    <p className="text-slate-500">即將推出：熱門品項分析與營收概覽。</p>
  </div>
);
