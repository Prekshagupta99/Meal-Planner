import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { MealSlot } from "@/components/MealSlot";
import { useApp } from "@/contexts/AppContext";
import {
  DIET_LABELS,
  MEAL_LABELS,
  MEAL_TYPES,
  MealType,
} from "@/constants/recipes";
import { useColors } from "@/hooks/useColors";

type MealFilter = "all" | MealType;

const MEAL_FILTER_ICONS: Record<
  MealFilter,
  React.ComponentProps<typeof Feather>["name"]
> = {
  all: "grid",
  breakfast: "sunrise",
  morning_snack: "coffee",
  lunch: "sun",
  evening_snack: "cloud",
  dinner: "moon",
};

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ready, diet, pantry, history } = useApp();
  const [mealFilter, setMealFilter] = useState<MealFilter>("all");

  useEffect(() => {
    if (ready && !diet) {
      router.replace("/onboarding");
    }
  }, [ready, diet]);

  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  const cookedToday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return history.filter((h) => h.cookedAt >= start.getTime()).length;
  }, [history]);

  if (!ready || !diet) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? 34 + 84 : insets.bottom + 90;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + 16,
          paddingBottom: bottomInset,
          paddingHorizontal: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
              {todayDate}
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Today's Plan
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/settings")}
            style={({ pressed }) => [
              styles.dietBadge,
              {
                backgroundColor: colors.cardSoft,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.dietDot,
                { backgroundColor: colors.secondary },
              ]}
            />
            <Text style={[styles.dietText, { color: colors.foreground }]}>
              {DIET_LABELS[diet]}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <View style={styles.statBlock}>
            <Text style={[styles.statValue, { color: colors.primaryForeground }]}>
              {pantry.length}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: colors.primaryForeground, opacity: 0.85 },
              ]}
            >
              In your pantry
            </Text>
          </View>
          <View
            style={[styles.divider, { backgroundColor: colors.primaryForeground + "33" }]}
          />
          <View style={styles.statBlock}>
            <Text style={[styles.statValue, { color: colors.primaryForeground }]}>
              {cookedToday}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: colors.primaryForeground, opacity: 0.85 },
              ]}
            >
              Cooked today
            </Text>
          </View>
          <View
            style={[styles.divider, { backgroundColor: colors.primaryForeground + "33" }]}
          />
          <View style={styles.statBlock}>
            <Text style={[styles.statValue, { color: colors.primaryForeground }]}>
              5
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: colors.primaryForeground, opacity: 0.85 },
              ]}
            >
              Meals planned
            </Text>
          </View>
        </View>

        {pantry.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <EmptyState
              icon="archive"
              title="Your pantry is empty"
              subtitle="Add a few groceries and we'll plan a full day of meals around what you have."
            >
              <Pressable
                onPress={() => router.push("/(tabs)/pantry")}
                style={({ pressed }) => [
                  styles.ctaButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Feather name="plus" size={16} color={colors.primaryForeground} />
                <Text
                  style={[
                    styles.ctaText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Add groceries
                </Text>
              </Pressable>
            </EmptyState>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {(["all", ...MEAL_TYPES] as MealFilter[]).map((f) => {
                const active = mealFilter === f;
                const label = f === "all" ? "All meals" : MEAL_LABELS[f];
                return (
                  <Pressable
                    key={f}
                    onPress={() => {
                      setMealFilter(f);
                      if (Platform.OS !== "web") {
                        Haptics.selectionAsync().catch(() => {});
                      }
                    }}
                    style={({ pressed }) => [
                      styles.filterChip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.cardSoft,
                        borderColor: active ? colors.primary : colors.border,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    <Feather
                      name={MEAL_FILTER_ICONS[f]}
                      size={13}
                      color={
                        active
                          ? colors.primaryForeground
                          : colors.mutedForeground
                      }
                    />
                    <Text
                      style={[
                        styles.filterText,
                        {
                          color: active
                            ? colors.primaryForeground
                            : colors.foreground,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.mealsWrap}>
              {MEAL_TYPES.filter(
                (m) => mealFilter === "all" || mealFilter === m,
              ).map((m) => (
                <MealSlot key={m} mealType={m} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 4 },
  dietBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  dietDot: { width: 8, height: 8, borderRadius: 4 },
  dietText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 22,
    marginBottom: 24,
  },
  statBlock: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
    textAlign: "center",
  },
  divider: { width: 1, height: 32 },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 8,
    marginTop: 8,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  ctaText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 14,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: { fontSize: 12.5, fontFamily: "Inter_600SemiBold" },
  mealsWrap: { marginTop: 4 },
});
