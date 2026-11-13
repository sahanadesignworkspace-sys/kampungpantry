import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Home,
  PlusCircle,
  QrCode,
  Search,
  User,
} from 'lucide-react';
import type {
  ActivityRecord,
  Announcement,
  CommunityStats,
  FoodItem,
  LanguageCode,
  Recipe,
  ResidentProfile,
} from './types/pantry';
import { LANGUAGE_PACKS } from './utils/i18n';
import { HomeView, type ActiveTab } from './components/HomeView';
import { FindFoodView } from './components/FindFoodView';
import { DonateView } from './components/DonateView';
import { RecipesView } from './components/RecipesView';
import { ProfileView } from './components/ProfileView';
import { CollectModal } from './components/CollectModal';
import { OfflineIndicator } from './components/PWAControls';
import {
  getMockActivities,
  getMockAnnouncements,
  getMockFoodItems,
  getMockRecipes,
  getMockStats,
} from './data/mockPantryData';

const PROFILE_STORAGE_KEY = 'kampung_pantry_profile_v1';
const CACHE_STORAGE_KEY = 'kampung_pantry_offline_cache_v1';

const DEFAULT_PROFILE: ResidentProfile = {
  name: '',
  block: 'Blk 412',
  appreciationPoints: 30,
  language: 'en',
  largeText: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealCategories, setMealCategories] = useState<Array<{ idCategory: string; strCategory: string }>>([]);
  const [mealDbConfigured, setMealDbConfigured] = useState(false);
  const [recipeSource, setRecipeSource] = useState<'themealdb' | 'local-fallback'>('themealdb');
  const [queriedIngredients, setQueriedIngredients] = useState<string[]>([]);
  const [checkedIngredientIds, setCheckedIngredientIds] = useState<string[]>([]);
  const [selectedRecipeIngredients, setSelectedRecipeIngredients] = useState<string[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const [profile, setProfile] = useState<ResidentProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    } catch {
      // Fallback to defaults
    }
    return DEFAULT_PROFILE;
  });

  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [collectTargetItem, setCollectTargetItem] = useState<FoodItem | null>(null);

  useEffect(() => {
    if (profile.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const fetchAllData = useCallback(async () => {
    const applyMockFallback = () => {
      try {
        const cached = localStorage.getItem(CACHE_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            setItems(parsed.items);
            setRecipes(parsed.recipes?.length ? parsed.recipes : getMockRecipes());
            setRecipeSource('local-fallback');
            setStats(parsed.stats || getMockStats(parsed.items));
            setAnnouncements(parsed.announcements?.length ? parsed.announcements : getMockAnnouncements());
            setRecentActivities(parsed.recentActivities?.length ? parsed.recentActivities : getMockActivities());
            return;
          }
        }
      } catch {
        // Ignore cache read error
      }
      const mockItems = getMockFoodItems();
      setItems(mockItems);
      setRecipes(getMockRecipes());
      setRecipeSource('local-fallback');
      setStats(getMockStats(mockItems));
      setAnnouncements(getMockAnnouncements());
      setRecentActivities(getMockActivities());
    };

    try {
      const [invRes, recRes, statsRes, catRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/recipes'),
        fetch('/api/stats'),
        fetch('/api/categories'),
      ]);

      if (!invRes.ok || !recRes.ok || !statsRes.ok) {
        throw new Error('Failed to load pantry data');
      }

      const invData = await invRes.json();
      const recData = await recRes.json();
      const statsData = await statsRes.json();
      const catData = await catRes.json().catch(() => ({ categories: [], configured: false }));

      const loadedItems: FoodItem[] =
        Array.isArray(invData.items) && invData.items.length > 0
          ? invData.items
          : getMockFoodItems();
      const loadedRecipes: Recipe[] =
        Array.isArray(recData.recipes) && recData.recipes.length > 0
          ? recData.recipes
          : getMockRecipes();

      setItems(loadedItems);
      setRecipes(loadedRecipes);
      setMealCategories(catData.categories || []);
      setMealDbConfigured(Boolean(recData.configured ?? catData.configured));
      setRecipeSource(recData.source === 'local-fallback' ? 'local-fallback' : 'themealdb');
      setQueriedIngredients(recData.queriedIngredients || []);
      setStats(statsData.stats || getMockStats(loadedItems));
      setAnnouncements(statsData.announcements || getMockAnnouncements());
      setRecentActivities(statsData.recentActivities || getMockActivities());

      try {
        localStorage.setItem(
          CACHE_STORAGE_KEY,
          JSON.stringify({
            items: loadedItems,
            recipes: loadedRecipes,
            stats: statsData.stats || getMockStats(loadedItems),
            announcements: statsData.announcements || getMockAnnouncements(),
            recentActivities: statsData.recentActivities || getMockActivities(),
          })
        );
      } catch {
        // Ignore offline cache write error
      }
    } catch {
      applyMockFallback();
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchRecipes = useCallback(
    async (opts: {
      q?: string;
      ingredient?: string;
      category?: string;
      ingredients?: string[];
    }) => {
      setLoadingRecipes(true);
      const applyLocalRecipeFilter = () => {
        const allLocal = getMockRecipes();
        let filtered = allLocal;
        if (opts.ingredients && opts.ingredients.length > 0) {
          const sels = opts.ingredients.map((s) => s.toLowerCase());
          const matched = allLocal.filter((r) =>
            r.ingredients.some((ing) =>
              sels.some((sel) => ing.toLowerCase().includes(sel) || sel.includes(ing.toLowerCase()))
            )
          );
          filtered = matched.length > 0 ? matched : allLocal;
        } else if (opts.q) {
          const q = opts.q.toLowerCase();
          filtered = allLocal.filter(
            (r) =>
              r.title.toLowerCase().includes(q) ||
              r.ingredients.some((i) => i.toLowerCase().includes(q))
          );
        } else if (opts.ingredient) {
          const ingQ = opts.ingredient.toLowerCase();
          filtered = allLocal.filter((r) =>
            r.ingredients.some((i) => i.toLowerCase().includes(ingQ))
          );
        }
        setRecipes(filtered);
        setRecipeSource('local-fallback');
      };

      try {
        const params = new URLSearchParams();
        if (opts.q) params.set('q', opts.q);
        if (opts.ingredient) params.set('ingredient', opts.ingredient);
        if (opts.category) params.set('category', opts.category);
        if (opts.ingredients && opts.ingredients.length > 0) {
          params.set('ingredients', opts.ingredients.join(','));
          setSelectedRecipeIngredients(opts.ingredients);
        } else {
          setSelectedRecipeIngredients([]);
        }
        const query = params.toString();
        const res = await fetch(`/api/recipes${query ? `?${query}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          setRecipes(data.recipes || getMockRecipes());
          setMealDbConfigured(Boolean(data.configured));
          setRecipeSource(data.source === 'local-fallback' ? 'local-fallback' : 'themealdb');
          setQueriedIngredients(data.queriedIngredients || []);
        } else {
          applyLocalRecipeFilter();
        }
      } catch {
        applyLocalRecipeFilter();
      } finally {
        setLoadingRecipes(false);
      }
    },
    []
  );

  function handleFindMatchingRecipes(selectedNames: string[]) {
    setActiveTab('recipes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSearchRecipes({ ingredients: selectedNames });
  }

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }

  function handleNavigate(tab: ActiveTab) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenCollect(item: FoodItem | null) {
    setCollectTargetItem(item);
    setCollectModalOpen(true);
  }

  const availableItems = items.filter(
    (i) => i.status === 'available' && i.remainingQty > 0
  );
  const t = LANGUAGE_PACKS[profile.language];

  const navItems: Array<{ id: ActiveTab; label: string; icon: typeof Home }> = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'find', label: t.navFind, icon: Search },
    { id: 'donate', label: t.navDonate, icon: PlusCircle },
    { id: 'recipes', label: t.navRecipes, icon: BookOpen },
    { id: 'profile', label: t.navProfile, icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF8] text-[#1A241E]">
      {/* Desktop Top Bar Contract (3 zones separated by gap-8) & Compact Mobile Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E2E6DF] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-lg md:text-xl font-extrabold font-display tracking-tight text-[#1B5E3A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kampung Pantry
          </button>

          {/* Zone 2: 5 concise single-line text navigation links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-semibold"
          >
            {navItems.map((nav) => {
              const active = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => handleNavigate(nav.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                    active
                      ? 'text-[#1B5E3A] border-[#1B5E3A]'
                      : 'text-[#4B5B51] border-transparent hover:text-[#14241B]'
                  }`}
                >
                  {nav.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleOpenCollect(null)}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#1B5E3A] px-4 py-2 text-xs md:text-sm font-semibold text-white hover:bg-[#154A2D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Collect Food</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-6 rounded-xl border border-[#BFE0C6] bg-[#EBF6EE] px-4 py-3 text-sm font-semibold text-[#144A2D]"
          >
            {toastMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#E2E6DF] bg-white p-12 text-center text-base font-medium text-[#4B5B51]">
            Loading community fridge inventory...
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                items={items}
                stats={stats}
                announcements={announcements}
                language={profile.language}
                largeText={profile.largeText}
                onChangeLanguage={(lang: LanguageCode) =>
                  setProfile((p) => ({ ...p, language: lang }))
                }
                onToggleLargeText={() =>
                  setProfile((p) => ({ ...p, largeText: !p.largeText }))
                }
                onNavigate={handleNavigate}
                onCollectItem={(item) => handleOpenCollect(item)}
              />
            )}

            {activeTab === 'find' && (
              <FindFoodView
                items={items}
                checkedItemIds={checkedIngredientIds}
                onChangeCheckedItemIds={setCheckedIngredientIds}
                onFindMatchingRecipes={handleFindMatchingRecipes}
                onCollectItem={(item) => handleOpenCollect(item)}
                onOpenScanner={() => handleOpenCollect(null)}
              />
            )}

            {activeTab === 'donate' && (
              <DonateView
                profile={profile}
                onDonated={(newItem, pts) => {
                  setProfile((p) => ({
                    ...p,
                    appreciationPoints: p.appreciationPoints + pts,
                  }));
                  fetchAllData();
                  showToast(`Registered ${newItem.name} (${newItem.id})! +${pts} appreciation points.`);
                }}
                onGoToFind={() => handleNavigate('find')}
              />
            )}

            {activeTab === 'recipes' && (
              <RecipesView
                recipes={recipes}
                mealCategories={mealCategories}
                mealDbConfigured={mealDbConfigured}
                recipeSource={recipeSource}
                queriedIngredients={queriedIngredients}
                selectedIngredients={selectedRecipeIngredients}
                loadingRecipes={loadingRecipes}
                onSearchRecipes={handleSearchRecipes}
                onGoToFind={() => handleNavigate('find')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                onUpdateProfile={setProfile}
                recentActivities={recentActivities}
                announcements={announcements}
                onRefreshData={fetchAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Quiet Desktop Footer */}
      <footer className="hidden md:block border-t border-[#E2E6DF] bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#59695F]">
          <div>
            <strong>Kampung Pantry</strong> — Share What You Can, Take What You Need. Free HDB Community Fridge Initiative.
          </div>
          <div>
            No smartphone or app required for physical food collection · Halal-friendly estate guidelines
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom 5-Tab Navigation (thumb zone, compact height <= 15% cap combined with top bar) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2E6DF] bg-white/95 backdrop-blur-md pb-safe"
      >
        <div className="grid grid-cols-5 h-16 items-center">
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const active = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => handleNavigate(nav.id)}
                aria-current={active ? 'page' : undefined}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 px-1 transition-colors cursor-pointer ${
                  active ? 'text-[#1B5E3A] font-bold' : 'text-[#59695F] font-medium'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.4 : 1.8} aria-hidden="true" />
                <span className="text-[11px] leading-tight whitespace-nowrap truncate max-w-full">
                  {nav.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collection Modal (QR Scan + Manual Entry) */}
      <CollectModal
        isOpen={collectModalOpen}
        onClose={() => setCollectModalOpen(false)}
        availableItems={availableItems}
        initialItem={collectTargetItem}
        profile={profile}
        onCollected={(msg) => {
          fetchAllData();
          showToast(msg);
        }}
      />

      <OfflineIndicator />
    </div>
  );
}
