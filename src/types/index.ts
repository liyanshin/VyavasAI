export type Language = 'mr' | 'ta' | 'hi' | 'en';
export type Theme = 'dark' | 'light';

export interface InventoryItem {
  id: string;
  name: string;
  localizedNames: {
    mr: string;
    ta: string;
    hi: string;
    en: string;
  };
  qty: number;
  unit: string;
  pricePerUnit: number;
  lowStockThreshold: number;
  category: string;
  lastUpdated: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  udhaarBalance: number; // Pending credit amount in ₹
  totalPurchases: number;
  lastTransactionDate: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  paymentType: 'credit' | 'cash' | 'upi';
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string;
  createdAt: string;
}

export interface DailySalesRecord {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  sales: number;
  expenses: number;
  orderCount: number;
}

export type ToolName =
  | 'check_stock'
  | 'update_stock'
  | 'create_order'
  | 'add_to_customer_ledger'
  | 'get_sales_summary'
  | 'get_customer_balance'
  | 'add_item'
  | 'get_low_stock_items'
  | 'record_expense'
  | 'record_payment';

export interface AgentStep {
  id: string;
  tool: ToolName;
  toolTitle: string;
  args: Record<string, any>;
  result: Record<string, any>;
  summary: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  spokenText?: string;
  language: Language;
  steps?: AgentStep[];
  timestamp: string;
  actionSummary?: string;
  confidenceScore?: number;
}

export interface ShopState {
  inventory: InventoryItem[];
  customers: Customer[];
  orders: Order[];
  expenses: Expense[];
  dailySales: DailySalesRecord[];
  agentStepsHistory: AgentStep[];
}
