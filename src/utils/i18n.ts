import type { LanguageCode } from '../types/pantry';

export interface LanguageStrings {
  label: string;
  greeting: string;
  tagline: string;
  navHome: string;
  navFind: string;
  navDonate: string;
  navRecipes: string;
  navProfile: string;
  ctaFind: string;
  ctaDonate: string;
  ctaRecipes: string;
  freshFindsTitle: string;
  useSoonTitle: string;
}

export const LANGUAGE_PACKS: Record<LanguageCode, LanguageStrings> = {
  en: {
    label: 'English',
    greeting: 'Welcome, Neighbour',
    tagline: 'Share What You Can, Take What You Need.',
    navHome: 'Home',
    navFind: 'Find Food',
    navDonate: 'Donate',
    navRecipes: 'Recipes',
    navProfile: 'My Profile',
    ctaFind: 'Find Available Food',
    ctaDonate: 'Donate Surplus Food',
    ctaRecipes: 'View Simple Recipes',
    freshFindsTitle: "Today's Fresh Finds",
    useSoonTitle: 'Use Soon — Collect Today',
  },
  zh: {
    label: '中文',
    greeting: '邻居您好，欢迎来到甘榜食物库',
    tagline: '分享多余食材，按需免费领取。',
    navHome: '首页',
    navFind: '寻找食物',
    navDonate: '捐赠食物',
    navRecipes: '省食食谱',
    navProfile: '我的资料',
    ctaFind: '查看现有食物',
    ctaDonate: '捐赠多余食材',
    ctaRecipes: '查看简易食谱',
    freshFindsTitle: '今日新鲜上架',
    useSoonTitle: '即将到期 — 请尽快领取',
  },
  ms: {
    label: 'Melayu',
    greeting: 'Selamat Datang, Jiran',
    tagline: 'Kongsi Apa Yang Mampu, Ambil Apa Yang Perlu.',
    navHome: 'Utama',
    navFind: 'Cari Makanan',
    navDonate: 'Derma',
    navRecipes: 'Resipi',
    navProfile: 'Profil Saya',
    ctaFind: 'Cari Makanan Tersedia',
    ctaDonate: 'Derma Lebihan Makanan',
    ctaRecipes: 'Lihat Resipi Mudah',
    freshFindsTitle: 'Hasil Segar Hari Ini',
    useSoonTitle: 'Guna Segera — Ambil Hari Ini',
  },
  ta: {
    label: 'தமிழ்',
    greeting: 'வணக்கம் அண்டை வீட்டாரே',
    tagline: 'உங்களால் முடிந்ததைப் பகிருங்கள், தேவையானதை எடுத்துக் கொள்ளுங்கள்.',
    navHome: 'முகப்பு',
    navFind: 'உணவு தேடு',
    navDonate: 'நன்கொடை',
    navRecipes: 'சமையல்',
    navProfile: 'சுயவிவரம்',
    ctaFind: 'உணவைப் பார்க்கவும்',
    ctaDonate: 'உணவு நன்கொடை',
    ctaRecipes: 'எளிய சமையல் குறிப்புகள்',
    freshFindsTitle: 'இன்றைய புதிய உணவுகள்',
    useSoonTitle: 'விரைவில் பயன்படுத்துங்கள்',
  },
};

export function formatDaysUntilExpiry(expiryDate: string): {
  days: number;
  label: string;
  urgency: 'soon' | 'normal';
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + 'T00:00:00');
  const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (days <= 0) {
    return { days, label: 'Use Today', urgency: 'soon' };
  }
  if (days === 1) {
    return { days, label: 'Use by Tomorrow', urgency: 'soon' };
  }
  if (days === 2) {
    return { days, label: '2 days left', urgency: 'soon' };
  }
  return { days, label: `${days} days left`, urgency: 'normal' };
}
