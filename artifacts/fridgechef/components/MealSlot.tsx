import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { MatchBar } from "@/components/MatchBar";
import { Pill } from "@/components/Pill";
import { useApp } from "@/contexts/AppContext";
import { MEAL_LABELS, MEAL_TIME_HINT, MealType } from "@/constants/recipes";
import { useColors } from "@/hooks/useColors";
import { suggestRecipes, RecipeMatch } from "@/lib/matching";

type Props = {
  mealType: MealType;
};

const MEAL_ICONS: Record<
  MealType,
  React.ComponentProps<typeof Feather>["name"]
> = {
  breakfast: "sunrise",
  morning_snack: "coffee",
  lunch: "sun",
  evening_snack: "cloud",
  dinner: "moon",
};

export function MealSlot({ mealType }: Props) {
  const colors = useColors();
  const {
    diet,
    pantryNames,
    lastCookedMap,
    skipsByMeal,
    todayKey,
    skipRecipe,
    resetSkips,
  } = useApp();
  const [closestIdx, setClosestIdx] = useState(0);

  const skipKey = `${todayKey}:${mealType}`;
  const skippedIds = skipsByMeal[skipKey] ?? [];

  const result = useMemo(() => {
    if (!diet) return null;
    return suggestRecipes({
      diet,
      mealType,
      pantryNames,
      lastCooked: lastCookedMap,
      skippedIds,
    });
  }, [diet, mealType, pantryNames, lastCookedMap, skippedIds]);

  if (!diet || !result) return null;

  const chosen: RecipeMatch | null = result.primary;
  const fallbackList = result.fallbacks;
  const safeClosestIdx =
    fallbackList.length > 0 ? closestIdx % fallbackList.length : 0;
  const bestBelowThreshold: RecipeMatch | null =
    fallbackList[safeClosestIdx] ?? null;
  const hasMoreFallbacks = fallbackList.length > 1;

  const headerIcon = MEAL_ICONS[mealType];

  const openRecipe = (m: RecipeMatch) => {
    if (Platform.OS !== "web") void Haptics.selectionAsync();
    router.push({
      pathname: "/recipe/[id]",
      params: { id: m.recipe.id, mealType },
    });
  };

  const handleSwap = () => {
    if (!chosen) return;
    if (Platform.OS !== "web") void Haptics.selectionAsync();
    void skipRecipe(mealType, chosen.recipe.id);
  };

  const renderChosen = () => {
    if (!chosen) {
      const pct = bestBelowThreshold
        ? Math.round(bestBelowThreshold.matchScore * 100)
        : 0;
      return (
        <View
          style={[
            styles.emptyCardBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather
              name="shopping-bag"
              size={22}
              color={colors.mutedForeground}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Add more items to your groceries
          </Text>
          <Text
            style={[styles.emptyBody, { color: colors.mutedForeground }]}
          >
            Top up your pantry and we'll find a great meal for you.
          </Text>
          {bestBelowThreshold ? (
            <>
              <Pressable
                onPress={() => openRecipe(bestBelowThreshold)}
                style={({ pressed }) => [
                  styles.closestRow,
                  {
                    backgroundColor: colors.cardSoft,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.closestLabel,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Closest match · {pct}%
                  </Text>
                  <Text
                    style={[styles.closestName, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {bestBelowThreshold.recipe.name}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.mutedForeground}
                />
              </Pressable>
              {hasMoreFallbacks ? (
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.selectionAsync().catch(() => {});
                    }
                    setClosestIdx((i) => i + 1);
                  }}
                  style={({ pressed }) => [
                    styles.tryAnotherBtn,
                    {
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Feather
                    name="refresh-cw"
                    size={13}
                    color={colors.foreground}
                  />
                  <Text
                    style={[
                      styles.tryAnotherText,
                      { color: colors.foreground },
                    ]}
                  >
                    Try another
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </View>
      );
    }
    return (
      <Pressable
        onPress={() => openRecipe(chosen)}
        style={({ pressed }) => [
          styles.recipeCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={styles.recipeHead}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text
              style={[styles.recipeName, { color: colors.foreground }]}
              numberOfLines={2}
            >
              {chosen.recipe.name}
            </Text>
            <Text
              style={[styles.recipeBlurb, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {chosen.recipe.blurb}
            </Text>
          </View>
          <View
            style={[
              styles.timeBadge,
              { backgroundColor: colors.muted, borderColor: colors.border },
            ]}
          >
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text
              style={[styles.timeText, { color: colors.mutedForeground }]}
            >
              {chosen.recipe.prepMinutes}m
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          <MatchBar score={chosen.matchScore} />
        </View>

        {chosen.missingRequired.length > 0 ? (
          <View style={styles.missingRow}>
            <Text
              style={[styles.missingLabel, { color: colors.mutedForeground }]}
            >
              You'll need:
            </Text>
            <View style={styles.missingPills}>
              {chosen.missingRequired.slice(0, 4).map((m) => (
                <Pill key={m} label={m} tone="soft" />
              ))}
              {chosen.missingRequired.length > 4 ? (
                <Pill
                  label={`+${chosen.missingRequired.length - 4}`}
                  tone="soft"
                />
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.allSetRow}>
            <Feather name="check-circle" size={14} color={colors.secondary} />
            <Text style={[styles.allSetText, { color: colors.secondary }]}>
              You have everything you need
            </Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleSwap}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                borderColor: colors.border,
                backgroundColor: colors.muted,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Feather
              name="refresh-cw"
              size={14}
              color={colors.foreground}
            />
            <Text style={[styles.actionText, { color: colors.foreground }]}>
              Try another
            </Text>
          </Pressable>
          <Pressable
            onPress={() => openRecipe(chosen)}
            style={({ pressed }) => [
              styles.actionBtnPrimary,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text
              style={[styles.actionTextPrimary, { color: colors.primaryForeground }]}
            >
              View recipe
            </Text>
            <Feather
              name="arrow-right"
              size={14}
              color={colors.primaryForeground}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name={headerIcon} size={16} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {MEAL_LABELS[mealType]}
            </Text>
            <Text
              style={[styles.headerSub, { color: colors.mutedForeground }]}
            >
              {MEAL_TIME_HINT[mealType]}
            </Text>
          </View>
        </View>
        {skippedIds.length > 0 ? (
          <Pressable
            onPress={() => void resetSkips(mealType)}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.resetText, { color: colors.primary }]}>
              Reset
            </Text>
          </Pressable>
        ) : null}
      </View>

      {renderChosen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 22 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  resetText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  recipeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  recipeHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  recipeName: { fontSize: 18, fontFamily: "Inter_700Bold", lineHeight: 22 },
  recipeBlurb: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    lineHeight: 18,
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  timeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  warnBanner: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  warnText: { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
  missingRow: { marginTop: 12 },
  missingLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  missingPills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  allSetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  allSetText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  actionBtnPrimary: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionTextPrimary: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyBox: { paddingVertical: 24, alignItems: "center" },
  emptyCardBox: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  emptyBody: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 19,
  },
  closestRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
  },
  closestLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  closestName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginTop: 2,
  },
  tryAnotherBtn: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  tryAnotherText: { fontSize: 12.5, fontFamily: "Inter_600SemiBold" },
  toggleRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  toggleText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  alternates: { marginTop: 14, gap: 8 },
  altsHeader: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  altPctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 42,
    alignItems: "center",
  },
  altPctText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  alternateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  alternateName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  alternateMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
