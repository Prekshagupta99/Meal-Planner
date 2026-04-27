import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MatchBar } from "@/components/MatchBar";
import { Pill } from "@/components/Pill";
import { useApp } from "@/contexts/AppContext";
import {
  DIET_LABELS,
  MEAL_LABELS,
  MealType,
  getRecipeById,
} from "@/constants/recipes";
import { useColors } from "@/hooks/useColors";
import { evaluateRecipe } from "@/lib/matching";
import { namesMatch } from "@/lib/normalize";

export default function RecipeDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id, mealType } = useLocalSearchParams<{
    id: string;
    mealType?: string;
  }>();
  const recipe = id ? getRecipeById(id) : undefined;
  const { pantryNames, addPantryItems, cookRecipe } = useApp();

  const evalRes = useMemo(
    () => (recipe ? evaluateRecipe(recipe, pantryNames) : null),
    [recipe, pantryNames],
  );

  if (!recipe || !evalRes) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
          Recipe not found.
        </Text>
      </View>
    );
  }

  const ingredientsWithStatus = recipe.ingredients.map((ing) => ({
    ing,
    have: pantryNames.some((p) => namesMatch(p, ing.name)),
  }));

  const missing = ingredientsWithStatus.filter((i) => !i.have && !i.ing.optional);

  const handleAddMissing = () => {
    if (missing.length === 0) return;
    if (Platform.OS !== "web")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void addPantryItems(missing.map((m) => m.ing.name));
  };

  const handleCook = async () => {
    const mt = (mealType as MealType) ?? recipe.mealType;
    if (Platform.OS !== "web")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await cookRecipe(recipe.id, recipe.name, mt);
    router.back();
  };

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + 50,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.metaRow}>
          <Pill
            label={MEAL_LABELS[(mealType as MealType) ?? recipe.mealType]}
            tone="primary"
            icon="clock"
          />
          <Pill label={DIET_LABELS[recipe.diet]} tone="secondary" />
          {recipe.cuisine ? <Pill label={recipe.cuisine} tone="soft" /> : null}
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>
          {recipe.name}
        </Text>
        <Text style={[styles.blurb, { color: colors.mutedForeground }]}>
          {recipe.blurb}
        </Text>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.stat,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Time
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {recipe.prepMinutes} min
            </Text>
          </View>
          <View
            style={[
              styles.stat,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="list" size={14} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Steps
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {recipe.steps.length}
            </Text>
          </View>
          <View
            style={[
              styles.stat,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
              Items
            </Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {recipe.ingredients.length}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.matchCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <MatchBar score={evalRes.matchScore} />
        </View>

        <Text style={[styles.section, { color: colors.foreground }]}>
          Ingredients
        </Text>
        <View
          style={[
            styles.listCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {ingredientsWithStatus.map((i, idx) => (
            <View
              key={i.ing.name + idx}
              style={[
                styles.ingRow,
                idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.ingCheck,
                  {
                    backgroundColor: i.have
                      ? colors.secondary
                      : colors.muted,
                    borderColor: i.have ? colors.secondary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={i.have ? "check" : i.ing.optional ? "minus" : "x"}
                  size={12}
                  color={i.have ? colors.secondaryForeground : colors.mutedForeground}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.ingName,
                    {
                      color: i.have ? colors.foreground : colors.mutedForeground,
                      textDecorationLine: i.have ? "none" : "none",
                    },
                  ]}
                >
                  {i.ing.name}
                  {i.ing.optional ? (
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontFamily: "Inter_400Regular",
                      }}
                    >
                      {"  · optional"}
                    </Text>
                  ) : null}
                </Text>
                {i.ing.qty ? (
                  <Text
                    style={[styles.ingQty, { color: colors.mutedForeground }]}
                  >
                    {i.ing.qty}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {missing.length > 0 ? (
          <Pressable
            onPress={handleAddMissing}
            style={({ pressed }) => [
              styles.addMissing,
              {
                borderColor: colors.primary,
                backgroundColor: colors.background,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="plus-circle" size={16} color={colors.primary} />
            <Text style={[styles.addMissingText, { color: colors.primary }]}>
              Add {missing.length} missing item{missing.length === 1 ? "" : "s"} to pantry
            </Text>
          </Pressable>
        ) : null}

        <Text style={[styles.section, { color: colors.foreground }]}>
          Steps
        </Text>
        <View style={{ gap: 10 }}>
          {recipe.steps.map((s, idx) => (
            <View
              key={idx}
              style={[
                styles.stepCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.stepNumber,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepNumberText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {idx + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, { color: colors.foreground }]}>
                {s}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 14,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={handleCook}
          style={({ pressed }) => [
            styles.cookBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Feather name="check-circle" size={18} color={colors.primaryForeground} />
          <Text
            style={[styles.cookText, { color: colors.primaryForeground }]}
          >
            I cooked this
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 12, lineHeight: 36 },
  blurb: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 8, lineHeight: 22 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: { fontSize: 14, fontFamily: "Inter_700Bold" },
  matchCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  section: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 26, marginBottom: 12 },
  listCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ingCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ingName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  ingQty: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  addMissing: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addMissingText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  stepCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  cookBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  cookText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
