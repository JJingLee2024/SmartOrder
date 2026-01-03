
export interface User {
  id: string;
  isAnonymous: boolean;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}

export interface ShopMenu {
  id: string;
  shopId: string;
  brandName: string;
  categories: string[];
  items: MenuItem[];
  isPublished: boolean;
}

export interface Shop {
  id: string;
  name: string;
  createdAt: number;
  ownerId: string;
}

export type ReservationSource = '預訂' | '現場';
export type ReservationStatus = '待入座' | '已入座' | '已取消';

export interface Reservation {
  id: string;
  shopId: string;
  time: string;
  tableNo: string;
  phone: string;
  source: ReservationSource;
  status: ReservationStatus;
  checkInTime?: number;
}

export interface Table {
  id: string;
  shopId: string;
  tableNo: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  shopId: string;
  tableNo: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'new' | 'served' | 'paid';
  createdAt: number;
}
