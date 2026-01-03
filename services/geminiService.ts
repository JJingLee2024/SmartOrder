
import { GoogleGenAI, Type } from "@google/genai";
import { ShopMenu } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  async parseMenuFromImage(base64Data: string, shopName: string): Promise<Partial<ShopMenu>> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: `你是一位專業的餐廳點餐系統助理。請解析以下菜單圖片，並整理成 JSON 格式。包含菜品分類、菜名、價格。店鋪名稱為：${shopName}` },
              { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              categories: { type: Type.ARRAY, items: { type: Type.STRING } },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    category: { type: Type.STRING }
                  },
                  required: ['name', 'price', 'category']
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Error:", error);
      // Fallback dummy data for POC if API fails or no key
      return {
        brandName: shopName,
        categories: ['主食', '飲品'],
        items: [
          { id: '1', name: '模擬牛肉麵', price: 150, category: '主食' },
          { id: '2', name: '模擬珍珠奶茶', price: 60, category: '飲品' }
        ]
      };
    }
  }
};
