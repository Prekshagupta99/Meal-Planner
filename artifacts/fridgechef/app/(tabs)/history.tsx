import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import { EmptyState } from "@/components/EmptyState";
import { useApp } from "@/contexts/AppContext";
import { MEAL_LABELS } from "@/constants/recipes";
import { useColors } from "@/hooks/useColors";

function formatDayLabel(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { history, removeHistoryEntry } = useApp();

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: typeof history }>();
    for (const h of history) {
      const k = dayKey(h.cookedAt);
      if (!map.has(k)) {
        map.set(k, { label: formatDayLabel(h.cookedAt), items: [] });
      }
      map.get(k)!.items.push(h);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, ...v }));
  }, [history]);

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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
              {history.length} meals
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              History
            </Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Recently cooked meals stay off your suggestions for 3 days.
            </Text>
          </View>
        </View>

        {history.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <EmptyState
              icon="clock"
              title="No meals cooked yet"
              subtitle="Mark a recipe as cooked from your daily plan and it'll show up here."
            />
          </View>
        ) : (
          <View style={{ gap: 18 }}>
            {grouped.map((g) => (
              <View key={g.key}>
                <Text
                  style={[styles.dayLabel, { color: colors.mutedForeground }]}
                >
                  {g.label}
                </Text>
                <View
                  style={[
                    styles.dayCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  {g.items.map((h, idx) => (
                    <Pressable
                      key={h.id}
                      onPress={() =>
                        router.push({
                          pathname: "/recipe/[id]",
                          params: { id: h.recipeId, mealType: h.mealType },
                        })
                      }
                      style={({ pressed }) => [
                        styles.row,
                        idx > 0 && {
                          borderTopWidth: 1,
                          borderTopColor: colors.border,
                        },
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <View
                        style={[
                          styles.mealBadge,
                          {
                            backgroundColor: colors.cardSoft,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.mealBadgeText, { color: colors.primary }]}
                        >
                          {MEAL_LABELS[h.mealType]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.recipeName, { color: colors.foreground }]}
                          numberOfLines={1}
                        >
                          {h.recipeName}
                        </Text>
                        <Text
                          style={[styles.timeText, { color: colors.mutedForeground }]}
                        >
                          {new Date(h.cookedAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => void removeHistoryEntry(h.id)}
                        hitSlop={10}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                      >
                        <Feather
                          name="trash-2"
                          size={16}
                          color={colors.mutedForeground}
                        />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { marginBottom: 18 },
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 4 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 6, lineHeight: 18 },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 8,
    marginTop: 8,
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  dayCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  mealBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  mealBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  recipeName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  timeText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
