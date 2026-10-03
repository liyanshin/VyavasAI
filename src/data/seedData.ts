import { ShopState, InventoryItem, Customer, Order, Expense, DailySalesRecord } from '../types';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item-sugar',
    name: 'Sugar',
    localizedNames: {
      mr: 'साखर (Sugar)',
      ta: 'சர்க்கரை (Sugar)',
      hi: 'चीनी (Sugar)',
      en: 'Sugar',
    },
    qty: 40,
    unit: 'kg',
    pricePerUnit: 45,
    lowStockThreshold: 15,
    category: 'Groceries',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'item-rice',
    name: 'Rice',
    localizedNames: {
      mr: 'तांदूळ (Rice)',
      ta: 'அரிசி (Rice)',
      hi: 'चावल (Rice)',
      en: 'Rice',
    },
    qty: 60,
    unit: 'kg',
    pricePerUnit: 55,
    lowStockThreshold: 20,
    category: 'Grains',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'item-wheat-flour',
    name: 'Wheat Flour',
    localizedNames: {
      mr: 'गव्हाचे पीठ / आटा (Atta)',
      ta: 'கோதுமை மாவு (Wheat Flour)',
      hi: 'गेहूं का आटा (Atta)',
      en: 'Wheat Flour (Atta)',
    },
    qty: 30,
    unit: 'kg',
    pricePerUnit: 38,
    lowStockThreshold: 10,
    category: 'Grains',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'item-toor-dal',
    name: 'Toor Dal',
    localizedNames: {
      mr: 'तूर डाळ (Toor Dal)',
      ta: 'துவரம் பருப்பு (Toor Dal)',
      hi: 'तूर दाल (Arhar Dal)',
      en: 'Toor Dal',
    },
    qty: 25,
    unit: 'kg',
    pricePerUnit: 140,
    lowStockThreshold: 10,
    category: 'Pulses',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'item-cooking-oil',
    name: 'Cooking Oil',
    localizedNames: {
      mr: 'खाद्य तेल (Cooking Oil)',
      ta: 'சமையல் எண்ணெய் (Cooking Oil)',
      hi: 'खाद्य तेल (Cooking Oil)',
      en: 'Cooking Oil',
    },
    qty: 20,
    unit: 'L',
    pricePerUnit: 130,
    lowStockThreshold: 8,
    category: 'Oils',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'item-tea-powder',
    name: 'Tea Powder',
    localizedNames: {
      mr: 'चहा पावडर (Tea Powder)',
      ta: 'தேயிலைத்தூள் (Tea Powder)',
      hi: 'चाय पत्ती (Tea Powder)',
      en: 'Tea Powder',
    },
    qty: 10,
    unit: 'kg',
    pricePerUnit: 420,
    lowStockThreshold: 5,
    category: 'Beverages',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'item-salt',
    name: 'Salt',
    localizedNames: {
      mr: 'मीठ (Salt)',
      ta: 'உப்பு (Salt)',
      hi: 'नमक (Salt)',
      en: 'Salt',
    },
    qty: 30,
    unit: 'kg',
    pricePerUnit: 22,
    lowStockThreshold: 10,
    category: 'Spices',
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-ramesh',
    name: 'Ramesh',
    phone: '9822104521',
    udhaarBalance: 450, // Suresh/Ramesh existing balance
    totalPurchases: 2850,
    lastTransactionDate: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'cust-suresh',
    name: 'Suresh',
    phone: '9822301982',
    udhaarBalance: 820,
    totalPurchases: 4120,
    lastTransactionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'cust-sunita',
    name: 'Sunita',
    phone: '9765403219',
    udhaarBalance: 210,
    totalPurchases: 1980,
    lastTransactionDate: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'cust-lakshmi',
    name: 'Lakshmi',
    phone: '9940123845',
    udhaarBalance: 150,
    totalPurchases: 3240,
    lastTransactionDate: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1021',
    orderNumber: 'ORD-1021',
    customerName: 'Suresh',
    items: [
      { itemId: 'item-rice', name: 'Rice', qty: 5, unit: 'kg', pricePerUnit: 55, lineTotal: 275 },
      { itemId: 'item-salt', name: 'Salt', qty: 2, unit: 'kg', pricePerUnit: 22, lineTotal: 44 },
    ],
    totalAmount: 319,
    paymentType: 'credit',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 1 - 3600000 * 3).toISOString(),
  },
  {
    id: 'ord-1022',
    orderNumber: 'ORD-1022',
    customerName: 'Sunita',
    items: [
      { itemId: 'item-cooking-oil', name: 'Cooking Oil', qty: 2, unit: 'L', pricePerUnit: 130, lineTotal: 260 },
      { itemId: 'item-tea-powder', name: 'Tea Powder', qty: 0.5, unit: 'kg', pricePerUnit: 420, lineTotal: 210 },
    ],
    totalAmount: 470,
    paymentType: 'cash',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'ord-1023',
    orderNumber: 'ORD-1023',
    customerName: 'Lakshmi',
    items: [
      { itemId: 'item-toor-dal', name: 'Toor Dal', qty: 2, unit: 'kg', pricePerUnit: 140, lineTotal: 280 },
      { itemId: 'item-wheat-flour', name: 'Wheat Flour', qty: 5, unit: 'kg', pricePerUnit: 38, lineTotal: 190 },
    ],
    totalAmount: 470,
    paymentType: 'credit',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'Transportation / Tempo',
    amount: 350,
    note: 'Market tempo delivery from mandi',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'exp-2',
    category: 'Electricity / Power',
    amount: 620,
    note: 'Shop fan & cooler bill',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'exp-3',
    category: 'Packaging Bags',
    amount: 180,
    note: 'Brown paper bags & cloth sacks',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const INITIAL_DAILY_SALES: DailySalesRecord[] = [
  { date: '2026-09-27', dayLabel: 'Sun', sales: 4250, expenses: 400, orderCount: 14 },
  { date: '2026-09-28', dayLabel: 'Mon', sales: 3890, expenses: 150, orderCount: 11 },
  { date: '2026-09-29', dayLabel: 'Tue', sales: 4620, expenses: 620, orderCount: 16 },
  { date: '2026-09-30', dayLabel: 'Wed', sales: 5120, expenses: 200, orderCount: 19 },
  { date: '2026-10-01', dayLabel: 'Thu', sales: 4780, expenses: 350, orderCount: 15 },
  { date: '2026-10-02', dayLabel: 'Fri', sales: 5430, expenses: 180, orderCount: 21 },
  { date: '2026-10-03', dayLabel: 'Today', sales: 1259, expenses: 0, orderCount: 3 },
];

export function getInitialShopState(): ShopState {
  return {
    inventory: [...INITIAL_INVENTORY],
    customers: [...INITIAL_CUSTOMERS],
    orders: [...INITIAL_ORDERS],
    expenses: [...INITIAL_EXPENSES],
    dailySales: [...INITIAL_DAILY_SALES],
    agentStepsHistory: [],
  };
}
