
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Edit2, CheckCircle, Download, Trash2, Plus, QrCode, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { dataService } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { cryptoUtils } from '../utils/crypto';
import { ShopMenu } from '../types';

export const MenuView: React.FC<{ shopId: string }> = ({ shopId }) => {
  const [menu, setMenu] = useState<ShopMenu | null>(null);
  const [step, setStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tableInput, setTableInput] = useState('A1, A2, A3, B1, B2');

  useEffect(() => {
    const existing = dataService.getMenuByShopId(shopId);
    if (existing) {
      setMenu(existing);
      setStep(existing.isPublished ? 3 : 2);
    }
  }, [shopId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
        const base64 = result.split(',')[1];
        const shop = dataService.getShops().find(s => s.id === shopId);
        const parsed = await geminiService.parseMenuFromImage(base64, mimeType, shop?.name || '我的店鋪');
        const newMenu: ShopMenu = {
          id: crypto.randomUUID(),
          shopId,
          brandName: parsed.brandName || shop?.name || '我的店鋪',
          categories: parsed.categories || [],
          items: (parsed.items || []).map((it: any) => ({ ...it, id: crypto.randomUUID(), price: Number(it.price) || 0 })),
          isPublished: false
        };
        setMenu(newMenu);
        dataService.saveMenu(newMenu);
        setStep(2);
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    if (menu) {
      const publishedMenu = { ...menu, isPublished: true };
      setMenu(publishedMenu);
      dataService.saveMenu(publishedMenu);
      dataService.saveTables(shopId, tableInput.split(',').map(s => s.trim()));
      setStep(3);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (!menu) return;
    const updated = { ...menu, items: menu.items.filter(it => it.id !== id) };
    setMenu(updated);
    dataService.saveMenu(updated);
  };

  if (step === 3 && menu) {
    const tables = dataService.getTables(shopId);
    
    // 取得當前 index.html 的完整基礎路徑 (包含可能的目錄層級)
    const baseHref = window.location.href.split('#')[0];

  const handleClearMenu = () => {
    if (!menu) return;
    if (window.confirm('確定要清空所有菜單項目嗎？此操作無法復原。')) {
      const updated = { ...menu, items: [] };
      setMenu(updated);
      dataService.saveMenu(updated);
    }
  };

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">桌號與 QR Code 管理</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables.map(table => {
                const hash = cryptoUtils.generateTableHash(table.tableNo);
                // 修正後的 URL 生成：確保包含基礎路徑
                const orderUrl = `${baseHref}#/order/${shopId}/${table.tableNo}/${hash}`;
                return (
                  <div key={table.id} className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow group">
                    <span className="font-bold text-slate-700">桌號: {table.tableNo}</span>
                    <div className="p-3 bg-slate-50 rounded-xl relative">
                      <QRCodeSVG value={orderUrl} size={110} includeMargin={true} />
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-2">
                       <button 
                        onClick={() => window.open(orderUrl, '_blank')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
                      >
                        <ExternalLink size={14} /> 在新分頁預覽
                      </button>
                      <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        <Download size={14} /> 下載圖檔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">菜單持續編輯</h3>
              <button 
                onClick={handleClearMenu}
                className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                title="清空所有菜單"
              >
                <Trash2 size={16} /> 清空菜單
              </button>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                <h4 className="font-bold text-lg">{menu.brandName}</h4>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">已發布</span>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto space-y-3">
                {menu.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">${item.price}</p>
                    </div>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-500 transition-all">
                   <Plus size={16} /> 新增菜品項目
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-4 py-6 bg-white rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
        {[{ s: 1, l: '1. 匯入菜單', active: step >= 1 }, { s: 2, l: '2. 編輯內容', active: step >= 2 }, { s: 3, l: '3. 發布管理', active: step >= 3 }].map((item) => (
          <div key={item.s} className="flex items-center gap-3 flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${item.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {item.s}
            </div>
            <span className={`text-sm font-semibold whitespace-nowrap ${item.active ? 'text-slate-800' : 'text-slate-300'}`}>{item.l}</span>
            {item.s < 3 && <div className="w-12 h-[2px] bg-slate-100 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 flex flex-col h-[600px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Edit2 size={18} className="text-blue-600" /> AI 菜單編輯助手
            </h3>
          </div>
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-blue-50 p-4 rounded-2xl rounded-tl-none border border-blue-100 max-w-[85%]">
                  <p className="text-sm text-blue-800 font-medium">你好！我是你的 AI 助理。請上傳紙本菜單照片，我將自動建立點餐系統。</p>
                </div>
                <div className="flex flex-col items-center gap-4 py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group" onClick={() => !isParsing && fileInputRef.current?.click()}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isParsing ? 'bg-blue-600 text-white' : 'bg-white text-slate-300 shadow-sm group-hover:text-blue-500 group-hover:scale-110'} transition-all`}>
                    <Upload size={32} className={isParsing ? 'animate-bounce' : ''} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-800 font-bold text-lg">{isParsing ? 'AI 正在解析中...' : '拖放或點擊上傳'}</p>
                    <p className="text-slate-400 text-sm mt-1">支援 JPEG, PNG (建議影像清晰)</p>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>
              </div>
            )}
            {step === 2 && menu && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-emerald-50 p-4 rounded-2xl rounded-tl-none border border-emerald-100 max-w-[85%]">
                  <p className="text-sm text-emerald-800 font-medium">解析完成！請確認右側預覽內容。如果桌號有誤，請在此修改：</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">桌號清單（以逗號分隔）</label>
                  <input 
                    type="text" 
                    value={tableInput} 
                    onChange={(e) => setTableInput(e.target.value)} 
                    className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-mono" 
                    placeholder="A1, A2, B1..." 
                  />
                </div>
                <button 
                  onClick={handlePublish} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100 transition-all transform hover:-translate-y-1"
                >
                  <CheckCircle size={20} /> 完成並發布菜單
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[48px] p-6 border-[12px] border-slate-800 shadow-2xl h-[600px] flex flex-col relative overflow-hidden group">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-800 rounded-b-3xl z-10 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
          </div>
          <div className="flex-1 bg-white rounded-[32px] overflow-hidden mt-6 flex flex-col shadow-inner">
            <div className="bg-blue-600 p-6 text-white text-center">
               <h4 className="font-black text-lg tracking-tight">{menu?.brandName || '我的店舖名稱'}</h4>
               <p className="text-[10px] opacity-70 mt-1 uppercase tracking-widest">前台點餐預覽</p>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
              {!menu ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-200 gap-4">
                  <QrCode size={64} strokeWidth={1} />
                  <p className="text-sm font-medium">等待菜單解析...</p>
                </div>
              ) : (
                menu.items.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-50">
                      <img src={`https://picsum.photos/seed/${item.id}/200`} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{item.category}</p>
                      <p className="text-blue-600 font-black mt-2 text-sm">${item.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {menu && (
               <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <div className="bg-blue-600 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-100">
                    查看購物車
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
