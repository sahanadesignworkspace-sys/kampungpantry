import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Copy,
  Check,
  HeartHandshake,
  MessageSquareText,
  PlusCircle,
  Search,
  Thermometer,
  Type,
} from 'lucide-react';
import type {
  Announcement,
  CommunityStats,
  FoodItem,
  LanguageCode,
} from '../types/pantry';
import { IMAGE_ASSETS } from '../utils/imageAssets';
import { formatDaysUntilExpiry, LANGUAGE_PACKS } from '../utils/i18n';
import { FoodImage } from './FoodImage';
import { PWAInstallButton } from './PWAControls';

export type ActiveTab = 'home' | 'find' | 'donate' | 'recipes' | 'profile';

interface HomeViewProps {
  items: FoodItem[];
  stats: CommunityStats | null;
  announcements: Announcement[];
  language: LanguageCode;
  largeText: boolean;
  onChangeLanguage: (lang: LanguageCode) => void;
  onToggleLargeText: () => void;
  onNavigate: (tab: ActiveTab) => void;
  onCollectItem: (item: FoodItem) => void;
}

export function HomeView({
  items,
  stats,
  announcements,
  language,
  largeText,
  onChangeLanguage,
  onToggleLargeText,
  onNavigate,
  onCollectItem,
}: HomeViewProps) {
  const [copiedSms, setCopiedSms] = useState(false);
  const t = LANGUAGE_PACKS[language];

  const availableItems = items.filter((i) => i.status === 'available' && i.remainingQty > 0);
  const expiringSoonItems = availableItems.filter(
    (i) => formatDaysUntilExpiry(i.expiryDate).days <= 2
  );
  const newlyDonatedItems = availableItems.slice(0, 3);
  const freshFinds = announcements.find((a) => a.category === "Today's Fresh Finds") || announcements[0];

  async function handleCopySms() {
    if (!stats?.smsDigestText) return;
    try {
      await navigator.clipboard.writeText(stats.smsDigestText);
      setCopiedSms(true);
      setTimeout(() => setCopiedSms(false), 2500);
    } catch {
      setCopiedSms(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Elderly Accessibility & Language Bar (below fold/top bar contract) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E6DF] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleLargeText}
            aria-pressed={largeText}
            className={`inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              largeText
                ? 'border-[#1B5E3A] bg-[#1B5E3A] text-white'
                : 'border-[#CFD7CC] bg-[#FBFBF8] text-[#1A241E] hover:bg-[#F0F4EF]'
            }`}
          >
            <Type className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{largeText ? 'Large Text: On' : 'Large Text (A+)'}</span>
          </button>

          <div
            className="flex items-center gap-1 rounded-xl bg-[#F2F5F1] p-1"
            role="group"
            aria-label="Language selection"
          >
            {(['en', 'zh', 'ms', 'ta'] as LanguageCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onChangeLanguage(code)}
                className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === code
                    ? 'bg-white text-[#1B5E3A] border border-[#DCE2DA]'
                    : 'text-[#4B5B51] hover:text-[#1A241E]'
                }`}
              >
                {LANGUAGE_PACKS[code].label}
              </button>
            ))}
          </div>
        </div>

        <PWAInstallButton />
      </div>

      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl border border-[#E2E6DF] bg-white p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#4B5B51]">
              Blk 412 HDB Void Deck · Free Community Fridge &amp; Dry Pantry
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#14241B] [text-wrap:balance]">
              {t.greeting}. {t.tagline}
            </h1>
            <p className="text-base text-[#3E4F45] leading-relaxed max-w-2xl">
              Check what fresh vegetables, fruits, and pantry staples neighbours shared today before walking down. Everything is free — take what your household needs, or drop off surplus ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('find')}
              className="min-h-[52px] flex items-center justify-center gap-2.5 rounded-xl bg-[#1B5E3A] px-5 py-3 text-base font-semibold text-white hover:bg-[#154A2D] transition-colors whitespace-nowrap cursor-pointer"
            >
              <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.ctaFind}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('donate')}
              className="min-h-[52px] flex items-center justify-center gap-2.5 rounded-xl border border-[#1B5E3A] bg-[#F2F7F3] px-5 py-3 text-base font-semibold text-[#1B5E3A] hover:bg-[#E4EFE6] transition-colors whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.ctaDonate}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recipes')}
              className="min-h-[52px] flex items-center justify-center gap-2.5 rounded-xl border border-[#CFD7CC] bg-white px-5 py-3 text-base font-semibold text-[#1A241E] hover:bg-[#F4F6F3] transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{t.ctaRecipes}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-[#E2E6DF] bg-[#EEF3EE] min-h-[240px]">
          <img
            src={IMAGE_ASSETS.hero}
            alt="Neighbours sharing fresh vegetables and pantry staples at the HDB void deck community fridge"
            referrerPolicy="no-referrer"
            className="w-full h-full lg:h-full object-cover"
          />
        </div>
      </section>

      {/* Full-Width 4-Column Impact & Fridge Hygiene Strip */}
      <section
        aria-label="Live pantry status and community impact"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-5">
          <div className="text-sm font-medium text-[#4B5B51]">Available Now</div>
          <div className="mt-1.5 text-3xl font-bold font-display tabular-nums text-[#1B5E3A]">
            {stats ? stats.availableItemsCount : availableItems.length}
          </div>
          <div className="mt-1 text-xs text-[#59695F]">Ready for pickup today</div>
        </div>

        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-5">
          <div className="text-sm font-medium text-[#4B5B51]">Food Rescued</div>
          <div className="mt-1.5 text-3xl font-bold font-display tabular-nums text-[#14241B]">
            {stats ? `${stats.wastePreventedKg} kg` : '—'}
          </div>
          <div className="mt-1 text-xs text-[#59695F]">Household waste prevented</div>
        </div>

        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-5">
          <div className="text-sm font-medium text-[#4B5B51]">Meals Supported</div>
          <div className="mt-1.5 text-3xl font-bold font-display tabular-nums text-[#14241B]">
            {stats ? stats.mealsSupported : '—'}
          </div>
          <div className="mt-1 text-xs text-[#59695F]">
            Across {stats ? stats.activeContributorsCount : 30}+ estate neighbours
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-5">
          <div className="flex items-center gap-1.5 text-sm font-medium text-[#4B5B51]">
            <Thermometer className="w-4 h-4 text-[#1B5E3A]" aria-hidden="true" />
            <span>Fridge Chiller Temp</span>
          </div>
          <div className="mt-1.5 text-3xl font-bold font-display tabular-nums text-[#14241B]">
            {stats ? `${stats.latestTempC.toFixed(1)}°C` : '3.2°C'}
          </div>
          <div className="mt-1 text-xs text-[#59695F]">Safe zone (2°C–4°C) · Verified</div>
        </div>
      </section>

      {/* Today's Fresh Finds & Use Soon Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-[#D4DFD5] bg-[#F2F7F3] p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-wide text-[#1B5E3A]">
              Daily Community Bulletin · {freshFinds?.date || 'Today'}
            </div>
            <h2 className="text-2xl font-bold text-[#14241B] [text-wrap:balance]">
              {t.freshFindsTitle}
            </h2>
            <p className="text-base text-[#2C3B32] leading-relaxed">
              {freshFinds?.body ||
                'Fresh greens, tropical fruit, and dry staples have been checked and placed inside the Blk 412 fridge.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#D4DFD5] space-y-3">
            <div className="text-xs font-semibold text-[#3B5245]">
              Halal-Friendly &amp; Safety Promise
            </div>
            <p className="text-sm text-[#35443B]">
              No pork, raw meat, alcohol, or unlabelled leftovers. Every shelf is inspected daily by community volunteers.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('find')}
              className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#1B5E3A] hover:underline cursor-pointer"
            >
              <span>Browse all {availableItems.length} available listings</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Items Approaching Use-By Date */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E6DF] bg-white p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#14241B]">{t.useSoonTitle}</h2>
              <p className="text-sm text-[#4B5B51]">
                Collect these fresh items first so nothing goes to waste.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('recipes')}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#CFD7CC] text-sm font-semibold text-[#1A241E] hover:bg-[#F4F6F3] whitespace-nowrap cursor-pointer"
            >
              Recipes using these
            </button>
          </div>

          {expiringSoonItems.length === 0 ? (
            <div className="rounded-xl bg-[#F8FAF7] border border-[#E6EBE4] p-6 text-center text-sm text-[#4B5B51]">
              All current fridge items have plenty of time left. Check Newly Donated below!
            </div>
          ) : (
            <div className="divide-y divide-[#EAECE7]">
              {expiringSoonItems.slice(0, 3).map((item) => {
                const exp = formatDaysUntilExpiry(item.expiryDate);
                return (
                  <div
                    key={item.id}
                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <FoodImage
                        src={item.imageUrl}
                        category={item.category}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#E2E6DF]"
                      />
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-[#14241B] truncate">
                          {item.name}
                        </h3>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-[#4B5B51]">
                          <span className="font-semibold tabular-nums text-[#1A241E]">
                            {item.remainingQty} {item.unit}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{item.storageZone}</span>
                        </div>
                        <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#92400E]">
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{exp.label}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular font-normal text-[#59695F]">
                            {item.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onCollectItem(item)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1B5E3A] text-white text-sm font-semibold hover:bg-[#154A2D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Collect
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newly Donated Highlights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#14241B]">Newly Shared by Neighbours</h2>
            <p className="text-sm text-[#4B5B51]">
              Freshly added items waiting in the fridge and dry pantry shelf.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('find')}
            className="min-h-[44px] px-3 py-2 text-sm font-semibold text-[#1B5E3A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {newlyDonatedItems.map((item) => {
            const exp = formatDaysUntilExpiry(item.expiryDate);
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-[#E2E6DF] bg-white overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#EEF3EE]">
                    <FoodImage
                      src={item.imageUrl}
                      category={item.category}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-xs font-medium text-[#4B5B51]">
                      {item.category} · Shared by {item.donorBlock}
                    </div>
                    <h3 className="text-lg font-bold text-[#14241B]">{item.name}</h3>
                    <div className="text-sm text-[#35443B] tabular-nums">
                      {item.remainingQty} {item.unit} available ·{' '}
                      <span className={exp.urgency === 'soon' ? 'font-semibold text-[#92400E]' : ''}>
                        {exp.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button
                    type="button"
                    onClick={() => onCollectItem(item)}
                    className="w-full min-h-[44px] rounded-xl border border-[#1B5E3A] bg-white text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] transition-colors cursor-pointer"
                  >
                    Reserve / Collect
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Monthly Impact & SMS Bulletin for Non-App Residents */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl border border-[#E2E6DF] bg-white p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#14241B]">Monthly Food-Sharing Impact</h2>
              <p className="text-sm text-[#4B5B51]">
                Every kilogram shared strengthens our HDB estate and keeps good food off landfills.
              </p>
            </div>
            <HeartHandshake className="w-6 h-6 text-[#1B5E3A] shrink-0" aria-hidden="true" />
          </div>

          <div className="space-y-3">
            {(stats?.monthlyTrend || []).map((row) => {
              const pct = Math.min(100, Math.round((row.collectedKg / 50) * 100));
              return (
                <div key={row.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[#1A241E]">{row.month} 2026</span>
                    <span className="font-mono-tabular text-xs text-[#4B5B51]">
                      {row.collectedKg} kg collected / {row.donatedKg} kg donated
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-[#EEF2EC] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#1B5E3A]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {stats && stats.topContributors.length > 0 && (
            <div className="pt-3 border-t border-[#EAECE7]">
              <div className="text-xs font-semibold text-[#4B5B51] mb-2">
                Active Estate Contributors
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#1A241E]">
                {stats.topContributors.map((c) => (
                  <span key={`${c.name}-${c.block}`} className="tabular-nums">
                    <strong>{c.name}</strong> ({c.block}) · {c.kgShared} kg
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SMS-Friendly Notice for Residents Without App */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E2E6DF] bg-white p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#1B5E3A]">
              <MessageSquareText className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#14241B]">
                SMS Daily Update (No Smartphone Needed)
              </h2>
            </div>
            <p className="text-sm text-[#4B5B51]">
              Share this text digest with elderly neighbours or subscribe in My Profile to receive daily morning updates via SMS.
            </p>
            <pre className="whitespace-pre-wrap rounded-xl border border-[#E2E6DF] bg-[#FBFBF8] p-3.5 text-xs font-mono-tabular text-[#1A241E] leading-relaxed">
              {stats?.smsDigestText || 'Loading today’s SMS bulletin...'}
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopySms}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-[#1B5E3A] bg-[#F2F7F3] px-4 text-sm font-semibold text-[#1B5E3A] hover:bg-[#E4EFE6] cursor-pointer"
            >
              {copiedSms ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Copied SMS Text</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" aria-hidden="true" />
                  <span>Copy SMS Text</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="min-h-[44px] px-4 rounded-xl border border-[#CFD7CC] text-sm font-semibold text-[#1A241E] hover:bg-[#F4F6F3] cursor-pointer"
            >
              SMS Opt-In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
