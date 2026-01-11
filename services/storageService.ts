
/**
 * Storage Service
 * 負責底層資料的持久化邏輯。目前使用 localStorage，
 * 未來可輕易替換為 Firebase, Supabase 或 REST API。
 */

export const storageService = {
  /**
   * 獲取指定 Key 的資料
   */
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`StorageService Error (get ${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * 儲存資料
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`StorageService Error (set ${key}):`, error);
    }
  },

  /**
   * 獲取集合（數組形式的資料）
   */
  getCollection: <T>(key: string): T[] => {
    return storageService.get<T[]>(key, []);
  },

  /**
   * 更新集合中的特定項，或新增
   */
  saveToCollection: <T extends { id: string }>(key: string, item: T): void => {
    const collection = storageService.getCollection<T>(key);
    const index = collection.findIndex(i => i.id === item.id);
    if (index > -1) {
      collection[index] = item;
    } else {
      collection.push(item);
    }
    storageService.set(key, collection);
  },

  /**
   * 移除指定 Key 的資料
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
    * 清除所有資料 (重置系統)
    */
  clearAll: (): void => {
    localStorage.clear();
  }
};
