
import { Shop, ShopMenu, Reservation, Table, Order, User } from '../types';

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
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
    const newUser: User = { id: crypto.randomUUID(), isAnonymous: true, name: '匿名用戶' };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    return newUser;
  },

  // Shop Management
  getShops: (): Shop[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOPS) || '[]');
  },
  addShop: (name: string, ownerId: string): Shop => {
    const shops = dataService.getShops();
    const newShop: Shop = { id: crypto.randomUUID(), name, createdAt: Date.now(), ownerId };
    shops.push(newShop);
    localStorage.setItem(STORAGE_KEYS.SHOPS, JSON.stringify(shops));
    return newShop;
  },

  // Menu Management
  getMenuByShopId: (shopId: string): ShopMenu | undefined => {
    const menus: ShopMenu[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MENUS) || '[]');
    return menus.find(m => m.shopId === shopId);
  },
  saveMenu: (menu: ShopMenu) => {
    const menus: ShopMenu[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MENUS) || '[]');
    const index = menus.findIndex(m => m.shopId === menu.shopId);
    if (index > -1) menus[index] = menu;
    else menus.push(menu);
    localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menus));
  },

  // Reservations
  getReservations: (shopId: string): Reservation[] => {
    const all: Reservation[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS) || '[]');
    return all.filter(r => r.shopId === shopId);
  },
  addReservation: (res: Omit<Reservation, 'id'>) => {
    const all: Reservation[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS) || '[]');
    const newRes = { ...res, id: crypto.randomUUID() };
    all.push(newRes);
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(all));
    return newRes;
  },
  updateReservation: (res: Reservation) => {
    const all: Reservation[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESERVATIONS) || '[]');
    const index = all.findIndex(r => r.id === res.id);
    if (index > -1) all[index] = res;
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(all));
  },

  // Tables
  getTables: (shopId: string): Table[] => {
    const all: Table[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || '[]');
    return all.filter(t => t.shopId === shopId);
  },
  saveTables: (shopId: string, tableNos: string[]) => {
    const all: Table[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TABLES) || '[]');
    const filtered = all.filter(t => t.shopId !== shopId);
    const newTables = tableNos.map(no => ({ id: crypto.randomUUID(), shopId, tableNo: no }));
    localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify([...filtered, ...newTables]));
  },

  // Orders
  getOrders: (shopId: string): Order[] => {
    const all: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    return all.filter(o => o.shopId === shopId);
  },
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => {
    const all: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const newOrder = { ...order, id: crypto.randomUUID(), createdAt: Date.now() };
    all.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
    return newOrder;
  },
  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const all: Order[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]');
    const index = all.findIndex(o => o.id === orderId);
    if (index > -1) all[index].status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
  }
};
