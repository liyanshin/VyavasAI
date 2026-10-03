import { ShopState, AgentStep, ToolName, Language } from '../types';
import { findMatchingItem, findMatchingCustomer } from './itemMatcher';

export interface ToolExecutionResult {
  newState: ShopState;
  step: AgentStep;
  success: boolean;
  message?: string;
}

export function executeTool(
  toolName: ToolName,
  args: Record<string, any>,
  currentState: ShopState,
  lang: Language = 'mr'
): ToolExecutionResult {
  const stepId = `step-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const timestamp = new Date().toLocaleTimeString();

  switch (toolName) {
    case 'check_stock': {
      const itemQuery = args.item || args.name || '';
      const matched = findMatchingItem(itemQuery, currentState.inventory);

      if (!matched) {
        return {
          newState: currentState,
          success: false,
          step: {
            id: stepId,
            tool: 'check_stock',
            toolTitle: 'Check Stock',
            args,
            result: { error: `Item "${itemQuery}" not found in inventory` },
            summary: getStepSummary('check_stock_failed', { item: itemQuery }, lang),
            status: 'failed',
            timestamp,
          },
        };
      }

      const isLow = matched.qty <= matched.lowStockThreshold;
      return {
        newState: currentState,
        success: true,
        step: {
          id: stepId,
          tool: 'check_stock',
          toolTitle: 'Check Stock',
          args: { item: matched.name, query: itemQuery },
          result: {
            itemId: matched.id,
            name: matched.name,
            qty: matched.qty,
            unit: matched.unit,
            pricePerUnit: matched.pricePerUnit,
            isLowStock: isLow,
          },
          summary: getStepSummary(
            'check_stock',
            { name: matched.name, qty: matched.qty, unit: matched.unit, price: matched.pricePerUnit },
            lang
          ),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'update_stock': {
      const itemQuery = args.item || args.name || '';
      const delta = Number(args.delta) || 0;
      const reason = args.reason || 'Manual update';

      const matched = findMatchingItem(itemQuery, currentState.inventory);
      if (!matched) {
        return {
          newState: currentState,
          success: false,
          step: {
            id: stepId,
            tool: 'update_stock',
            toolTitle: 'Update Stock',
            args,
            result: { error: `Item "${itemQuery}" not found` },
            summary: `Stock update failed: Item "${itemQuery}" not found`,
            status: 'failed',
            timestamp,
          },
        };
      }

      const prevQty = matched.qty;
      const newQty = Math.max(0, prevQty + delta);

      const updatedInventory = currentState.inventory.map((item) =>
        item.id === matched.id
          ? { ...item, qty: newQty, lastUpdated: new Date().toISOString() }
          : item
      );

      const newState = { ...currentState, inventory: updatedInventory };

      return {
        newState,
        success: true,
        step: {
          id: stepId,
          tool: 'update_stock',
          toolTitle: 'Update Stock',
          args: { item: matched.name, delta, reason },
          result: { item: matched.name, prevQty, newQty, unit: matched.unit, delta },
          summary: getStepSummary('update_stock', { name: matched.name, prevQty, newQty, unit: matched.unit, delta }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'create_order': {
      const customerNameInput = args.customer || 'Walk-in Customer';
      const itemsInput = Array.isArray(args.items) ? args.items : [];

      const matchedCust = findMatchingCustomer(customerNameInput, currentState.customers);
      const effectiveCustName = matchedCust ? matchedCust.name : customerNameInput;

      let orderTotal = 0;
      const orderItems = itemsInput.map((it: any) => {
        const itemObj = findMatchingItem(it.name || it.item, currentState.inventory);
        const qty = Number(it.qty) || 1;
        const unitPrice = itemObj ? itemObj.pricePerUnit : 50;
        const unit = it.unit || (itemObj ? itemObj.unit : 'kg');
        const lineTotal = qty * unitPrice;
        orderTotal += lineTotal;

        return {
          itemId: itemObj ? itemObj.id : `item-${Date.now()}`,
          name: itemObj ? itemObj.name : it.name,
          qty,
          unit,
          pricePerUnit: unitPrice,
          lineTotal,
        };
      });

      const orderNumber = `ORD-${1020 + currentState.orders.length + 1}`;
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customerName: effectiveCustName,
        items: orderItems,
        totalAmount: orderTotal,
        paymentType: (args.paymentType || 'credit') as 'credit' | 'cash' | 'upi',
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
      };

      // Also update today's sales record
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedDailySales = currentState.dailySales.map((ds, index) => {
        if (index === currentState.dailySales.length - 1) {
          return {
            ...ds,
            sales: ds.sales + orderTotal,
            orderCount: ds.orderCount + 1,
          };
        }
        return ds;
      });

      const newState = {
        ...currentState,
        orders: [newOrder, ...currentState.orders],
        dailySales: updatedDailySales,
      };

      return {
        newState,
        success: true,
        step: {
          id: stepId,
          tool: 'create_order',
          toolTitle: 'Create Order',
          args: { customer: effectiveCustName, items: itemsInput },
          result: { orderNumber, total: orderTotal, items: orderItems, customer: effectiveCustName },
          summary: getStepSummary('create_order', { orderNumber, customer: effectiveCustName, total: orderTotal }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'add_to_customer_ledger': {
      const customerInput = args.customer || '';
      const amount = Number(args.amount) || 0;
      const type = (args.type || 'credit') as 'credit' | 'payment';

      let matchedCust = findMatchingCustomer(customerInput, currentState.customers);
      let updatedCustomers = [...currentState.customers];

      if (!matchedCust) {
        // Create new customer if not found
        matchedCust = {
          id: `cust-${Date.now()}`,
          name: customerInput,
          udhaarBalance: 0,
          totalPurchases: 0,
          lastTransactionDate: new Date().toISOString(),
        };
        updatedCustomers.push(matchedCust);
      }

      const prevBal = matchedCust.udhaarBalance;
      const newBal = type === 'credit' ? prevBal + amount : Math.max(0, prevBal - amount);

      updatedCustomers = updatedCustomers.map((c) =>
        c.id === matchedCust!.id
          ? {
              ...c,
              udhaarBalance: newBal,
              totalPurchases: type === 'credit' ? c.totalPurchases + amount : c.totalPurchases,
              lastTransactionDate: new Date().toISOString(),
            }
          : c
      );

      const newState = { ...currentState, customers: updatedCustomers };

      return {
        newState,
        success: true,
        step: {
          id: stepId,
          tool: 'add_to_customer_ledger',
          toolTitle: 'Customer Ledger (Khata)',
          args: { customer: matchedCust.name, amount, type },
          result: { customer: matchedCust.name, prevBalance: prevBal, amount, newBalance: newBal, type },
          summary: getStepSummary('add_to_customer_ledger', { customer: matchedCust.name, amount, prevBal, newBal, type }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'get_sales_summary': {
      const period = args.period || 'today';
      let totalSales = 0;
      let orderCount = 0;
      let totalExpenses = 0;

      if (period === 'today') {
        const todayRecord = currentState.dailySales[currentState.dailySales.length - 1];
        totalSales = todayRecord ? todayRecord.sales : 0;
        orderCount = todayRecord ? todayRecord.orderCount : 0;
        totalExpenses = todayRecord ? todayRecord.expenses : 0;
      } else if (period === 'week') {
        totalSales = currentState.dailySales.reduce((acc, d) => acc + d.sales, 0);
        orderCount = currentState.dailySales.reduce((acc, d) => acc + d.orderCount, 0);
        totalExpenses = currentState.dailySales.reduce((acc, d) => acc + d.expenses, 0);
      } else {
        totalSales = currentState.dailySales.reduce((acc, d) => acc + d.sales, 0) * 4;
        orderCount = currentState.dailySales.reduce((acc, d) => acc + d.orderCount, 0) * 4;
        totalExpenses = currentState.dailySales.reduce((acc, d) => acc + d.expenses, 0) * 4;
      }

      const profit = totalSales - totalExpenses;
      const topItems = ['Sugar (साखर)', 'Rice (तांदूळ)', 'Cooking Oil (तेल)'];

      return {
        newState: currentState,
        success: true,
        step: {
          id: stepId,
          tool: 'get_sales_summary',
          toolTitle: 'Sales Summary',
          args: { period },
          result: { period, totalSales, orderCount, totalExpenses, profit, topItems },
          summary: getStepSummary('get_sales_summary', { period, totalSales, orderCount, profit }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'get_customer_balance': {
      const customerInput = args.customer || '';
      const matchedCust = findMatchingCustomer(customerInput, currentState.customers);

      if (!matchedCust) {
        return {
          newState: currentState,
          success: false,
          step: {
            id: stepId,
            tool: 'get_customer_balance',
            toolTitle: 'Get Customer Balance',
            args,
            result: { error: `Customer "${customerInput}" not found` },
            summary: `Customer "${customerInput}" not found in Khata ledger`,
            status: 'failed',
            timestamp,
          },
        };
      }

      return {
        newState: currentState,
        success: true,
        step: {
          id: stepId,
          tool: 'get_customer_balance',
          toolTitle: 'Get Customer Balance',
          args: { customer: matchedCust.name },
          result: { customer: matchedCust.name, balance: matchedCust.udhaarBalance, purchases: matchedCust.totalPurchases },
          summary: getStepSummary('get_customer_balance', { customer: matchedCust.name, balance: matchedCust.udhaarBalance }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'add_item': {
      const name = args.name || 'New Item';
      const unit = args.unit || 'kg';
      const price = Number(args.price) || 0;
      const qty = Number(args.qty) || 0;

      const newItem = {
        id: `item-${Date.now()}`,
        name,
        localizedNames: {
          mr: `${name}`,
          ta: `${name}`,
          hi: `${name}`,
          en: `${name}`,
        },
        qty,
        unit,
        pricePerUnit: price,
        lowStockThreshold: Math.max(5, Math.floor(qty * 0.2)),
        category: 'General',
        lastUpdated: new Date().toISOString(),
      };

      const newState = {
        ...currentState,
        inventory: [...currentState.inventory, newItem],
      };

      return {
        newState,
        success: true,
        step: {
          id: stepId,
          tool: 'add_item',
          toolTitle: 'Add Inventory Item',
          args: { name, unit, price, qty },
          result: { item: name, qty, unit, price },
          summary: getStepSummary('add_item', { name, qty, unit, price }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'get_low_stock_items': {
      const threshold = Number(args.threshold) || 15;
      const lowItems = currentState.inventory.filter((i) => i.qty <= (threshold || i.lowStockThreshold));

      return {
        newState: currentState,
        success: true,
        step: {
          id: stepId,
          tool: 'get_low_stock_items',
          toolTitle: 'Get Low Stock Items',
          args: { threshold },
          result: { count: lowItems.length, items: lowItems.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit })) },
          summary: getStepSummary('get_low_stock_items', { count: lowItems.length }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'record_expense': {
      const category = args.category || 'General';
      const amount = Number(args.amount) || 0;
      const note = args.note || 'Shop expense';

      const newExp = {
        id: `exp-${Date.now()}`,
        category,
        amount,
        note,
        createdAt: new Date().toISOString(),
      };

      const updatedDailySales = currentState.dailySales.map((ds, index) => {
        if (index === currentState.dailySales.length - 1) {
          return { ...ds, expenses: ds.expenses + amount };
        }
        return ds;
      });

      const newState = {
        ...currentState,
        expenses: [newExp, ...currentState.expenses],
        dailySales: updatedDailySales,
      };

      return {
        newState,
        success: true,
        step: {
          id: stepId,
          tool: 'record_expense',
          toolTitle: 'Record Expense',
          args: { category, amount, note },
          result: { expenseId: newExp.id, category, amount },
          summary: getStepSummary('record_expense', { category, amount, note }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    case 'record_payment': {
      const customerInput = args.customer || '';
      const amount = Number(args.amount) || 0;

      const matchedCust = findMatchingCustomer(customerInput, currentState.customers);
      if (!matchedCust) {
        return {
          newState: currentState,
          success: false,
          step: {
            id: stepId,
            tool: 'record_payment',
            toolTitle: 'Record Payment',
            args,
            result: { error: `Customer "${customerInput}" not found` },
            summary: `Payment failed: Customer "${customerInput}" not found`,
            status: 'failed',
            timestamp,
          },
        };
      }

      const prevBal = matchedCust.udhaarBalance;
      const newBal = Math.max(0, prevBal - amount);

      const updatedCustomers = currentState.customers.map((c) =>
        c.id === matchedCust!.id
          ? { ...c, udhaarBalance: newBal, lastTransactionDate: new Date().toISOString() }
          : c
      );

      const newState = { ...currentState, customers: updatedCustomers };

      return {
        newState,
        success: true,
        step: {
          id: stepId,
          tool: 'record_payment',
          toolTitle: 'Record Payment',
          args: { customer: matchedCust.name, amount },
          result: { customer: matchedCust.name, amountPaid: amount, prevBalance: prevBal, remainingBalance: newBal },
          summary: getStepSummary('record_payment', { customer: matchedCust.name, amount, newBal }, lang),
          status: 'success',
          timestamp,
        },
      };
    }

    default:
      return {
        newState: currentState,
        success: false,
        step: {
          id: stepId,
          tool: toolName,
          toolTitle: String(toolName),
          args,
          result: { error: 'Unknown tool' },
          summary: `Tool ${toolName} not supported`,
          status: 'failed',
          timestamp,
        },
      };
  }
}

function getStepSummary(type: string, data: any, lang: Language): string {
  if (lang === 'mr') {
    switch (type) {
      case 'check_stock':
        return `स्टॉक तपासला: ${data.name} शिल्लक: ${data.qty} ${data.unit} (दर: ₹${data.price}/${data.unit})`;
      case 'check_stock_failed':
        return `स्टॉकमध्ये "${data.item}" सापडले नाही`;
      case 'update_stock':
        return `स्टॉक अपडेट: ${data.name} ${data.prevQty} ${data.unit} → ${data.newQty} ${data.unit} (${data.delta > 0 ? '+' : ''}${data.delta})`;
      case 'create_order':
        return `ऑर्डर #${data.orderNumber} तयार: ${data.customer} एकूण: ₹${data.total}`;
      case 'add_to_customer_ledger':
        return data.type === 'credit'
          ? `खात्यात नोंद: ${data.customer} उधारी +₹${data.amount} (एकूण बाकी: ₹${data.newBal})`
          : `खात्यात जमा: ${data.customer} -₹${data.amount} (उरलेली बाकी: ₹${data.newBal})`;
      case 'get_sales_summary':
        return `विक्री माहिती: ${data.period === 'today' ? 'आजची' : 'एकूण'} विक्री ₹${data.totalSales}, ऑर्डर्स: ${data.orderCount}`;
      case 'get_customer_balance':
        return `${data.customer} यांची बाकी: ₹${data.balance}`;
      case 'add_item':
        return `नवीन वस्तू जोडली: ${data.name} (${data.qty} ${data.unit}, ₹${data.price}/${data.unit})`;
      case 'get_low_stock_items':
        return `कमी साठा असलेल्या वस्तू: ${data.count}`;
      case 'record_expense':
        return `खर्च नोंदवला: ${data.category} - ₹${data.amount}`;
      case 'record_payment':
        return `जमा नोंदवले: ${data.customer} कडून ₹${data.amount} मिळाले, उरलेली बाकी ₹${data.newBal}`;
      default:
        return 'कृती पूर्ण झाली';
    }
  } else if (lang === 'ta') {
    switch (type) {
      case 'check_stock':
        return `இருப்பு சரிபார்க்கப்பட்டது: ${data.name} (${data.qty} ${data.unit}, விலை ₹${data.price})`;
      case 'update_stock':
        return `இருப்பு புதுப்பிக்கப்பட்டது: ${data.name} ${data.prevQty} → ${data.newQty} ${data.unit}`;
      case 'create_order':
        return `ஆர்டர் #${data.orderNumber} உருவாக்கப்பட்டது: ${data.customer} மொத்த தொகை: ₹${data.total}`;
      case 'add_to_customer_ledger':
        return `கடன் கணக்கு: ${data.customer} ₹${data.amount} சேர்க்கப்பட்டது (இருப்பு: ₹${data.newBal})`;
      case 'get_sales_summary':
        return `விற்பனை சுருக்கம்: மொத்தம் ₹${data.totalSales}, ஆர்டர்கள்: ${data.orderCount}`;
      case 'get_customer_balance':
        return `${data.customer} பாக்கி தொகை: ₹${data.balance}`;
      default:
        return 'நடவடிக்கை முடிந்தது';
    }
  } else if (lang === 'hi') {
    switch (type) {
      case 'check_stock':
        return `स्टॉक चेक किया: ${data.name} उपलब्ध: ${data.qty} ${data.unit} (रेट: ₹${data.price}/${data.unit})`;
      case 'update_stock':
        return `स्टॉक अपडेट: ${data.name} ${data.prevQty} ${data.unit} → ${data.newQty} ${data.unit}`;
      case 'create_order':
        return `ऑर्डर #${data.orderNumber} बनाया गया: ${data.customer} कुल: ₹${data.total}`;
      case 'add_to_customer_ledger':
        return `खाते में दर्ज: ${data.customer} उधार +₹${data.amount} (कुल बकाया: ₹${data.newBal})`;
      case 'get_sales_summary':
        return `बिक्री विवरण: कुल बिक्री ₹${data.totalSales}, ऑर्डर्स: ${data.orderCount}`;
      case 'get_customer_balance':
        return `${data.customer} का बकाया: ₹${data.balance}`;
      default:
        return 'कार्य संपन्न हुआ';
    }
  } else {
    // English
    switch (type) {
      case 'check_stock':
        return `Checked stock: ${data.name} (${data.qty} ${data.unit} available @ ₹${data.price}/${data.unit})`;
      case 'update_stock':
        return `Updated stock: ${data.name} ${data.prevQty} → ${data.newQty} ${data.unit} (${data.delta > 0 ? '+' : ''}${data.delta})`;
      case 'create_order':
        return `Created order #${data.orderNumber} for ${data.customer} (Total: ₹${data.total})`;
      case 'add_to_customer_ledger':
        return `Ledger updated: ${data.customer} Udhaar +₹${data.amount} (New balance: ₹${data.newBal})`;
      case 'get_sales_summary':
        return `Sales summary: Revenue ₹${data.totalSales}, Orders: ${data.orderCount}`;
      case 'get_customer_balance':
        return `Customer balance: ${data.customer} owes ₹${data.balance}`;
      default:
        return 'Action executed successfully';
    }
  }
}
