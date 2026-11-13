import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Search,
  Users,
} from 'lucide-react';
import type { Recipe } from '../types/pantry';
import { FoodImage } from './FoodImage';

interface RecipesViewProps {
  recipes: Recipe[];
  mealCategories: Array<{ idCategory: string; strCategory: string }>;
  mealDbConfigured: boolean;
  recipeSource: 'themealdb' | 'local-fallback';
  queriedIngredients: string[];
  selectedIngredients: string[];
  loadingRecipes: boolean;
  onSearchRecipes: (opts: { q?: string; ingredient?: string; category?: string }) => void;
  onGoToFind: () => void;
}

const DIETARY_FILTERS = [
  'All',
  'Halal-Friendly',
  'Vegetarian',
  'Soft & Easy-to-Chew',
  'Under 20 Mins',
] as const;

const INGREDIENT_SHORTCUTS = [
  { label: 'Auto-Match Fridge', value: '' },
  { label: 'Eggs', value: 'eggs' },
  { label: 'Rice', value: 'rice' },
  { label: 'Greens / Spinach', value: 'spinach' },
  { label: 'Banana', value: 'banana' },
  { label: 'Lentils', value: 'lentils' },
  { label: 'Bread', value: 'bread' },
];

export function RecipesView({
  recipes,
  mealCategories,
  mealDbConfigured,
  recipeSource,
  queriedIngredients,
  selectedIngredients,
  loadingRecipes,
  onSearchRecipes,
  onGoToFind,
}: RecipesViewProps) {
  const [dietFilter, setDietFilter] = useState<string>('All');
  const [searchInput, setSearchInput] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [expandedId, setExpandedId] = useState<string>('');

  const visibleRecipes = useMemo(() => {
    if (dietFilter === 'All') return recipes;
    return recipes.filter((r) => r.dietaryTags.includes(dietFilter));
  }, [recipes, dietFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActiveIngredient('');
    setActiveCategory('');
    onSearchRecipes({ q: searchInput.trim() });
  }

  function handleIngredientClick(ing: string) {
    setActiveIngredient(ing);
    setActiveCategory('');
    setSearchInput('');
    onSearchRecipes(ing ? { ingredient: ing } : {});
  }

  function handleCategoryClick(cat: string) {
    setActiveCategory(cat);
    setActiveIngredient('');
    setSearchInput('');
    onSearchRecipes(cat ? { category: cat } : {});
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#14241B]">
            {selectedIngredients.length > 0
              ? 'Matching Recipes Catalogue'
              : 'Smart Waste-Saving Recipes'}
          </h1>
          <p className="mt-1 text-base text-[#4B5B51]">
            {recipeSource === 'themealdb'
              ? `Powered by TheMealDB & screened for Halal-friendly guidelines${
                  queriedIngredients.length > 0
                    ? ` — matched to (${queriedIngredients.join(', ')})`
                    : ''
                }.`
              : mealDbConfigured
                ? 'Showing saved pantry recipes prioritising ingredients available in the fridge.'
                : 'Showing local pantry matches. Add THEMEALDB_API_KEY in environment variables to enable live TheMealDB results.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToFind}
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1B5E3A] text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{selectedIngredients.length > 0 ? 'Back to Find Food' : 'Collect Fridge Ingredients'}</span>
        </button>
      </div>

      {/* Selected Ingredients Banner when redirected from Find Food */}
      {selectedIngredients.length > 0 && (
        <div className="rounded-2xl border border-[#BFE0C6] bg-[#F2F7F3] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-bold text-[#14241B]">
              Matched to your {selectedIngredients.length} checked{' '}
              {selectedIngredients.length === 1 ? 'ingredient' : 'ingredients'}:
            </div>
            <div className="text-sm text-[#1B5E3A] font-medium">
              {selectedIngredients.join(' · ')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleIngredientClick('')}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-[#C5D1C7] bg-white text-sm font-semibold text-[#1A241E] hover:bg-[#F7FAF7] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Show All Fridge Recipes
          </button>
        </div>
      )}

      {/* Search & Live Ingredient Selector */}
      <div className="rounded-2xl border border-[#E2E6DF] bg-white p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="w-5 h-5 text-[#59695F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search TheMealDB dishes (e.g. fried rice, omelette, dal)..."
              aria-label="Search recipes on TheMealDB"
              className="w-full min-h-[48px] rounded-xl border border-[#CFD7CC] bg-[#FBFBF8] pl-11 pr-4 text-base text-[#1A241E] focus:border-[#1B5E3A] focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] px-5 rounded-xl bg-[#1B5E3A] text-white text-sm font-semibold hover:bg-[#154A2D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Search Recipes
          </button>
        </form>

        {/* Quick Fridge Ingredient Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {INGREDIENT_SHORTCUTS.map((item) => {
            const active = activeIngredient === item.value && !activeCategory && !searchInput;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleIngredientClick(item.value)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-[#1B5E3A] bg-[#F2F7F3] text-[#1B5E3A]'
                    : 'border-[#DCE2DA] bg-[#FBFBF8] text-[#35443B] hover:border-[#1B5E3A]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Live TheMealDB Categories (from /api/categories) */}
        {mealCategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-[#EAECE7]">
            <span className="text-xs font-semibold text-[#59695F] whitespace-nowrap shrink-0">
              MealDB Categories:
            </span>
            {mealCategories.slice(0, 8).map((cat) => (
              <button
                key={cat.idCategory}
                type="button"
                onClick={() => handleCategoryClick(cat.strCategory)}
                className={`min-h-[38px] px-3 py-1 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat.strCategory
                    ? 'border-[#1B5E3A] bg-[#1B5E3A] text-white'
                    : 'border-[#DCE2DA] bg-white text-[#35443B] hover:border-[#1B5E3A]'
                }`}
              >
                {cat.strCategory}
              </button>
            ))}
          </div>
        )}

        {/* Dietary Filters */}
        <div
          className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-[#EAECE7]"
          role="tablist"
          aria-label="Dietary preferences"
        >
          {DIETARY_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              role="tab"
              aria-selected={dietFilter === tag}
              onClick={() => setDietFilter(tag)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                dietFilter === tag
                  ? 'bg-[#1B5E3A] text-white'
                  : 'bg-[#F2F5F1] text-[#35443B] hover:bg-[#E5ECE4]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Results */}
      {loadingRecipes ? (
        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-10 text-center text-base font-medium text-[#4B5B51]">
          Finding Halal-friendly recipes from TheMealDB...
        </div>
      ) : visibleRecipes.length === 0 ? (
        <div className="rounded-2xl border border-[#E2E6DF] bg-white p-10 text-center space-y-3">
          <p className="text-lg font-semibold text-[#14241B]">
            No matching recipes found for this filter
          </p>
          <p className="text-sm text-[#4B5B51]">
            Try switching back to Auto-Match Fridge or selecting All dietary options.
          </p>
          <button
            type="button"
            onClick={() => {
              setDietFilter('All');
              handleIngredientClick('');
            }}
            className="min-h-[44px] px-5 py-2 rounded-xl border border-[#1B5E3A] text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] cursor-pointer"
          >
            Reset Recipe Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visibleRecipes.map((recipe) => {
            const isOpen = expandedId === recipe.id;
            const totalMins = recipe.prepMinutes + recipe.cookMinutes;
            const expiringCount = recipe.matchedExpiringSoon?.length || 0;
            const availableCount = recipe.matchedAvailable?.length || 0;

            return (
              <article
                key={recipe.id}
                className="rounded-2xl border border-[#E2E6DF] bg-white overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] w-full bg-[#EEF3EE] overflow-hidden">
                  <FoodImage
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#4B5B51]">
                      <span>{recipe.source || 'TheMealDB'}</span>
                      {recipe.cuisine && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{recipe.cuisine}</span>
                        </>
                      )}
                      {recipe.category && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{recipe.category}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#1B5E3A]" aria-hidden="true" />
                        {totalMins} mins
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Users className="w-3.5 h-3.5 text-[#1B5E3A]" aria-hidden="true" />
                        Serves {recipe.servings}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#14241B]">{recipe.title}</h2>
                    <p className="text-sm text-[#35443B] leading-relaxed">{recipe.description}</p>

                    {/* Fridge Ingredient Match Callout */}
                    <div className="rounded-xl border border-[#DCE2DA] bg-[#F7FAF7] p-3.5 space-y-1.5 text-sm">
                      <div className="flex items-center gap-2 font-semibold text-[#1B5E3A]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          {availableCount > 0
                            ? `Uses ${availableCount} ingredient(s) in fridge: ${recipe.matchedAvailable?.join(', ')}`
                            : 'Halal-friendly recipe matching pantry staples'}
                        </span>
                      </div>
                      {expiringCount > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
                          <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>
                            Prioritises use-soon items: {recipe.matchedExpiringSoon?.join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-[#4B5B51]">{recipe.wasteSavedNote}</div>
                    </div>

                    {/* Ingredient List */}
                    <div>
                      <div className="text-xs font-bold text-[#4B5B51] mb-1.5">
                        Ingredients ({recipe.ingredients.length})
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#1A241E]">
                        {(isOpen ? recipe.ingredients : recipe.ingredients.slice(0, 6)).map(
                          (ing, idx) => (
                            <li key={`${ing}-${idx}`} className="truncate">
                              • {ing}
                            </li>
                          )
                        )}
                      </ul>
                      {!isOpen && recipe.ingredients.length > 6 && (
                        <div className="mt-1 text-xs text-[#59695F]">
                          + {recipe.ingredients.length - 6} more ingredients inside instructions
                        </div>
                      )}
                    </div>

                    {isOpen && (
                      <div className="pt-3 border-t border-[#EAECE7] space-y-3">
                        <div className="text-xs font-bold text-[#14241B]">
                          Cooking Steps
                        </div>
                        <ol className="space-y-2 text-sm text-[#2C3B32] list-decimal list-inside leading-relaxed">
                          {recipe.steps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                        {recipe.youtubeUrl && (
                          <a
                            href={recipe.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3A] hover:underline pt-1"
                          >
                            <span>Watch video guide on YouTube</span>
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isOpen ? '' : recipe.id)}
                    className="w-full min-h-[44px] rounded-xl border border-[#1B5E3A] bg-white text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] transition-colors cursor-pointer"
                  >
                    {isOpen ? 'Hide Cooking Steps' : 'Show Full Recipe & Steps'}
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
