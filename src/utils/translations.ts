import { Language } from '../types';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  voiceOSBadge: string;
  langName: string;
  tabs: {
    home: string;
    stock: string;
    orders: string;
    khata: string;
    money: string;
  };
  mic: {
    tapToSpeak: string;
    listening: string;
    thinking: string;
    done: string;
    trySaying: string;
    typePrompt: string;
    send: string;
    waveformLabel: string;
    speechNotSupported: string;
    listeningTips: string;
  };
  sampleChips: {
    orderDemo: string;
    salesQuery: string;
    khataQuery: string;
    stockQuery: string;
  };
  agentSteps: {
    title: string;
    subtitle: string;
    timeline: string;
    step: string;
    result: string;
    toolCall: string;
    executed: string;
    failed: string;
    viewDetails: string;
    hideDetails: string;
    totalSteps: string;
  };
  stock: {
    title: string;
    itemsCount: string;
    lowStockAlert: string;
    searchPlaceholder: string;
    available: string;
    price: string;
    addStock: string;
    reduceStock: string;
    addItem: string;
    lowStockBadge: string;
    inStockBadge: string;
    itemName: string;
    unit: string;
    ratePerUnit: string;
    initialQty: string;
    cancel: string;
    save: string;
  };
  orders: {
    title: string;
    totalOrders: string;
    orderId: string;
    customer: string;
    items: string;
    total: string;
    paymentMode: string;
    creditUdhaar: string;
    cash: string;
    completed: string;
    emptyOrders: string;
  };
  khata: {
    title: string;
    totalPending: string;
    customerCount: string;
    recordPayment: string;
    currentUdhaar: string;
    lastVisit: string;
    payAmount: string;
    confirmPayment: string;
    paymentReceived: string;
    highBalanceBadge: string;
  };
  money: {
    title: string;
    todaySales: string;
    todayExpenses: string;
    netProfit: string;
    ordersToday: string;
    last7DaysTrend: string;
    topSellingItems: string;
    recordExpense: string;
    category: string;
    amount: string;
    note: string;
    saveExpense: string;
  };
  common: {
    resetDemo: string;
    resetConfirmTitle: string;
    resetConfirmDesc: string;
    cancel: string;
    confirm: string;
    speaking: string;
    muteSpeech: string;
    unmuteSpeech: string;
    demoTag: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationStrings> = {
  mr: {
    appName: 'व्यवसAI',
    tagline: 'किराणा दुकानासाठी व्हॉईस ऑपरेटिंग सिस्टीम',
    voiceOSBadge: 'आवाज-सक्षम किराणा ओएस',
    langName: 'मराठी (mr-IN)',
    tabs: {
      home: 'मुख्य',
      stock: 'स्टॉक',
      orders: 'ऑर्डर्स',
      khata: 'खातावही',
      money: 'हिशोब',
    },
    mic: {
      tapToSpeak: 'बोलण्यासाठी दाबा',
      listening: 'ऐकत आहे... बोला',
      thinking: 'दुकान साथी विचार करत आहे...',
      done: 'काम पूर्ण झाले!',
      trySaying: 'हे बोलून पहा:',
      typePrompt: 'किंवा टाईप करा (उदा. साखर ५ किलो...)',
      send: 'पाठवा',
      waveformLabel: 'माईक चालू आहे',
      speechNotSupported: 'ब्राउझरमध्ये व्हॉईस सपोर्ट उपलब्ध नाही. कृपया टाईप करा.',
      listeningTips: 'मराठी, इंग्रजी किंवा मिक्स भाषेत सहज बोला',
    },
    sampleChips: {
      orderDemo: 'रमेशने ५ किलो साखर मागितली, ऑर्डर कर आणि स्टॉक अपडेट कर',
      salesQuery: 'आज किती कमाई झाली?',
      khataQuery: 'सुरेशचा उधारी किती आहे?',
      stockQuery: 'तांदूळ किती उरलाय?',
    },
    agentSteps: {
      title: 'एजंट कृती (Agent Steps)',
      subtitle: 'प्रत्येक टप्प्याची थेट पारदर्शकता',
      timeline: 'कृती क्रम',
      step: 'टप्पा',
      result: 'निकाल',
      toolCall: 'टूल कॉल',
      executed: 'यशस्वी',
      failed: 'अपूर्ण',
      viewDetails: 'तपशील पहा',
      hideDetails: 'तपशील लपवा',
      totalSteps: 'एकूण टप्पे',
    },
    stock: {
      title: 'मालमत्ता व इन्व्हेंटरी',
      itemsCount: 'एकूण वस्तू',
      lowStockAlert: 'कमी साठा असलेल्या वस्तू',
      searchPlaceholder: 'वस्तू शोधा (उदा. साखर, तेल, डाळ...)',
      available: 'शिल्लक साठा',
      price: 'दर',
      addStock: 'साठा वाढवा',
      reduceStock: 'साठा कमी करा',
      addItem: 'नवीन वस्तू जोडा',
      lowStockBadge: 'कमी साठा',
      inStockBadge: 'पुरेसा साठा',
      itemName: 'वस्तूचे नाव',
      unit: 'एकक (kg / L / नग)',
      ratePerUnit: 'प्रति एकक किंमत (₹)',
      initialQty: 'सुरुवातीचा साठा',
      cancel: 'रद्द करा',
      save: 'जतन करा',
    },
    orders: {
      title: 'ग्राहकांच्या ऑर्डर्स',
      totalOrders: 'एकूण ऑर्डर्स',
      orderId: 'ऑर्डर क्र.',
      customer: 'ग्राहक',
      items: 'सामान',
      total: 'एकूण बिल',
      paymentMode: 'पेमेंट पद्धत',
      creditUdhaar: 'उधार (खाते)',
      cash: 'रोख (Cash)',
      completed: 'पूर्ण झाले',
      emptyOrders: 'कोणतीही ऑर्डर सापडली नाही.',
    },
    khata: {
      title: 'ग्राहकांची उधारी व खातावही',
      totalPending: 'एकूण येणे बाकी (उधारी)',
      customerCount: 'उधारी असलेले ग्राहक',
      recordPayment: 'जमा नोंदवा (पेमेंट)',
      currentUdhaar: 'चालू उधारी',
      lastVisit: 'शेवटचा व्यवहार',
      payAmount: 'जमा रक्कम (₹)',
      confirmPayment: 'रक्कम जमा करा',
      paymentReceived: 'पेमेंट यशस्वीरित्या जमा झाले!',
      highBalanceBadge: 'अधिक उधारी',
    },
    money: {
      title: 'दुकान नफा-तोटा व हिशोब',
      todaySales: 'आजची एकूण विक्री',
      todayExpenses: 'आजचा खर्च',
      netProfit: 'निव्वळ नफा',
      ordersToday: 'आजच्या ऑर्डर्स',
      last7DaysTrend: 'मागील ७ दिवसांचा कल',
      topSellingItems: 'सर्वाधिक खपाच्या वस्तू',
      recordExpense: 'खर्च नोंदवा',
      category: 'खर्च वर्ग',
      amount: 'रक्कम (₹)',
      note: 'तपशील / टीप',
      saveExpense: 'खर्च जतन करा',
    },
    common: {
      resetDemo: 'डेमो डेटा रीसेट करा',
      resetConfirmTitle: 'डेटा रीसेट करायचा का?',
      resetConfirmDesc: 'सर्व इन्व्हेंटरी, ऑर्डर्स आणि उधारी सुरुवातीच्या डेमो स्थितीत पूर्ववत होईल.',
      cancel: 'रद्द',
      confirm: 'रीसेट करा',
      speaking: 'उत्तर बोलत आहे...',
      muteSpeech: 'आवाज बंद करा',
      unmuteSpeech: 'आवाज चालू करा',
      demoTag: 'MSME Kirana OS',
    },
  },

  ta: {
    appName: 'வியவஸ்AI (VyavasAI)',
    tagline: 'மளிகைக் கடைக்கான குரல் இயக்க முறைமை',
    voiceOSBadge: 'குரல்-சார்ந்த மளிகை OS',
    langName: 'தமிழ் (ta-IN)',
    tabs: {
      home: 'முகப்பு',
      stock: 'இருப்பு',
      orders: 'ஆர்டர்கள்',
      khata: 'கடன் கணக்கு',
      money: 'பணம்',
    },
    mic: {
      tapToSpeak: 'பேச தட்டவும்',
      listening: 'கேட்கிறேன்... பேசுங்கள்',
      thinking: 'கடை தோழன் சிந்திக்கிறார்...',
      done: 'வேலை முடிந்தது!',
      trySaying: 'இதைச் சொல்லிப் பாருங்கள்:',
      typePrompt: 'அல்லது தட்டச்சு செய்யவும் (எ.கா: சர்க்கரை 5 கிலோ...)',
      send: 'அனுப்பு',
      waveformLabel: 'மைக் இயங்குகிறது',
      speechNotSupported: 'குரல் ஆதரவு கிடைக்கவில்லை. தட்டச்சு செய்யவும்.',
      listeningTips: 'தமிழ், ஆங்கிலம் அல்லது கலப்பு மொழியில் பேசலாம்',
    },
    sampleChips: {
      orderDemo: 'ரமேஷ் 5 கிலோ சர்க்கரை கேட்டார், ஆர்டர் செய்து இருப்பு மாற்று',
      salesQuery: 'இன்னைக்கு எவ்வளவு விற்பனை ஆச்சு?',
      khataQuery: 'சுரேஷ் பாக்கி எவ்வளவு இருக்கு?',
      stockQuery: 'அரிசி எவ்வளவு இருப்பு இருக்கு?',
    },
    agentSteps: {
      title: 'முகவர் படிகள் (Agent Steps)',
      subtitle: 'நிகழ்நேர பன்முக நடவடிக்கை வெளிப்படைத்தன்மை',
      timeline: 'நடவடிக்கை வரிசை',
      step: 'படி',
      result: 'முடிவு',
      toolCall: 'கருவி அழைப்பு',
      executed: 'வெற்றி',
      failed: 'தோல்வி',
      viewDetails: 'விவரங்களை காண்க',
      hideDetails: 'விவரங்களை மறைக்க',
      totalSteps: 'மொத்த படிகள்',
    },
    stock: {
      title: 'சரக்கு மற்றும் இருப்பு',
      itemsCount: 'பொருட்கள் எண்ணிக்கை',
      lowStockAlert: 'குறைந்த இருப்பு எச்சரிக்கை',
      searchPlaceholder: 'பொருளைத் தேடுங்கள் (சர்க்கரை, எண்ணெய்...)',
      available: 'கிடைக்கும் இருப்பு',
      price: 'விலை',
      addStock: 'இருப்பு கூட்டு',
      reduceStock: 'இருப்பு குறை',
      addItem: 'புதிய பொருள் சேர்',
      lowStockBadge: 'குறைந்த இருப்பு',
      inStockBadge: 'போதுமான இருப்பு',
      itemName: 'பொருள் பெயர்',
      unit: 'அலகு (kg / L)',
      ratePerUnit: 'ஒரு யூனிட் விலை (₹)',
      initialQty: 'தொடக்க இருப்பு',
      cancel: 'ரத்து செய்',
      save: 'சேமி',
    },
    orders: {
      title: 'வாடிக்கையாளர் ஆர்டர்கள்',
      totalOrders: 'மொத்த ஆர்டர்கள்',
      orderId: 'ஆர்டர் எண்',
      customer: 'வாடிக்கையாளர்',
      items: 'பொருட்கள்',
      total: 'மொத்த தொகை',
      paymentMode: 'கட்டண முறை',
      creditUdhaar: 'கடன் (உதார்)',
      cash: 'ரொக்கம்',
      completed: 'முடிந்தது',
      emptyOrders: 'ஆர்டர்கள் எதுவும் இல்லை.',
    },
    khata: {
      title: 'வாடிக்கையாளர் கடன் கணக்கு',
      totalPending: 'வர வேண்டிய மொத்த கடன்',
      customerCount: 'கடன் வாடிக்கையாளர்கள்',
      recordPayment: 'பணம் வரவு வை',
      currentUdhaar: 'தற்போதைய பாக்கி',
      lastVisit: 'கடைசி வருகை',
      payAmount: 'வரவு தொகை (₹)',
      confirmPayment: 'தொகை உறுதி செய்',
      paymentReceived: 'பணம் பெறப்பட்டு கணக்கில் குறைக்கப்பட்டது!',
      highBalanceBadge: 'அதிக பாக்கி',
    },
    money: {
      title: 'வருமானம் மற்றும் கணக்கு',
      todaySales: 'இன்றைய விற்பனை',
      todayExpenses: 'இன்றைய செலவு',
      netProfit: 'நிகர லாபம்',
      ordersToday: 'இன்றைய ஆர்டர்கள்',
      last7DaysTrend: 'கடந்த 7 நாட்கள் போக்கு',
      topSellingItems: 'அதிக விற்பனையான பொருட்கள்',
      recordExpense: 'செலவு பதிவு செய்',
      category: 'செலவு வகை',
      amount: 'தொகை (₹)',
      note: 'குறிப்பு',
      saveExpense: 'சேமிக்க',
    },
    common: {
      resetDemo: 'டெமோ தரவை மீட்டமை',
      resetConfirmTitle: 'தரவை மீட்டமைக்கவா?',
      resetConfirmDesc: 'அனைத்து இருப்பு, ஆர்டர்கள் மற்றும் பாக்கிகள் தொடக்க நிலைக்கு மாறும்.',
      cancel: 'ரத்து',
      confirm: 'மீட்டமை',
      speaking: 'குரல் பதில் பேசுகிறது...',
      muteSpeech: 'ஒலியை முடக்கு',
      unmuteSpeech: 'ஒலியை இயக்கு',
      demoTag: 'MSME Kirana OS',
    },
  },

  hi: {
    appName: 'व्यवसAI',
    tagline: 'किराना दुकान के लिए वॉयस ऑपरेटिंग सिस्टम',
    voiceOSBadge: 'आवाज-संचालित किराना ओएस',
    langName: 'हिन्दी (hi-IN)',
    tabs: {
      home: 'होम',
      stock: 'स्टॉक',
      orders: 'ऑर्डर',
      khata: 'खाता',
      money: 'हिसाब',
    },
    mic: {
      tapToSpeak: 'बोलने के लिए दबाएं',
      listening: 'सुन रहा हूँ... बोलिए',
      thinking: 'दुकान साथी सोच रहा है...',
      done: 'काम पूरा हो गया!',
      trySaying: 'यह बोलकर देखें:',
      typePrompt: 'या टाइप करें (उदा. चीनी 5 किलो...)',
      send: 'भेजें',
      waveformLabel: 'माइक चालू है',
      speechNotSupported: 'ब्राउज़र में वॉयस सपोर्ट उपलब्ध नहीं है। कृपया टाइप करें।',
      listeningTips: 'हिन्दी, अंग्रेजी या मिक्स भाषा में आराम से बोलें',
    },
    sampleChips: {
      orderDemo: 'रमेश ने 5 किलो चीनी मांगी, ऑर्डर करो और स्टॉक अपडेट करो',
      salesQuery: 'आज की कुल बिक्री कितनी हुई?',
      khataQuery: 'सुरेश का कितना उधार बाकी है?',
      stockQuery: 'चावल कितना बचा है?',
    },
    agentSteps: {
      title: 'एजेंट स्टेप्स (Agent Steps)',
      subtitle: 'हर कार्य की लाइव पारदर्शिता',
      timeline: 'कार्य प्रवाह',
      step: 'चरण',
      result: 'परिणाम',
      toolCall: 'टूल कॉल',
      executed: 'सफल',
      failed: 'विफल',
      viewDetails: 'विवरण देखें',
      hideDetails: 'विवरण छुपाएं',
      totalSteps: 'कुल चरण',
    },
    stock: {
      title: 'स्टॉक एवं इन्वेंट्री',
      itemsCount: 'कुल सामान',
      lowStockAlert: 'कम स्टॉक वाली वस्तुएं',
      searchPlaceholder: 'सामान खोजें (उदा. चीनी, तेल, दाल...)',
      available: 'उपलब्ध स्टॉक',
      price: 'रेट',
      addStock: 'स्टॉक बढ़ाएं',
      reduceStock: 'स्टॉक घटाएं',
      addItem: 'नया सामान जोड़ें',
      lowStockBadge: 'कम स्टॉक',
      inStockBadge: 'पर्याप्त स्टॉक',
      itemName: 'सामान का नाम',
      unit: 'इकाई (kg / L / पीस)',
      ratePerUnit: 'प्रति इकाई रेट (₹)',
      initialQty: 'शुरुआती स्टॉक',
      cancel: 'रद्द करें',
      save: 'सहेजें',
    },
    orders: {
      title: 'ग्राहकों के ऑर्डर',
      totalOrders: 'कुल ऑर्डर',
      orderId: 'ऑर्डर सं.',
      customer: 'ग्राहक',
      items: 'सामान',
      total: 'कुल बिल',
      paymentMode: 'भुगतान तरीका',
      creditUdhaar: 'उधार (खाता)',
      cash: 'नकद (Cash)',
      completed: 'पूर्ण',
      emptyOrders: 'कोई ऑर्डर नहीं मिला।',
    },
    khata: {
      title: 'ग्राहकों का उधार खाता',
      totalPending: 'कुल बकाया राशि (उधार)',
      customerCount: 'उधार वाले ग्राहक',
      recordPayment: 'जमा दर्ज करें (पेमेंट)',
      currentUdhaar: 'चालू उधार',
      lastVisit: 'अंतिम लेनदेन',
      payAmount: 'जमा राशि (₹)',
      confirmPayment: 'राशि जमा करें',
      paymentReceived: 'पेमेंट सफलतापूर्वक खाते में जमा हुआ!',
      highBalanceBadge: 'अधिक बकाया',
    },
    money: {
      title: 'दुकान का मुनाफा एवं हिसाब',
      todaySales: 'आज की कुल बिक्री',
      todayExpenses: 'आज का खर्च',
      netProfit: 'शुद्ध मुनाफा',
      ordersToday: 'आज के ऑर्डर',
      last7DaysTrend: 'पिछले 7 दिनों का रुझान',
      topSellingItems: 'सर्वाधिक बिकने वाला सामान',
      recordExpense: 'खर्च दर्ज करें',
      category: 'खर्च श्रेणी',
      amount: 'राशि (₹)',
      note: 'विवरण / नोट',
      saveExpense: 'खर्च सहेजें',
    },
    common: {
      resetDemo: 'डेमो डेटा रीसेट करें',
      resetConfirmTitle: 'डेटा रीसेट करना चाहते हैं?',
      resetConfirmDesc: 'सभी इन्वेंट्री, ऑर्डर और उधार शुरुआती डेमो स्थिति में वापस आ जाएंगे।',
      cancel: 'रद्द',
      confirm: 'रीसेट करें',
      speaking: 'जवाब बोल रहा हूँ...',
      muteSpeech: 'आवाज बंद करें',
      unmuteSpeech: 'आवाज चालू करें',
      demoTag: 'MSME Kirana OS',
    },
  },

  en: {
    appName: 'VyavasAI',
    tagline: 'Voice-First Agentic OS for Kirana Stores',
    voiceOSBadge: 'Voice-First Kirana OS',
    langName: 'English (en-IN)',
    tabs: {
      home: 'Home',
      stock: 'Stock',
      orders: 'Orders',
      khata: 'Khata',
      money: 'Money',
    },
    mic: {
      tapToSpeak: 'Tap to Speak',
      listening: 'Listening... speak now',
      thinking: 'Dukaan Saathi is thinking...',
      done: 'Task Completed!',
      trySaying: 'Try saying this:',
      typePrompt: 'Or type command (e.g. Ramesh wants 5 kg sugar...)',
      send: 'Send',
      waveformLabel: 'Microphone Active',
      speechNotSupported: 'Speech recognition not available in browser. Please type.',
      listeningTips: 'Speak naturally in English, Marathi, Tamil, or Hindi',
    },
    sampleChips: {
      orderDemo: 'Ramesh wants 5 kg sugar, create order and update stock',
      salesQuery: 'What is today\'s sales summary?',
      khataQuery: 'What is Suresh\'s pending udhaar balance?',
      stockQuery: 'How much rice is left in stock?',
    },
    agentSteps: {
      title: 'Agent Steps & Tool Chain',
      subtitle: 'Live real-time multi-step tool execution transparency',
      timeline: 'Execution Pipeline',
      step: 'Step',
      result: 'Result',
      toolCall: 'Tool Call',
      executed: 'Executed',
      failed: 'Failed',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      totalSteps: 'Total Steps',
    },
    stock: {
      title: 'Stock & Inventory',
      itemsCount: 'Total Items',
      lowStockAlert: 'Low Stock Alerts',
      searchPlaceholder: 'Search item (e.g. sugar, rice, oil...)',
      available: 'Available Qty',
      price: 'Unit Price',
      addStock: 'Add Stock',
      reduceStock: 'Reduce Stock',
      addItem: 'Add Item',
      lowStockBadge: 'Low Stock',
      inStockBadge: 'In Stock',
      itemName: 'Item Name',
      unit: 'Unit (kg / L / pcs)',
      ratePerUnit: 'Price per Unit (₹)',
      initialQty: 'Initial Quantity',
      cancel: 'Cancel',
      save: 'Save',
    },
    orders: {
      title: 'Customer Orders',
      totalOrders: 'Total Orders',
      orderId: 'Order #',
      customer: 'Customer',
      items: 'Items',
      total: 'Total Bill',
      paymentMode: 'Payment Mode',
      creditUdhaar: 'Credit / Khata',
      cash: 'Cash',
      completed: 'Completed',
      emptyOrders: 'No orders placed yet.',
    },
    khata: {
      title: 'Customer Khata & Udhaar Ledger',
      totalPending: 'Total Outstanding Udhaar',
      customerCount: 'Customers on Credit',
      recordPayment: 'Record Payment',
      currentUdhaar: 'Current Udhaar',
      lastVisit: 'Last Visit',
      payAmount: 'Payment Received (₹)',
      confirmPayment: 'Apply Payment',
      paymentReceived: 'Payment recorded and ledger balance updated!',
      highBalanceBadge: 'High Balance',
    },
    money: {
      title: 'Revenue, Profit & Financials',
      todaySales: "Today's Revenue",
      todayExpenses: "Today's Expenses",
      netProfit: 'Net Profit',
      ordersToday: 'Orders Today',
      last7DaysTrend: 'Last 7 Days Sales Trend',
      topSellingItems: 'Top Selling Items',
      recordExpense: 'Record Expense',
      category: 'Category',
      amount: 'Amount (₹)',
      note: 'Note / Vendor',
      saveExpense: 'Save Expense',
    },
    common: {
      resetDemo: 'Reset Demo Data',
      resetConfirmTitle: 'Reset all demo data?',
      resetConfirmDesc: 'Restores initial inventory, orders, and customer balances to seed state.',
      cancel: 'Cancel',
      confirm: 'Reset Data',
      speaking: 'Speaking reply...',
      muteSpeech: 'Mute voice audio',
      unmuteSpeech: 'Enable voice audio',
      demoTag: 'MSME Kirana OS',
    },
  },
};
