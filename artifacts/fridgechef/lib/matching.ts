import {
  Diet,
  MealType,
  Recipe,
  RECIPES,
  dietAllows,
} from "@/constants/recipes";
import { isTrivialIngredient, namesMatch } from "@/lib/normalize";

export type RecipeMatch = {
  recipe: Recipe;
  matchedRequired: string[];
  missingRequired: string[];
  matchedOptional: string[];
  matchScore: number; // fraction of required ingredients available (0..1)
  meetsThreshold: boolean;
};

export const MATCH_THRESHOLD = 0.8;

export function evaluateRecipe(
  recipe: Recipe,
  pantryNames: string[],
): RecipeMatch {
  const required = recipe.ingredients.filter(
    (i) => !i.optional && !isTrivialIngredient(i.name),
  );
  const optional = recipe.ingredients.filter(
    (i) => i.optional || isTrivialIngredient(i.name),
  );

  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];
  for (const ing of required) {
    const hit = pantryNames.some((p) => namesMatch(p, ing.name));
    if (hit) matchedRequired.push(ing.name);
    else missingRequired.push(ing.name);
  }

  const matchedOptional: string[] = [];
  for (const ing of optional) {
    const hit = pantryNames.some((p) => namesMatch(p, ing.name));
    if (hit) matchedOptional.push(ing.name);
  }

  const matchScore =
    required.length === 0 ? 1 : matchedRequired.length / required.length;

  return {
    recipe,
    matchedRequired,
    missingRequired,
    matchedOptional,
    matchScore,
    meetsThreshold: matchScore >= MATCH_THRESHOLD,
  };
}

export type SuggestionContext = {
  diet: Diet;
  mealType: MealType;
  pantryNames: string[];
  /** map of recipeId -> last cooked timestamp (ms) */
  lastCooked: Record<string, number>;
  /** recipe ids the user manually skipped this session */
  skippedIds?: string[];
  /** start-of-current-week timestamp (ms). Recipes cooked at/after this are excluded. */
  weekStart?: number;
};

/** Returns ms timestamp of Monday 00:00 of the week that contains `d`. */
export function getWeekStart(d: Date = new Date()): number {
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day + 6) % 7; // days since Monday
  const mon = new Date(d);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(mon.getDate() - diff);
  return mon.getTime();
}

export function suggestRecipes(ctx: SuggestionContext): {
  primary: RecipeMatch | null;
  alternates: RecipeMatch[];
  fallbacks: RecipeMatch[];
} {
  const skipped = new Set(ctx.skippedIds ?? []);
  const now = Date.now();
  const weekStart = ctx.weekStart ?? getWeekStart();

  const candidates = RECIPES.filter(
    (r) =>
      r.mealType === ctx.mealType &&
      dietAllows(ctx.diet, r.diet) &&
      !skipped.has(r.id),
  );

  const evaluated = candidates.map((r) => evaluateRecipe(r, ctx.pantryNames));

  const score = (m: RecipeMatch) => {
    const last = ctx.lastCooked[m.recipe.id] ?? 0;
    const daysSince = last === 0 ? 30 : (now - last) / (24 * 60 * 60 * 1000);
    const recencyBoost = Math.min(daysSince, 14) / 14; // 0..1
    const noveltyBonus = last === 0 ? 0.15 : 0;
    return m.matchScore * 0.7 + recencyBoost * 0.25 + noveltyBonus;
  };

  // Exclude recipes already cooked any day in the current calendar week
  const cookedThisWeek = (id: string) =>
    (ctx.lastCooked[id] ?? 0) >= weekStart;

  const eligible = evaluated
    .filter((m) => !cookedThisWeek(m.recipe.id))
    .filter((m) => m.meetsThreshold)
    .sort((a, b) => score(b) - score(a));

  const fallbackPool = evaluated
    .filter((m) => !cookedThisWeek(m.recipe.id))
    .filter((m) => !m.meetsThreshold)
    .sort((a, b) => b.matchScore - a.matchScore || score(b) - score(a));

  const primary = eligible[0] ?? null;
  // Surface up to 12 in-threshold alternates so the user can browse on demand
  const alternates = eligible.slice(1, 13);
  const fallbacks = fallbackPool.slice(0, 10);

  return { primary, alternates, fallbacks };
}
