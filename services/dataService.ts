
import { Shop, ShopMenu, Reservation, Table, Order, User } from '../types';
import { storageService } from './storageService';

const STORAGE_KEYS = {
  USER: 'smartorder_user',
  SHOPS: 'smartorder_shops',
  MENUS: 'smartorder_menus',
  RESERVATIONS: 'smartorder_reservations',
  TABLES: 'smartorder_tables',
  ORDERS: 'smartorder_orders',
};

export const dataService = {
  // User Management
  getOrCreateUser: (): User => {
    let user = storageService.get<User | null>(STORAGE_KEYS.USER, null);
    if (user) return user;
    
    const newUser: User = { id: crypto.randomUUID(), isAnonymous: true, name: '匿名用戶' };
    storageService.set(STORAGE_KEYS.USER, newUser);
    return newUser;
  },

  // Shop Management
  getShops: (): Shop[] => {
    return storageService.getCollection<Shop>(STORAGE_KEYS.SHOPS);
  },
  addShop: (name: string, ownerId: string): Shop => {
    const newShop: Shop = { id: crypto.randomUUID(), name, createdAt: Date.now(), ownerId };
    storageService.saveToCollection(STORAGE_KEYS.SHOPS, newShop);
    return newShop;
  },

  // Menu Management
  getMenuByShopId: (shopId: string): ShopMenu | undefined => {
    const menus = storageService.getCollection<ShopMenu>(STORAGE_KEYS.MENUS);
    return menus.find(m => m.shopId === shopId);
  },
  saveMenu: (menu: ShopMenu) => {
    // 這裡手動處理 index 是因為 ShopMenu 的 key 是 shopId 而非 id
    const menus = storageService.getCollection<ShopMenu>(STORAGE_KEYS.MENUS);
    const index = menus.findIndex(m => m.shopId === menu.shopId);
    if (index > -1) menus[index] = menu;
    else menus.push(menu);
    storageService.set(STORAGE_KEYS.MENUS, menus);
  },

  // Reservations
  getReservations: (shopId: string): Reservation[] => {
    const all = storageService.getCollection<Reservation>(STORAGE_KEYS.RESERVATIONS);
    return all.filter(r => r.shopId === shopId);
  },
  addReservation: (res: Omit<Reservation, 'id'>) => {
    const newRes = { ...res, id: crypto.randomUUID() };
    storageService.saveToCollection(STORAGE_KEYS.RESERVATIONS, newRes);
    return newRes;
  },
  updateReservation: (res: Reservation) => {
    storageService.saveToCollection(STORAGE_KEYS.RESERVATIONS, res);
  },

  // Tables
  getTables: (shopId: string): Table[] => {
    const all = storageService.getCollection<Table>(STORAGE_KEYS.TABLES);
    return all.filter(t => t.shopId === shopId);
  },
  saveTables: (shopId: string, tableNos: string[]) => {
    const all = storageService.getCollection<Table>(STORAGE_KEYS.TABLES);
    const filtered = all.filter(t => t.shopId !== shopId);
    const newTables = tableNos.map(no => ({ id: crypto.randomUUID(), shopId, tableNo: no }));
    storageService.set(STORAGE_KEYS.TABLES, [...filtered, ...newTables]);
  },

  // Orders
  getOrders: (shopId: string): Order[] => {
    const all = storageService.getCollection<Order>(STORAGE_KEYS.ORDERS);
    return all.filter(o => o.shopId === shopId);
  },
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder = { ...order, id: crypto.randomUUID(), createdAt: Date.now() };
    storageService.saveToCollection(STORAGE_KEYS.ORDERS, newOrder);
    return newOrder;
  },
  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const all = storageService.getCollection<Order>(STORAGE_KEYS.ORDERS);
    const index = all.findIndex(o => o.id === orderId);
    if (index > -1) {
      all[index].status = status;
      storageService.set(STORAGE_KEYS.ORDERS, all);
    }
  }
};
