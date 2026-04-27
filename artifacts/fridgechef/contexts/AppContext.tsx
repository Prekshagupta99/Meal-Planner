import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Diet, MealType } from "@/constants/recipes";
import { normalizeName } from "@/lib/normalize";

export type PantryItem = {
  id: string;
  name: string;
  addedAt: number;
};

export type HistoryEntry = {
  id: string;
  recipeId: string;
  recipeName: string;
  mealType: MealType;
  cookedAt: number;
};

type State = {
  ready: boolean;
  diet: Diet | null;
  pantry: PantryItem[];
  history: HistoryEntry[];
  skipsByMeal: Record<string, string[]>; // key: `${dateKey}:${mealType}` -> recipeIds skipped
};

type ContextValue = State & {
  setDiet: (d: Diet) => Promise<void>;
  addPantryItem: (name: string) => Promise<void>;
  addPantryItems: (names: string[]) => Promise<void>;
  removePantryItem: (id: string) => Promise<void>;
  clearPantry: () => Promise<void>;
  cookRecipe: (
    recipeId: string,
    recipeName: string,
    mealType: MealType,
  ) => Promise<void>;
  removeHistoryEntry: (id: string) => Promise<void>;
  skipRecipe: (mealType: MealType, recipeId: string) => Promise<void>;
  resetSkips: (mealType?: MealType) => Promise<void>;
  resetAll: () => Promise<void>;
  pantryNames: string[];
  lastCookedMap: Record<string, number>;
  todayKey: string;
};

const STORAGE_KEY = "@fridgechef/state/v1";

const AppContext = createContext<ContextValue | null>(null);

export function getDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({
    ready: false,
    diet: null,
    pantry: [],
    history: [],
    skipsByMeal: {},
  });

  // Hydrate
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({
            ready: true,
            diet: parsed.diet ?? null,
            pantry: Array.isArray(parsed.pantry) ? parsed.pantry : [],
            history: Array.isArray(parsed.history) ? parsed.history : [],
            skipsByMeal:
              parsed.skipsByMeal && typeof parsed.skipsByMeal === "object"
                ? parsed.skipsByMeal
                : {},
          });
        } else {
          setState((s) => ({ ...s, ready: true }));
        }
      } catch {
        setState((s) => ({ ...s, ready: true }));
      }
    })();
  }, []);

  // Persist whenever state (excluding ready flag) changes
  useEffect(() => {
    if (!state.ready) return;
    const { ready: _ready, ...rest } = state;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, [state]);

  const setDiet = useCallback(async (d: Diet) => {
    setState((s) => ({ ...s, diet: d }));
  }, []);

  const addPantryItem = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((s) => {
      const exists = s.pantry.some(
        (p) => normalizeName(p.name) === normalizeName(trimmed),
      );
      if (exists) return s;
      const item: PantryItem = {
        id: genId(),
        name: trimmed,
        addedAt: Date.now(),
      };
      return { ...s, pantry: [item, ...s.pantry] };
    });
  }, []);

  const addPantryItems = useCallback(async (names: string[]) => {
    setState((s) => {
      const existing = new Set(s.pantry.map((p) => normalizeName(p.name)));
      const additions: PantryItem[] = [];
      for (const n of names) {
        const trimmed = n.trim();
        if (!trimmed) continue;
        const key = normalizeName(trimmed);
        if (existing.has(key)) continue;
        existing.add(key);
        additions.push({
          id: genId(),
          name: trimmed,
          addedAt: Date.now(),
        });
      }
      if (additions.length === 0) return s;
      return { ...s, pantry: [...additions, ...s.pantry] };
    });
  }, []);

  const removePantryItem = useCallback(async (id: string) => {
    setState((s) => ({ ...s, pantry: s.pantry.filter((p) => p.id !== id) }));
  }, []);

  const clearPantry = useCallback(async () => {
    setState((s) => ({ ...s, pantry: [] }));
  }, []);

  const cookRecipe = useCallback(
    async (recipeId: string, recipeName: string, mealType: MealType) => {
      setState((s) => {
        const entry: HistoryEntry = {
          id: genId(),
          recipeId,
          recipeName,
          mealType,
          cookedAt: Date.now(),
        };
        return { ...s, history: [entry, ...s.history].slice(0, 200) };
      });
    },
    [],
  );

  const removeHistoryEntry = useCallback(async (id: string) => {
    setState((s) => ({
      ...s,
      history: s.history.filter((h) => h.id !== id),
    }));
  }, []);

  const skipRecipe = useCallback(
    async (mealType: MealType, recipeId: string) => {
      const key = `${getDateKey()}:${mealType}`;
      setState((s) => {
        const cur = s.skipsByMeal[key] ?? [];
        if (cur.includes(recipeId)) return s;
        return {
          ...s,
          skipsByMeal: { ...s.skipsByMeal, [key]: [...cur, recipeId] },
        };
      });
    },
    [],
  );

  const resetSkips = useCallback(async (mealType?: MealType) => {
    setState((s) => {
      if (mealType) {
        const key = `${getDateKey()}:${mealType}`;
        const next = { ...s.skipsByMeal };
        delete next[key];
        return { ...s, skipsByMeal: next };
      }
      return { ...s, skipsByMeal: {} };
    });
  }, []);

  const resetAll = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({
      ready: true,
      diet: null,
      pantry: [],
      history: [],
      skipsByMeal: {},
    });
  }, []);

  const pantryNames = useMemo(
    () => state.pantry.map((p) => p.name),
    [state.pantry],
  );

  const lastCookedMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of state.history) {
      const cur = map[h.recipeId];
      if (cur === undefined || h.cookedAt > cur) map[h.recipeId] = h.cookedAt;
    }
    return map;
  }, [state.history]);

  const todayKey = useMemo(() => getDateKey(), []);

  const value: ContextValue = {
    ...state,
    setDiet,
    addPantryItem,
    addPantryItems,
    removePantryItem,
    clearPantry,
    cookRecipe,
    removeHistoryEntry,
    skipRecipe,
    resetSkips,
    resetAll,
    pantryNames,
    lastCookedMap,
    todayKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): ContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside <AppProvider>");
  }
  return ctx;
}
