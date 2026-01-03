
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Edit2, CheckCircle, Download, Trash2, Plus, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { dataService } from '../services/dataService';
import { geminiService } from '../services/geminiService';
import { ShopMenu, MenuItem } from '../types';

export const MenuView: React.FC<{ shopId: string }> = ({ shopId }) => {
  const [menu, setMenu] = useState<ShopMenu | null>(null);
  const [step, setStep] = useState(1); // 1: Import, 2: Edit, 3: Published
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
      const base64 = (reader.result as string).split(',')[1];
      const parsed = await geminiService.parseMenuFromImage(base64, '我的店鋪');
      
      const newMenu: ShopMenu = {
        id: crypto.randomUUID(),
        shopId,
        brandName: parsed.brandName || '我的店鋪',
        categories: parsed.categories || [],
        items: (parsed.items || []).map((it: any) => ({ ...it, id: crypto.randomUUID() })),
        isPublished: false
      };
      
      setMenu(newMenu);
      dataService.saveMenu(newMenu);
      setIsParsing(false);
      setStep(2);
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
    const newItems = menu.items.filter(it => it.id !== id);
    const updated = { ...menu, items: newItems };
    setMenu(updated);
    dataService.saveMenu(updated);
  };

  if (step === 3 && menu) {
    const tables = dataService.getTables(shopId);
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">桌號與 QR Code 管理</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables.map(table => (
                <div key={table.id} className="bg-white p-4 border border-slate-200 rounded-2xl flex flex-col items-center gap-4">
                  <span className="font-bold text-slate-700">桌號: {table.tableNo}</span>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <QRCodeSVG 
                        value={`${window.location.origin}/#/order/${shopId}/${table.tableNo}`} 
                        size={120} 
                        includeMargin={true}
                    />
                  </div>
                  <button className="text-blue-600 text-xs font-semibold flex items-center gap-1">
                    <Download size={12} /> 下載 QR Code
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">菜單持續編輯</h3>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 bg-blue-600 text-white">
                <h4 className="font-bold text-lg">{menu.brandName}</h4>
              </div>
              <div className="p-4 max-h-[500px] overflow-y-auto space-y-4">
                {menu.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-400">${item.price}</p>
                    </div>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <Plus size={16} /> 新增菜品
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
      {/* Step Progress Bar */}
      <div className="flex items-center justify-between px-4 py-6 bg-white rounded-2xl border border-slate-200">
        {[
          { s: 1, l: '1. 匯入菜單', active: step >= 1 },
          { s: 2, l: '2. 編輯內容', active: step >= 2 },
          { s: 3, l: '3. 發布管理', active: step >= 3 },
        ].map((item) => (
          <div key={item.s} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              item.active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
            }`}>
              {item.s}
            </div>
            <span className={`text-sm font-semibold ${item.active ? 'text-slate-800' : 'text-slate-300'}`}>
              {item.l}
            </span>
            {item.s < 3 && <div className="w-12 h-[2px] bg-slate-100 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Interaction */}
        <div className="bg-white rounded-3xl border border-slate-200 flex flex-col h-[600px] shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Edit2 size={18} className="text-blue-600" />
              AI 菜單編輯助手
            </h3>
          </div>
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-slate-700">你好！我是你的 AI 助理。請先上傳你的紙本菜單照片或 PDF，我將自動幫你建立點餐系統。</p>
                </div>
                <div className="flex flex-col items-center gap-4 py-8 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isParsing ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-300 shadow-sm'}`}>
                    <Upload size={24} className={isParsing ? 'animate-bounce' : ''} />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-800 font-bold">{isParsing ? 'AI 正在解析中...' : '上傳菜單檔案'}</p>
                    <p className="text-slate-400 text-xs mt-1">支援 JPEG, PNG, PDF</p>
                  </div>
                  {!isParsing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200"
                    >
                      點擊選擇
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-slate-700">太棒了！我已經解析完成。請檢查右側的模擬器內容，你可以隨時點擊進行修改。</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none max-w-[80%] mt-4">
                  <p className="text-sm text-slate-700">接下來，請定義你的桌號。多個桌號請用逗號隔開：</p>
                  <input 
                    type="text" 
                    value={tableInput} 
                    onChange={(e) => setTableInput(e.target.value)}
                    className="w-full mt-2 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button 
                  onClick={handlePublish}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-100"
                >
                  <CheckCircle size={20} />
                  確認並發布菜單
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Simulator */}
        <div className="bg-slate-900 rounded-[40px] p-6 border-[8px] border-slate-800 shadow-2xl h-[600px] flex flex-col relative overflow-hidden">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-full" />
          
          <div className="flex-1 bg-white rounded-3xl overflow-hidden mt-6 flex flex-col">
            <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-xl font-bold tracking-tight">{menu?.brandName || '我的餐廳'}</h2>
              <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                {(menu?.categories || ['所有分類']).map(cat => (
                  <span key={cat} className="text-xs bg-white/20 px-3 py-1 rounded-full whitespace-nowrap">{cat}</span>
                ))}
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {!menu ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
                  <QrCode size={48} />
                  <p className="text-sm">模擬器預覽</p>
                </div>
              ) : (
                menu.items.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
                      <img src={`https://picsum.photos/seed/${item.id}/200`} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{item.category}</p>
                      <p className="text-blue-600 font-bold mt-1 text-sm">${item.price}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
