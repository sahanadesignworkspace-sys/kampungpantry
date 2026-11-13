import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Flame, Users } from 'lucide-react';
import type { Recipe } from '../types/pantry';
import { FoodImage } from './FoodImage';

interface RecipesViewProps {
  recipes: Recipe[];
  onGoToFind: () => void;
}

const DIETARY_FILTERS = [
  'All',
  'Halal-Friendly',
  'Vegetarian',
  'Soft & Easy-to-Chew',
  'Under 20 Mins',
] as const;

export function RecipesView({ recipes, onGoToFind }: RecipesViewProps) {
  const [dietFilter, setDietFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string>(recipes[0]?.id || 'REC-1');

  const visibleRecipes = useMemo(() => {
    if (dietFilter === 'All') return recipes;
    return recipes.filter((r) => r.dietaryTags.includes(dietFilter));
  }, [recipes, dietFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#14241B]">
            Smart Waste-Saving Recipes
          </h1>
          <p className="mt-1 text-base text-[#4B5B51]">
            Simple, comforting meals ranked by ingredients available in the fridge right now — prioritising items to use soon.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToFind}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-[#1B5E3A] text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] whitespace-nowrap shrink-0 cursor-pointer"
        >
          Collect Fridge Ingredients
        </button>
      </div>

      {/* Dietary Filters */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
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
                : 'bg-white border border-[#DCE2DA] text-[#35443B] hover:bg-[#F2F5F1]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Recipe Cards */}
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
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#4B5B51]">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#1B5E3A]" aria-hidden="true" />
                      {totalMins} mins total ({recipe.prepMinutes}m prep · {recipe.cookMinutes}m cook)
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
                        {availableCount} of {recipe.ingredients.length} ingredients in fridge now
                      </span>
                    </div>
                    {expiringCount > 0 && (
                      <div className="flex items-center gap-2 text-xs font-bold text-[#92400E]">
                        <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          Helps rescue use-soon items: {recipe.matchedExpiringSoon?.join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-[#4B5B51]">{recipe.wasteSavedNote}</div>
                  </div>

                  {/* Ingredient List */}
                  <div>
                    <div className="text-xs font-bold text-[#4B5B51] mb-1.5">
                      Key Ingredients
                    </div>
                    <ul className="space-y-1 text-sm text-[#1A241E]">
                      {recipe.ingredients.map((ing) => {
                        const inFridge = recipe.matchedAvailable?.includes(ing);
                        const isExpiring = recipe.matchedExpiringSoon?.includes(ing);
                        return (
                          <li key={ing} className="flex items-center justify-between gap-2">
                            <span>• {ing}</span>
                            {isExpiring ? (
                              <span className="text-xs font-semibold text-[#92400E] shrink-0">
                                Use Soon in Fridge
                              </span>
                            ) : inFridge ? (
                              <span className="text-xs font-semibold text-[#1B5E3A] shrink-0">
                                In Fridge
                              </span>
                            ) : (
                              <span className="text-xs text-[#6B7A70] shrink-0">Pantry staple</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {isOpen && (
                    <div className="pt-3 border-t border-[#EAECE7] space-y-2">
                      <div className="text-xs font-bold text-[#14241B]">
                        Easy Cooking Steps
                      </div>
                      <ol className="space-y-2 text-sm text-[#2C3B32] list-decimal list-inside leading-relaxed">
                        {recipe.steps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? '' : recipe.id)}
                  className="w-full min-h-[44px] rounded-xl border border-[#1B5E3A] bg-white text-sm font-semibold text-[#1B5E3A] hover:bg-[#F2F7F3] transition-colors cursor-pointer"
                >
                  {isOpen ? 'Hide Cooking Steps' : 'Show Cooking Steps'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
