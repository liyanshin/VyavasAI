import { ShopState, AgentStep, Language } from '../types';
import { executeTool } from './agentEngine';
import { findMatchingItem, findMatchingCustomer } from './itemMatcher';

export interface AgentExecutionPlanResult {
  newState: ShopState;
  steps: AgentStep[];
  replyText: string;
  spokenText: string;
}

export function runDeterministicAgent(
  input: string,
  currentState: ShopState,
  lang: Language = 'mr'
): AgentExecutionPlanResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  let state = { ...currentState };
  const steps: AgentStep[] = [];

  // DEMO FLOW: Order placement & stock update
  // e.g. "Ramesh ne 5 kg sakhar mangitli, order kar ani stock update kar"
  // or Hindi: "रमेश ने 5 किलो चीनी मांगी, ऑर्डर करो और स्टॉक अपडेट करो"
  // or Tamil: "ரமேஷ் 5 கிலோ சர்க்கரை கேட்டார், ஆர்டர் செய்..."
  // or English: "Ramesh wants 5 kg sugar, create order and update stock"
  const isOrderIntent =
    lower.includes('order') ||
    lower.includes('ऑर्डर') ||
    lower.includes('ஆர்டர்') ||
    lower.includes('mangitli') ||
    lower.includes('मागितली') ||
    lower.includes('मांगी') ||
    lower.includes('கேட்டார்') ||
    lower.includes('wants') ||
    lower.includes('दे') ||
    lower.includes('खरीदी');

  const isSalesIntent =
    lower.includes('kamai') ||
    lower.includes('कमाई') ||
    lower.includes('विक्री') ||
    lower.includes('बिक्री') ||
    lower.includes('sales') ||
    lower.includes('விற்பனை') ||
    lower.includes('revenue') ||
    lower.includes('கணக்கு');

  const isBalanceIntent =
    lower.includes('udhari') ||
    lower.includes('उधारी') ||
    lower.includes('उधार') ||
    lower.includes('balance') ||
    lower.includes('பாக்கி') ||
    lower.includes('khata') ||
    lower.includes('खाता') ||
    lower.includes('किती बाकी');

  const isStockQuery =
    (lower.includes('stock') ||
      lower.includes('स्टॉक') ||
      lower.includes('उरलाय') ||
      lower.includes('उरला') ||
      lower.includes('बचा') ||
      lower.includes('இருப்பு') ||
      lower.includes('left') ||
      lower.includes('available')) &&
    !isOrderIntent;

  const isPaymentIntent =
    lower.includes('jama') ||
    lower.includes('जमा') ||
    lower.includes('paid') ||
    lower.includes('दिले') ||
    lower.includes('செலுத்தினார்') ||
    lower.includes('payment') ||
    lower.includes('पेमेंट');

  const isExpenseIntent =
    lower.includes('kharcha') ||
    lower.includes('खर्च') ||
    lower.includes('செலவு') ||
    lower.includes('expense');

  // 1. ORDER DEMO / WORKFLOW
  if (isOrderIntent) {
    // Extract customer
    let matchedCustomer = findMatchingCustomer(lower, state.customers);
    const customerName = matchedCustomer ? matchedCustomer.name : 'Ramesh';

    // Extract item
    let matchedItem = findMatchingItem(lower, state.inventory);
    if (!matchedItem) {
      // Default to sugar for demo if unspecified
      matchedItem = state.inventory.find((i) => i.id === 'item-sugar') || state.inventory[0];
    }

    // Extract quantity (look for numbers like 5, 2, 10, ५, २)
    let qty = 5;
    const deNumMatch = text.match(/[०-९0-9]+(?:\.[०-९0-9]+)?/);
    if (deNumMatch) {
      const devanagariDigits: Record<string, string> = {
        '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
        '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
      };
      const normalizedStr = deNumMatch[0].replace(/[०-९]/g, (d) => devanagariDigits[d] || d);
      const parsed = parseFloat(normalizedStr);
      if (!isNaN(parsed) && parsed > 0) {
        qty = parsed;
      }
    }

    const unit = matchedItem.unit || 'kg';

    // STEP 1: check_stock(item)
    const checkRes = executeTool('check_stock', { item: matchedItem.name }, state, lang);
    state = checkRes.newState;
    steps.push(checkRes.step);

    // If stock insufficient
    if (matchedItem.qty < qty) {
      const reply =
        lang === 'mr'
          ? `क्षमस्व! ${matchedItem.name} फक्त ${matchedItem.qty} ${matchedItem.unit} शिल्लक आहे. ${qty} ${unit} ची ऑर्डर करता येणार नाही.`
          : lang === 'ta'
          ? `மன்னிக்கவும்! ${matchedItem.name} ${matchedItem.qty} ${matchedItem.unit} மட்டுமே உள்ளது.`
          : lang === 'hi'
          ? `माफ़ करें! ${matchedItem.name} केवल ${matchedItem.qty} ${matchedItem.unit} उपलब्ध है।`
          : `Sorry! Only ${matchedItem.qty} ${matchedItem.unit} of ${matchedItem.name} is in stock. Cannot fulfill ${qty} ${unit}.`;

      return { newState: state, steps, replyText: reply, spokenText: reply };
    }

    // STEP 2: create_order(customer, items)
    const orderRes = executeTool(
      'create_order',
      {
        customer: customerName,
        items: [{ name: matchedItem.name, qty, unit }],
        paymentType: 'credit',
      },
      state,
      lang
    );
    state = orderRes.newState;
    steps.push(orderRes.step);
    const orderTotal = orderRes.step.result.total || qty * matchedItem.pricePerUnit;

    // STEP 3: update_stock(item, delta, reason)
    const updateRes = executeTool(
      'update_stock',
      {
        item: matchedItem.name,
        delta: -qty,
        reason: `Order #${orderRes.step.result.orderNumber} for ${customerName}`,
      },
      state,
      lang
    );
    state = updateRes.newState;
    steps.push(updateRes.step);

    // STEP 4: add_to_customer_ledger(customer, amount, 'credit')
    const ledgerRes = executeTool(
      'add_to_customer_ledger',
      {
        customer: customerName,
        amount: orderTotal,
        type: 'credit',
      },
      state,
      lang
    );
    state = ledgerRes.newState;
    steps.push(ledgerRes.step);

    // Multilingual responses conforming precisely to demo flow specification
    let reply = '';
    if (lang === 'mr') {
      const itemMarathi = matchedItem.id === 'item-sugar' ? 'साखरेची' : `${matchedItem.name}ची`;
      reply = `झालं! ${customerName}ची ${qty} ${unit} ${itemMarathi} ऑर्डर तयार केली, स्टॉक अपडेट केला आणि ₹${orderTotal} त्याच्या बिलात जोडले.`;
    } else if (lang === 'ta') {
      reply = `முடிந்தது! ${customerName}க்கு ${qty} ${unit} ${matchedItem.name} ஆர்டர் உருவாக்கப்பட்டது, இருப்பு புதுப்பிக்கப்பட்டது மற்றும் ₹${orderTotal} கடன் கணக்கில் சேர்க்கப்பட்டது.`;
    } else if (lang === 'hi') {
      reply = `हो गया! ${customerName} का ${qty} ${unit} ${matchedItem.name} का ऑर्डर बना दिया गया, स्टॉक अपडेट हुआ और ₹${orderTotal} उनके खाते में जोड़ दिए गए।`;
    } else {
      reply = `Done! Created order for ${customerName} (${qty} ${unit} ${matchedItem.name}), updated inventory, and added ₹${orderTotal} to their credit khata.`;
    }

    return {
      newState: state,
      steps,
      replyText: reply,
      spokenText: reply,
    };
  }

  // 2. SALES / REVENUE QUERY
  if (isSalesIntent) {
    const res = executeTool('get_sales_summary', { period: 'today' }, state, lang);
    state = res.newState;
    steps.push(res.step);

    const { totalSales, orderCount, profit } = res.step.result;
    let reply = '';
    if (lang === 'mr') {
      reply = `आज दुकानात एकूण ₹${totalSales} रुपयांची विक्री झाली आहे (${orderCount} ऑर्डर्स) आणि अंदाजे नफा ₹${profit} झाला आहे.`;
    } else if (lang === 'ta') {
      reply = `இன்று மொத்த விற்பனை ₹${totalSales} (${orderCount} ஆர்டர்கள்) மற்றும் லாபம் ₹${profit}.`;
    } else if (lang === 'hi') {
      reply = `आज कुल ₹${totalSales} की बिक्री हुई है (${orderCount} ऑर्डर) और शुद्ध मुनाफा ₹${profit} है।`;
    } else {
      reply = `Today's total sales revenue is ₹${totalSales} across ${orderCount} orders, with an estimated profit of ₹${profit}.`;
    }

    return { newState: state, steps, replyText: reply, spokenText: reply };
  }

  // 3. CUSTOMER BALANCE / UDHAAR QUERY
  if (isBalanceIntent) {
    const matchedCustomer = findMatchingCustomer(lower, state.customers) || state.customers[1]; // default Suresh
    const res = executeTool('get_customer_balance', { customer: matchedCustomer.name }, state, lang);
    state = res.newState;
    steps.push(res.step);

    const bal = matchedCustomer.udhaarBalance;
    let reply = '';
    if (lang === 'mr') {
      reply = `${matchedCustomer.name} यांच्या नावावर सध्या ₹${bal} ची उधारी बाकी आहे.`;
    } else if (lang === 'ta') {
      reply = `${matchedCustomer.name}க்கு தற்போது ₹${bal} பாக்கி தொகை உள்ளது.`;
    } else if (lang === 'hi') {
      reply = `${matchedCustomer.name} के खाते में अभी ₹${bal} का उधार बाकी है।`;
    } else {
      reply = `${matchedCustomer.name}'s outstanding khata balance is ₹${bal}.`;
    }

    return { newState: state, steps, replyText: reply, spokenText: reply };
  }

  // 4. STOCK QUERY
  if (isStockQuery) {
    let matchedItem = findMatchingItem(lower, state.inventory);
    if (!matchedItem) {
      matchedItem = state.inventory.find((i) => i.id === 'item-rice') || state.inventory[1];
    }

    const res = executeTool('check_stock', { item: matchedItem.name }, state, lang);
    state = res.newState;
    steps.push(res.step);

    const { qty, unit, pricePerUnit } = res.step.result;
    let reply = '';
    if (lang === 'mr') {
      reply = `दुकानात सध्या ${qty} ${unit} ${matchedItem.name} शिल्लक आहे (दर ₹${pricePerUnit}/${unit}).`;
    } else if (lang === 'ta') {
      reply = `தற்போது ${matchedItem.name} ${qty} ${unit} இருப்பு உள்ளது (விலை ₹${pricePerUnit}/${unit}).`;
    } else if (lang === 'hi') {
      reply = `दुकान में अभी ${qty} ${unit} ${matchedItem.name} उपलब्ध है (रेट ₹${pricePerUnit}/${unit})।`;
    } else {
      reply = `Currently ${qty} ${unit} of ${matchedItem.name} is available in stock at ₹${pricePerUnit}/${unit}.`;
    }

    return { newState: state, steps, replyText: reply, spokenText: reply };
  }

  // 5. PAYMENT RECORDING
  if (isPaymentIntent) {
    const matchedCustomer = findMatchingCustomer(lower, state.customers) || state.customers[0];
    let amount = 200;
    const numMatch = text.match(/\d+/);
    if (numMatch) amount = parseInt(numMatch[0], 10);

    const res = executeTool('record_payment', { customer: matchedCustomer.name, amount }, state, lang);
    state = res.newState;
    steps.push(res.step);

    const rem = res.step.result.remainingBalance;
    let reply = '';
    if (lang === 'mr') {
      reply = `${matchedCustomer.name} कडून ₹${amount} जमा करण्यात आले. आता त्यांची शिल्लक उधारी ₹${rem} आहे.`;
    } else if (lang === 'ta') {
      reply = `${matchedCustomer.name} மூலம் ₹${amount} பெறப்பட்டது. மீதமுள்ள பாக்கி ₹${rem}.`;
    } else if (lang === 'hi') {
      reply = `${matchedCustomer.name} से ₹${amount} जमा कर लिए गए। अब उनका बकाया ₹${rem} है।`;
    } else {
      reply = `Recorded ₹${amount} payment from ${matchedCustomer.name}. Remaining balance is ₹${rem}.`;
    }

    return { newState: state, steps, replyText: reply, spokenText: reply };
  }

  // 6. EXPENSE RECORDING
  if (isExpenseIntent) {
    let amount = 150;
    const numMatch = text.match(/\d+/);
    if (numMatch) amount = parseInt(numMatch[0], 10);

    const res = executeTool(
      'record_expense',
      { category: 'Dukaan Expense', amount, note: text },
      state,
      lang
    );
    state = res.newState;
    steps.push(res.step);

    let reply = '';
    if (lang === 'mr') {
      reply = `₹${amount} चा खर्च नोंदवला गेला आहे.`;
    } else if (lang === 'ta') {
      reply = `₹${amount} செலவு பதிவு செய்யப்பட்டது.`;
    } else if (lang === 'hi') {
      reply = `₹${amount} का खर्च दर्ज कर लिया गया है।`;
    } else {
      reply = `Expense of ₹${amount} has been recorded successfully.`;
    }

    return { newState: state, steps, replyText: reply, spokenText: reply };
  }

  // Fallback for unclear / general query
  const fallbackReply =
    lang === 'mr'
      ? 'कृपया पुन्हा सांगा किंवा स्पष्ट सांगा (उदा. "रमेशने ५ किलो साखर मागितली" किंवा "आज किती कमाई झाली?").'
      : lang === 'ta'
      ? 'தயவுசெய்து மீண்டும் சொல்லுங்கள் (எ.கா: "இன்னைக்கு எவ்வளவு விற்பனை ஆச்சு?").'
      : lang === 'hi'
      ? 'कृपया दोबारा बोलिए (उदा. "रमेश ने 5 किलो चीनी मांगी" या "आज की बिक्री कितनी है?").'
      : 'Please say that again or try a sample command (e.g. "Ramesh wants 5 kg sugar" or "Today\'s sales").';

  return {
    newState: state,
    steps,
    replyText: fallbackReply,
    spokenText: fallbackReply,
  };
}
