export type ApprovedCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Dried Goods'
  | 'Bakery & Bread'
  | 'Dairy & Eggs'
  | 'Condiments & Spices';

export type ItemStatus = 'available' | 'reserved' | 'collected' | 'expired' | 'removed';

export type StorageZone =
  | 'Chiller Fridge (2°C–4°C)'
  | 'Crisper Drawer'
  | 'Dry Pantry Shelf';

export type LanguageCode = 'en' | 'zh' | 'ms' | 'ta';

export interface FoodItem {
  id: string;
  name: string;
  category: ApprovedCategory;
  quantity: number;
  remainingQty: number;
  unit: string;
  estimatedKgPerUnit: number;
  dateDonated: string;
  expiryDate: string;
  storageZone: StorageZone;
  storageInstructions: string;
  allergens: string;
  halalFriendly: boolean;
  donorName: string;
  donorBlock: string;
  imageUrl: string;
  status: ItemStatus;
  qrPayload: string;
  inspectedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  dietaryTags: string[];
  ingredients: string[];
  steps: string[];
  imageUrl: string;
  wasteSavedNote: string;
  matchedAvailable?: string[];
  matchedExpiringSoon?: string[];
  matchScore?: number;
  source?: 'TheMealDB' | 'Local Pantry';
  cuisine?: string;
  category?: string;
  youtubeUrl?: string;
}

export interface ActivityRecord {
  id: string;
  type: 'donation' | 'collection' | 'admin_removal';
  itemId: string;
  itemName: string;
  quantityText: string;
  residentName: string;
  block: string;
  timestamp: string;
  method: 'QR Scan' | 'Manual Entry' | 'Self-Collect' | 'Volunteer Inspection';
}

export interface FridgeLog {
  id: string;
  recordedAt: string;
  temperatureC: number;
  cleanedBy: string;
  sanitisedChecklist: boolean;
  notes: string;
}

export interface SmsSubscriber {
  id: string;
  name: string;
  phoneLast4: string;
  block: string;
  preferredLang: LanguageCode;
  subscribedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  category: "Today's Fresh Finds" | 'Estate Notice' | 'Volunteer Update';
}

export interface ResidentProfile {
  name: string;
  block: string;
  appreciationPoints: number;
  language: LanguageCode;
  largeText: boolean;
}

export interface MonthlyStat {
  month: string;
  donatedKg: number;
  collectedKg: number;
}

export interface TopContributor {
  name: string;
  block: string;
  donationsCount: number;
  kgShared: number;
}

export interface CommunityStats {
  availableItemsCount: number;
  expiringSoonCount: number;
  totalDonatedKg: number;
  totalCollectedKg: number;
  wastePreventedKg: number;
  mealsSupported: number;
  activeContributorsCount: number;
  latestTempC: number;
  lastCleanedAt: string;
  monthlyTrend: MonthlyStat[];
  topContributors: TopContributor[];
  smsDigestText: string;
}

export const APPROVED_CATEGORIES: ApprovedCategory[] = [
  'Vegetables',
  'Fruits',
  'Dried Goods',
  'Bakery & Bread',
  'Dairy & Eggs',
  'Condiments & Spices',
];

export const STORAGE_ZONES: StorageZone[] = [
  'Chiller Fridge (2°C–4°C)',
  'Crisper Drawer',
  'Dry Pantry Shelf',
];
