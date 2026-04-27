# FridgeChef

**Plan every meal of the day around what's actually in your fridge.**

FridgeChef is a mobile app that suggests breakfast, snacks, lunch, and dinner based on your diet preference and the ingredients you already have. It only recommends meals when your pantry covers **80% or more** of what a recipe needs — no more "what do I cook tonight?" guesswork, and no more shopping trips just to make a single dish.

---

## What it does

- **Daily meal plan** — five slots (breakfast, morning snack, lunch, evening snack, dinner) personalized to your diet and pantry every day.
- **Smart 80% match rule** — recipes are only suggested when you have at least 80% of the required ingredients. Anything below that is hidden so you don't see meals you can't realistically make.
- **Multiple options per meal** — the best match shows up as the primary suggestion, with up to 6 more options listed underneath, each tagged with its match percentage.
- **"Try another"** — when nothing meets the threshold, you can cycle through the closest matches (up to 10) to see what you're closest to making.
- **Diet support** — vegan, vegetarian, eggetarian, and non-vegetarian filters baked into the recipe engine.
- **Pantry management** — add and remove ingredients in seconds; everything is saved locally on the device.
- **Smart shopping list** — automatically ranks the ingredients that would unlock the most new meals if you bought them. Tap to add to your pantry one by one or in bulk.
- **History** — every meal you cook is logged. Recipes you've made in the last 3 days are skipped so suggestions stay fresh.
- **Meal type filter** — quickly focus on just breakfast or just dinner with one tap.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | **Expo (React Native)** |
| Language | **TypeScript** |
| Navigation | **Expo Router** (file-based routing) |
| Storage | **AsyncStorage** (local, on-device) |
| Icons | **Feather Icons** + **SF Symbols** (iOS) |
| Typography | **Inter** font family |
| Feedback | **Expo Haptics** |
| Project setup | **pnpm** monorepo (workspaces) |

The app is **fully offline** — no backend, no accounts, no servers.

---

## Project structure

```
artifacts/fridgechef/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx       # Today screen (daily meal plan)
│   │   ├── pantry.tsx      # Pantry management
│   │   ├── shopping.tsx    # Smart shopping list
│   │   ├── history.tsx     # Past meals
│   │   └── settings.tsx    # Diet & app settings
│   ├── recipe/[id].tsx     # Recipe detail page
│   └── onboarding.tsx      # First-time diet selection
├── components/
│   ├── MealSlot.tsx        # The per-meal suggestion card
│   ├── MatchBar.tsx        # Visual match-percentage bar
│   ├── EmptyState.tsx
│   └── Pill.tsx
├── constants/
│   ├── recipes.ts          # ~35 seeded recipes
│   └── colors.ts           # Warm cream / terracotta / sage palette
├── contexts/
│   └── AppContext.tsx      # Global state (pantry, history, diet)
├── lib/
│   ├── matching.ts         # 80% match algorithm + ranking
│   ├── shopping.ts         # Smart shopping list logic
│   └── normalize.ts        # Ingredient name normalization
└── hooks/
    └── useColors.ts
```

---

## How the matching works

For each meal slot, FridgeChef:

1. Filters all recipes to those that match the user's **diet**.
2. Excludes any recipe **cooked in the last 3 days**.
3. Computes a **match score** = `matched_required / total_required` ingredients.
4. Keeps only recipes scoring **≥ 0.80** (the 80% threshold).
5. Ranks remaining recipes with `0.7 × match + 0.25 × recency + 0.15 × novelty`.
6. Returns the top recipe as the **primary**, the next up to 6 as **alternates**, and the best below-threshold options as **fallbacks** (used only for the "Try another" cycle).

The smart shopping list runs the inverse: for every missing ingredient, it simulates "what if I had this?" and ranks ingredients by **how many extra recipes would cross the 80% line**.

---

## Running locally

This is part of a pnpm monorepo. From the project root:

```bash
pnpm install
pnpm --filter @workspace/fridgechef run dev
```

The Expo dev server starts and prints a QR code. Scan it with **Expo Go** on iPhone or Android to run the app on your device. The web preview also runs on the port shown in the console.

### Useful commands

```bash
pnpm --filter @workspace/fridgechef run dev         # Start Expo dev server
pnpm --filter @workspace/fridgechef run typecheck   # TypeScript validation
```

---

## Roadmap ideas

- Cloud sync so pantry & history follow you across phones
- Custom recipe import (paste a URL or write your own)
- Auto-generated weekly shopping list export
- Barcode scanning to add pantry items via camera
- Meal-time push notifications
- AI-generated recipes when seeded recipes don't fit

---

## Free ways to get this on iPhone

- **Expo Go** — install the free Expo Go app from the App Store, scan the QR code from the dev server, and the app runs instantly. No Apple Developer account needed.
- **EAS Development Build** — sign in with a free Expo account, run `eas build --profile development --platform ios`, and install a standalone build via TestFlight-style sideloading. Free tier covers occasional builds.
- **App Store distribution** requires the paid Apple Developer Program ($99/year).

---

## License

MIT — feel free to fork, modify, and ship your own version.
