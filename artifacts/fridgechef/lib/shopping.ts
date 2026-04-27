import {
  Diet,
  RECIPES,
  Recipe,
  dietAllows,
} from "@/constants/recipes";
import { evaluateRecipe, MATCH_THRESHOLD } from "@/lib/matching";
import { isTrivialIngredient, namesMatch, normalizeName } from "@/lib/normalize";

export type ShoppingSuggestion = {
  name: string;
  unlocks: number;
  unlocksRecipes: Recipe[];
  appearsIn: number;
};

export function buildShoppingList(
  diet: Diet,
  pantryNames: string[],
): ShoppingSuggestion[] {
  const allowed = RECIPES.filter((r) => dietAllows(diet, r.diet));

  const evaluated = allowed.map((r) => ({
    recipe: r,
    eval: evaluateRecipe(r, pantryNames),
  }));

  const buckets = new Map<
    string,
    {
      display: string;
      appearsIn: Set<string>;
      unlocksRecipes: Recipe[];
    }
  >();

  const ensure = (display: string) => {
    const key = normalizeName(display);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        display: prettify(display),
        appearsIn: new Set(),
        unlocksRecipes: [],
      };
      buckets.set(key, bucket);
    }
    return bucket;
  };

  for (const { recipe, eval: ev } of evaluated) {
    if (ev.meetsThreshold) continue;

    for (const missingName of ev.missingRequired) {
      if (isTrivialIngredient(missingName)) continue;
      const bucket = ensure(missingName);
      bucket.appearsIn.add(recipe.id);

      const simulated = pantryNames.concat([missingName]);
      const newScore = evaluateRecipe(recipe, simulated).matchScore;
      if (
        newScore >= MATCH_THRESHOLD &&
        !bucket.unlocksRecipes.some((r) => r.id === recipe.id)
      ) {
        bucket.unlocksRecipes.push(recipe);
      }
    }
  }

  const list: ShoppingSuggestion[] = Array.from(buckets.values()).map((b) => ({
    name: b.display,
    unlocks: b.unlocksRecipes.length,
    unlocksRecipes: b.unlocksRecipes,
    appearsIn: b.appearsIn.size,
  }));

  list.sort((a, b) => {
    if (b.unlocks !== a.unlocks) return b.unlocks - a.unlocks;
    return b.appearsIn - a.appearsIn;
  });

  return dedupeSimilar(list).slice(0, 20);
}

function prettify(name: string): string {
  const n = normalizeName(name);
  return n.replace(/\b\w/g, (c) => c.toUpperCase());
}

function dedupeSimilar(list: ShoppingSuggestion[]): ShoppingSuggestion[] {
  const out: ShoppingSuggestion[] = [];
  for (const item of list) {
    const dupe = out.find((o) => namesMatch(o.name, item.name));
    if (dupe) {
      if (item.unlocks > dupe.unlocks) {
        dupe.unlocks = item.unlocks;
        dupe.unlocksRecipes = item.unlocksRecipes;
      }
      dupe.appearsIn = Math.max(dupe.appearsIn, item.appearsIn);
    } else {
      out.push({ ...item });
    }
  }
  return out;
}
