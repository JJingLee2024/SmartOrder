
import React, { useState, useEffect } from 'react';
import { Plus, User, Phone, Table as TableIcon, CheckCircle, Tag, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Reservation, ReservationSource, ReservationStatus } from '../types';

export const BookingView: React.FC<{ shopId: string }> = ({ shopId }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newRes, setNewRes] = useState({
    phone: '',
    tableNo: '',
    source: '現場' as ReservationSource,
    time: new Date().toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })
  });

  useEffect(() => {
    setReservations(dataService.getReservations(shopId));
  }, [shopId]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const res = dataService.addReservation({
      shopId,
      ...newRes,
      status: '待入座'
    });
    setReservations(prev => [res, ...prev]);
    setIsModalOpen(false);
    setNewRes({ phone: '', tableNo: '', source: '現場', time: '' });
  };

  const handleCheckIn = (res: Reservation) => {
    const updated = { ...res, status: '已入座' as ReservationStatus, checkInTime: Date.now() };
    dataService.updateReservation(updated);
    setReservations(prev => prev.map(r => r.id === res.id ? updated : r));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">入座紀錄與訂位</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all"
        >
          <Plus size={18} />
          新增預約 / 現場客
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">時間</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">桌號</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">客戶電話</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">來源</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">狀態</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">目前暫無紀錄</td>
                </tr>
              ) : (
                reservations.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-300" />
                        <span className="font-medium text-slate-700">{res.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800">{res.tableNo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">{res.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        res.source === '預訂' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        <Tag size={10} />
                        {res.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        res.status === '待入座' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {res.status === '待入座' && (
                        <button 
                          onClick={() => handleCheckIn(res)}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          確認入座
                        </button>
                      )}
                      {res.status === '已入座' && res.checkInTime && (
                        <span className="text-[10px] text-slate-400">入座時間: {new Date(res.checkInTime).toLocaleTimeString()}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">新增訂單 / 入座</h3>
            <form onSubmit={handleAdd} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Phone size={16} /> 客戶電話
                </label>
                <input 
                  required
                  type="text" 
                  value={newRes.phone}
                  onChange={e => setNewRes(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="09xx-xxx-xxx"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <TableIcon size={16} /> 桌號
                  </label>
                  <input 
                    required
                    type="text" 
                    value={newRes.tableNo}
                    onChange={e => setNewRes(prev => ({ ...prev, tableNo: e.target.value }))}
                    placeholder="例如: A1"
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock size={16} /> 時間
                  </label>
                  <input 
                    required
                    type="time" 
                    value={newRes.time}
                    onChange={e => setNewRes(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">來源</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {['預訂', '現場'].map(source => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => setNewRes(prev => ({ ...prev, source: source as ReservationSource }))}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                        newRes.source === source ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      {source}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-100"
                >
                  完成並儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
