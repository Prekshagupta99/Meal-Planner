# FridgeChef

A friendly Expo mobile app that plans your day's meals — breakfast, morning snack, lunch, evening snack, and dinner — based on your diet preference and what's actually in your fridge.

## Core idea

- Pick a diet (vegan / vegetarian / eggetarian / non-vegetarian).
- Add what you have to your pantry (quick-add chips by category, or free text).
- The app suggests a recipe for each meal slot when you have ≥80% of the required ingredients (and haven't cooked it in the last 3 days). Otherwise it shows the best fallback from what you have, clearly labeled.
- Tap "I cooked this" on a recipe to log it to history; that recipe is then skipped for 3 days.

## Architecture

- **Single mobile artifact** at `artifacts/fridgechef/` (Expo + Expo Router).
- **Local-only** — no backend. State persists with AsyncStorage under key `@fridgechef/state/v1`.
- **Tabs**: Today / Pantry / History / Settings. NativeTabs (iOS 26 liquid glass) with classic Tabs fallback.
- **Onboarding** — modal at first launch to pick diet.
- **Recipes** — ~35 hand-curated recipes in `constants/recipes.ts` covering all 5 meal types and all 4 diets. Diet hierarchy in `dietAllows` (vegan ⊂ vegetarian ⊂ eggetarian ⊂ non-vegetarian).
- **Matching** in `lib/matching.ts`: required-ingredient match score (trivial items like salt/water/oil ignored), threshold 0.8, ranks by `match * 0.7 + recency * 0.25 + novelty * 0.15`.
- **Name matching** in `lib/normalize.ts`: lowercase + simple singularize + substring check.

## Design

- Warm kitchen palette: cream `#FAF6EE`, terracotta `#C9603A` (primary), sage `#6B8E5A` (secondary), butter `#F1C669` accent.
- Inter font (400/500/600/700).
- Feather icons throughout (no emojis).
- Light mode only.

## Key files

- `app/_layout.tsx` — providers + Stack
- `app/(tabs)/_layout.tsx` — NativeTabs / classic Tabs
- `app/(tabs)/index.tsx` — Today's plan with 5 meal slots
- `app/(tabs)/pantry.tsx` — Pantry with quick-add by category
- `app/(tabs)/history.tsx` — Cooked log grouped by day
- `app/(tabs)/settings.tsx` — Diet picker + reset
- `app/onboarding.tsx` — First-run diet picker
- `app/recipe/[id].tsx` — Recipe detail with cook button + add-missing-to-pantry
- `contexts/AppContext.tsx` — diet, pantry, history, skips (AsyncStorage)
- `constants/recipes.ts` — recipe catalog + diet rules + meal-type metadata
- `constants/commonGroceries.ts` — quick-add list grouped by category
- `lib/matching.ts` — recipe scoring + suggestion engine
- `lib/normalize.ts` — ingredient name matching helpers
- `components/MealSlot.tsx` — per-meal card with swap / view actions
- `components/DietPickerSheet.tsx` — reusable diet list
- `components/MatchBar.tsx`, `Pill.tsx`, `EmptyState.tsx`

## User preferences

- Free tier: single mobile artifact only. Do not introduce a web sibling or backend services.
