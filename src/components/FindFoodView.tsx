import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  APPROVED_CATEGORIES,
  type ApprovedCategory,
  type FoodItem,
} from '../types/pantry';
import { formatDaysUntilExpiry } from '../utils/i18n';
import { FoodImage } from './FoodImage';

interface FindFoodViewProps {
  items: FoodItem[];
  checkedItemIds: string[];
  onChangeCheckedItemIds: (nextIds: string[]) => void;
  onFindMatchingRecipes: (selectedNames: string[]) => void;
  onCollectItem: (item: FoodItem) => void;
  onOpenScanner: () => void;
}

export function FindFoodView({
  items,
  checkedItemIds,
  onChangeCheckedItemIds,
  onFindMatchingRecipes,
  onCollectItem,
  onOpenScanner,
}: FindFoodViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ApprovedCategory>('All');
  const [onlyExpiringSoon, setOnlyExpiringSoon] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (item.status !== 'available' && item.status !== 'reserved') return false;
      if (item.remainingQty <= 0) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (onlyExpiringSoon && formatDaysUntilExpiry(item.expiryDate).days > 2) return false;
      if (q) {
        const hay = `${item.name} ${item.category} ${item.id} ${item.donorBlock}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, searchQuery, selectedCategory, onlyExpiringSoon]);

  const checkedItems = useMemo(
    () => items.filter((item) => checkedItemIds.includes(item.id)),
    [items, checkedItemIds]
  );

  function toggleIngredientCheck(itemId: string) {
    if (checkedItemIds.includes(itemId)) {
      onChangeCheckedItemIds(checkedItemIds.filter((id) => id !== itemId));
    } else {
      onChangeCheckedItemIds([...checkedItemIds, itemId]);
    }
  }

  function handleFindClick() {
    if (checkedItems.length === 0) return;
    onFindMatchingRecipes(checkedItems.map((i) => i.name));
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick QR Scan Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#14241B]">
            Live Community Fridge Inventory
          </h1>
          <p className="mt-1 text-base text-[#4B5B51]">
            Browse fresh items or check a few ingredients below to open the Matching Recipes Catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenScanner}
          className="min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B5E3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#154A2D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <QrCode className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Scan QR or Enter ID</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-[#E2E6DF] bg-white p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="w-5 h-5 text-[#59695F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vegetables, rice, bananas, or item ID..."
              aria-label="Search available food items"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-[#FBFBF8] pl-11 pr-4 text-base text-[#1A241E] focus:border-[#1B5E3A] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyExpiringSoon((v) => !v)}
            aria-pressed={onlyExpiringSoon}
            className={`min-h-[48px] inline-flex items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlyExpiringSoon
                ? 'border-[#B45309] bg-[#FEF3C7] text-[#92400E]'
                : 'border-[#CFD7CC] bg-white text-[#1A241E] hover:bg-[#F4F6F3]'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Use Soon (≤ 2 Days)</span>
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div
          className="flex items-center gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Food categories"
        >
          {(['All', ...APPROVED_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1B5E3A] text-white'
                  : 'bg-[#F2F5F1] text-[#35443B] hover:bg-[#E5ECE4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Checked Ingredients Recipe Action Bar */}
      {checkedItems.length > 0 && (
        <section
          aria-label="Selected ingredients for recipe matching"
          className="rounded-2xl border border-[#BFE0C6] bg-[#F2F7F3] p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#14241B]">
              <BookOpen className="w-4 h-4 text-[#1B5E3A] shrink-0" aria-hidden="true" />
              <span className="tabular-nums">
                {checkedItems.length} fresh {checkedItems.length === 1 ? 'ingredient' : 'ingredients'} checked
              </span>
            </div>
            <p className="text-sm text-[#35443B]">
              {checkedItems.map((i) => i.name).join(' · ')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onChangeCheckedItemIds([])}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border border-[#C5D1C7] bg-white px-4 text-sm font-semibold text-[#35443B] hover:bg-[#F7FAF7] cursor-pointer"
            >
              <X className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Clear</span>
            </button>
            <button
              type="button"
              onClick={handleFindClick}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#1B5E3A] px-5 text-sm font-semibold text-white hover:bg-[#154A2D] transition-colors cursor-pointer"
            >
              <span>Find Matching Recipes</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[#4B5B51]">
        <span className="tabular-nums">
          Showing <strong>{filteredItems.length}</strong> available{' '}
          {filteredItems.length === 1 ? 'item' : 'items'}
        </span>
        <span>Tip: Check items below to cook them together</span>
      </div>

      {/* Inventory Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-10 text-center space-y-3">
          <p className="text-lg font-semibold text-[#14241B]">
            No matching food items right now
          </p>
          <p className="text-sm text-[#4B5B51]">
            Try clearing your search or switching back to “All” categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setOnlyExpiringSoon(false);
            }}
            className="min-h-[44px] px-5 py-2 rounded-xl border border-[#1B5E3A] text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] cursor-pointer"
          >
            Show All Available Food
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const exp = formatDaysUntilExpiry(item.expiryDate);
            const isChecked = checkedItemIds.includes(item.id);
            return (
              <article
                key={item.id}
                className={`rounded-2xl border bg-white overflow-hidden flex flex-col justify-between transition-colors ${
                  isChecked ? 'border-[#1B5E3A] ring-1 ring-[#1B5E3A]' : 'border-[#E2E6DF]'
                }`}
              >
                <div>
                  <div className="aspect-[4/3] w-full bg-[#EEF3EE] overflow-hidden">
                    <FoodImage
                      src={item.imageUrl}
                      category={item.category}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#4B5B51]">
                      <span>{item.category}</span>
                      <span className="font-mono-tabular">{item.id}</span>
                    </div>

                    <h2 className="text-lg font-bold text-[#14241B]">{item.name}</h2>

                    <div className="space-y-1.5 text-sm text-[#35443B]">
                      <div className="flex items-center justify-between">
                        <span>Remaining</span>
                        <strong className="tabular-nums text-[#14241B]">
                          {item.remainingQty} {item.unit}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Use By</span>
                        <span
                          className={`inline-flex items-center gap-1 font-semibold tabular-nums ${
                            exp.urgency === 'soon' ? 'text-[#92400E]' : 'text-[#1B5E3A]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            {exp.label} ({item.expiryDate})
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#4B5B51] pt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-[#1B5E3A]" aria-hidden="true" />
                        <span>{item.storageZone}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#EAECE7] text-xs text-[#4B5B51] space-y-1">
                      <div className="flex items-center gap-1.5 text-[#1B5E3A] font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          Halal-Friendly · {item.inspectedBy || 'Volunteer inspected'}
                        </span>
                      </div>
                      <div>Allergens: {item.allergens || 'None declared'}</div>
                      <div>Shared by {item.donorName} ({item.donorBlock})</div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-2.5">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleIngredientCheck(item.id)}
                    className={`w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors cursor-pointer ${
                      isChecked
                        ? 'border-[#1B5E3A] bg-[#F2F7F3] text-[#1B5E3A]'
                        : 'border-[#CFD7CC] bg-[#FBFBF8] text-[#1A241E] hover:border-[#1B5E3A]'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-[#1B5E3A] border-[#1B5E3A] text-white'
                          : 'bg-white border-[#94A39B]'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
                    </span>
                    <span>{isChecked ? 'Checked for Recipes' : 'Use in Recipe Match'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onCollectItem(item)}
                    className="w-full min-h-[48px] rounded-xl bg-[#1B5E3A] text-white text-sm font-semibold hover:bg-[#154A2D] transition-colors cursor-pointer"
                  >
                    Collect This Item
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
