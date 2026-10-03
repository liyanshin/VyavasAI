import { InventoryItem, Customer } from '../types';

export interface ItemAlias {
  canonicalId: string;
  aliases: string[];
}

export const ITEM_ALIASES: ItemAlias[] = [
  {
    canonicalId: 'item-sugar',
    aliases: [
      'sugar', 'sakhar', 'saakhar', 'साखर', 'साखरची', 'साखरेची', 'साखरचे',
      'chini', 'cheeni', 'shakkar', 'चीनी', 'சர்க்கரை', 'sarkarai', 'sharkkarai'
    ],
  },
  {
    canonicalId: 'item-rice',
    aliases: [
      'rice', 'tandul', 'taandul', 'tandool', 'तांदूळ', 'तांदळाची', 'तांदूळचे',
      'chawal', 'chaawal', 'चावल', 'அரிசி', 'arisi', 'arisiya'
    ],
  },
  {
    canonicalId: 'item-wheat-flour',
    aliases: [
      'wheat flour', 'wheat', 'flour', 'atta', 'aata', 'gahu', 'gahu peeth', 'गहू', 'गव्हाचे पीठ', 'आटा',
      'கோதுமை மாவு', 'gothumai', 'gothumai maavu'
    ],
  },
  {
    canonicalId: 'item-toor-dal',
    aliases: [
      'toor dal', 'tur dal', 'arhar dal', 'dal', 'daal', 'तूर डाळ', 'तूर', 'तुवर', 'दाल',
      'துவரம் பருப்பு', 'பருப்பு', 'thuvaram paruppu', 'dhal', 'paruppu'
    ],
  },
  {
    canonicalId: 'item-cooking-oil',
    aliases: [
      'cooking oil', 'oil', 'tel', 'godatel', 'khadyatel', 'तेल', 'गोडेतेल', 'खाद्य तेल',
      'சமையல் எண்ணெய்', 'எண்ணெய்', 'ennai', 'samayal ennai'
    ],
  },
  {
    canonicalId: 'item-tea-powder',
    aliases: [
      'tea powder', 'tea', 'chai patti', 'chai', 'chaha', 'chaha patti', 'चहा', 'चहा पावडर', 'चाय पत्ती',
      'தேயிலைத்தூள்', 'டீ தூள்', 'tea thool', 'theeyilai thool'
    ],
  },
  {
    canonicalId: 'item-salt',
    aliases: [
      'salt', 'meeth', 'mith', 'मीठ', 'मीठाची', 'namak', 'नमक',
      'உப்பு', 'uppu', 'uppae'
    ],
  },
];

export function findMatchingItem(query: string, inventory: InventoryItem[]): InventoryItem | undefined {
  if (!query) return undefined;
  const clean = query.toLowerCase().trim();

  // 1. Direct match on item id or english name
  const directMatch = inventory.find(
    (i) => i.id.toLowerCase() === clean || i.name.toLowerCase() === clean
  );
  if (directMatch) return directMatch;

  // 2. Check alias database
  for (const aliasEntry of ITEM_ALIASES) {
    const isMatched = aliasEntry.aliases.some(
      (a) => clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean)
    );
    if (isMatched) {
      const found = inventory.find((i) => i.id === aliasEntry.canonicalId);
      if (found) return found;
    }
  }

  // 3. Substring matching in localized names
  for (const item of inventory) {
    if (
      item.localizedNames.mr.toLowerCase().includes(clean) ||
      item.localizedNames.ta.toLowerCase().includes(clean) ||
      item.localizedNames.hi.toLowerCase().includes(clean) ||
      item.localizedNames.en.toLowerCase().includes(clean)
    ) {
      return item;
    }
  }

  return undefined;
}

export function findMatchingCustomer(query: string, customers: Customer[]): Customer | undefined {
  if (!query) return undefined;
  const clean = query.toLowerCase().trim();

  // Match English or Devanagari / Tamil transliteration
  const customerMap: Record<string, string[]> = {
    'Ramesh': ['ramesh', 'रमेश', 'रमेशने', 'रमेशचा', 'रमेशचे', 'ரமேஷ்', 'rameshne'],
    'Suresh': ['suresh', 'सुरेश', 'सुरेशने', 'सुरेशचा', 'सुरेशचे', 'சுரேஷ்', 'sureshne'],
    'Sunita': ['sunita', 'सुनीता', 'सुनिता', 'சுனிதா', 'sunitane'],
    'Lakshmi': ['lakshmi', 'laxmi', 'लक्ष्मी', 'லட்சுமி', 'lakshmine'],
  };

  for (const [canonicalName, aliases] of Object.entries(customerMap)) {
    if (aliases.some((a) => clean.includes(a) || a.includes(clean))) {
      return customers.find((c) => c.name.toLowerCase() === canonicalName.toLowerCase());
    }
  }

  // Fallback direct name match
  return customers.find((c) => c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase()));
}
