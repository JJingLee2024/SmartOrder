
import { GoogleGenAI, Type } from "@google/genai";
import { ShopMenu } from "../types";

export const geminiService = {
  /**
   * 使用 Gemini 3 Flash 解析菜單圖片
   * @param base64Data 不含 Data URL 前綴的 Base64 字串
   * @param mimeType 圖片的 MIME 類型 (例如 'image/jpeg', 'image/png')
   * @param shopName 店鋪名稱上下文
   */
  async parseMenuFromImage(base64Data: string, mimeType: string, shopName: string): Promise<Partial<ShopMenu>> {
    // 每次調用時建立實例，確保使用最新的 API Key 並符合 SDK 規範
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `你是一位專業的餐廳點餐系統助理。請解析以下菜單圖片，並整理成符合 Schema 的 JSON 格式。包含品牌名稱、分類以及每個菜品的名稱、價格、分類。如果價格中包含非數字字元，請僅提取數字。店鋪名稱為：${shopName}` },
            { 
              inlineData: { 
                mimeType: mimeType || 'image/jpeg', 
                data: base64Data 
              } 
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING, description: "餐廳品牌名稱" },
              categories: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "菜品分類清單"
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "菜名" },
                    price: { type: Type.NUMBER, description: "單價" },
                    category: { type: Type.STRING, description: "所屬分類" }
                  },
                  required: ['name', 'price', 'category']
                }
              }
            },
            required: ['brandName', 'categories', 'items']
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Parse Error:", error);
      
      // 回傳模擬數據，確保 POC 流程不因 API 報錯而中斷
      // 修正：為模擬數據中的 MenuItem 添加必要的 'id' 屬性以符合類型宣告
      return {
        brandName: shopName || '解析失敗店鋪',
        categories: ['精選主食', '推薦飲品'],
        items: [
          { id: crypto.randomUUID(), name: '解析失敗-範例牛肉麵', price: 150, category: '精選主食' },
          { id: crypto.randomUUID(), name: '解析失敗-範例冰紅茶', price: 40, category: '推薦飲品' }
        ]
      };
    }
  }
};
