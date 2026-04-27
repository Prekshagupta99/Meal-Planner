import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { useColors } from "@/hooks/useColors";
import { buildShoppingList, ShoppingSuggestion } from "@/lib/shopping";
import { namesMatch } from "@/lib/normalize";

export default function ShoppingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { ready, diet, pantry, addPantryItem, addPantryItems } = useApp();
  const [picked, setPicked] = useState<Record<string, true>>({});
  const [recentlyAdded, setRecentlyAdded] = useState<Record<string, true>>({});

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? 34 + 84 : insets.bottom + 90;

  const pantryNames = useMemo(() => pantry.map((p) => p.name), [pantry]);

  const suggestions = useMemo(() => {
    if (!diet) return [];
    return buildShoppingList(diet, pantryNames).filter(
      (s) => !pantryNames.some((p) => namesMatch(p, s.name)),
    );
  }, [diet, pantryNames]);

  if (!ready || !diet) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const togglePick = (name: string) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    setPicked((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = true;
      return next;
    });
  };

  const addOne = async (s: ShoppingSuggestion) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    await addPantryItem(s.name);
    setRecentlyAdded((prev) => ({ ...prev, [s.name]: true }));
    setPicked((prev) => {
      const next = { ...prev };
      delete next[s.name];
      return next;
    });
  };

  const addAllPicked = async () => {
    const names = Object.keys(picked);
    if (names.length === 0) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }
    await addPantryItems(names);
    const flag: Record<string, true> = {};
    names.forEach((n) => (flag[n] = true));
    setRecentlyAdded((prev) => ({ ...prev, ...flag }));
    setPicked({});
  };

  const pickedCount = Object.keys(picked).length;
  const totalUnlocks = suggestions.reduce((sum, s) => sum + s.unlocks, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + 16,
          paddingBottom: bottomInset + (pickedCount > 0 ? 80 : 0),
          paddingHorizontal: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
            Smart suggestions
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Shopping List
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.mutedForeground }]}
          >
            Items that unlock the most meals from your recipes.
          </Text>
        </View>

        {suggestions.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <EmptyState
              icon="check-circle"
              title="You're all stocked up"
              subtitle="Your pantry can already cover plenty of meals. Cook a few, then check back."
            >
              <Pressable
                onPress={() => router.push("/(tabs)")}
                style={({ pressed }) => [
                  styles.ctaButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Feather
                  name="arrow-right"
                  size={16}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[styles.ctaText, { color: colors.primaryForeground }]}
                >
                  See today's meals
                </Text>
              </Pressable>
            </EmptyState>
          </View>
        ) : (
          <>
            <View
              style={[
                styles.heroCard,
                { backgroundColor: colors.primary },
              ]}
            >
              <View style={styles.heroTextWrap}>
                <Text
                  style={[
                    styles.heroEyebrow,
                    { color: colors.primaryForeground, opacity: 0.85 },
                  ]}
                >
                  This week's potential
                </Text>
                <Text
                  style={[
                    styles.heroTitle,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {totalUnlocks} new {totalUnlocks === 1 ? "meal" : "meals"} to
                  unlock
                </Text>
                <Text
                  style={[
                    styles.heroBody,
                    { color: colors.primaryForeground, opacity: 0.85 },
                  ]}
                >
                  Add the items below to expand what you can cook.
                </Text>
              </View>
              <View
                style={[
                  styles.heroIcon,
                  { backgroundColor: colors.primaryForeground + "22" },
                ]}
              >
                <Feather
                  name="shopping-cart"
                  size={22}
                  color={colors.primaryForeground}
                />
              </View>
            </View>

            <View style={styles.list}>
              {suggestions.map((s) => {
                const isPicked = !!picked[s.name];
                const wasAdded = !!recentlyAdded[s.name];
                return (
                  <View
                    key={s.name}
                    style={[
                      styles.row,
                      {
                        backgroundColor: colors.card,
                        borderColor: isPicked ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Pressable
                      onPress={() => togglePick(s.name)}
                      hitSlop={8}
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isPicked
                            ? colors.primary
                            : "transparent",
                          borderColor: isPicked
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {isPicked ? (
                        <Feather
                          name="check"
                          size={14}
                          color={colors.primaryForeground}
                        />
                      ) : null}
                    </Pressable>

                    <Pressable
                      style={styles.rowMain}
                      onPress={() => togglePick(s.name)}
                    >
                      <Text
                        style={[styles.rowName, { color: colors.foreground }]}
                        numberOfLines={1}
                      >
                        {s.name}
                      </Text>
                      <View style={styles.rowMetaRow}>
                        {s.unlocks > 0 ? (
                          <View
                            style={[
                              styles.unlockPill,
                              { backgroundColor: colors.secondary + "33" },
                            ]}
                          >
                            <Feather
                              name="unlock"
                              size={10}
                              color={colors.secondaryForeground}
                            />
                            <Text
                              style={[
                                styles.unlockText,
                                { color: colors.secondaryForeground },
                              ]}
                            >
                              Unlocks {s.unlocks}{" "}
                              {s.unlocks === 1 ? "meal" : "meals"}
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.appearsText,
                              { color: colors.mutedForeground },
                            ]}
                          >
                            Used in {s.appearsIn}{" "}
                            {s.appearsIn === 1 ? "recipe" : "recipes"}
                          </Text>
                        )}
                        {wasAdded ? (
                          <Text
                            style={[
                              styles.addedText,
                              { color: colors.secondaryForeground },
                            ]}
                          >
                            · Added
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={() => addOne(s)}
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.quickAdd,
                        {
                          backgroundColor: colors.cardSoft,
                          borderColor: colors.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Feather name="plus" size={16} color={colors.foreground} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {pickedCount > 0 ? (
        <View
          style={[
            styles.floatingBar,
            {
              backgroundColor: colors.foreground,
              bottom: bottomInset - 70,
            },
          ]}
        >
          <Text style={[styles.floatingText, { color: colors.background }]}>
            {pickedCount} selected
          </Text>
          <Pressable
            onPress={addAllPicked}
            style={({ pressed }) => [
              styles.floatingBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Feather name="plus" size={14} color={colors.primaryForeground} />
            <Text
              style={[styles.floatingBtnText, { color: colors.primaryForeground }]}
            >
              Add to pantry
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 4 },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    lineHeight: 20,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 22,
    marginBottom: 18,
  },
  heroTextWrap: { flex: 1, paddingRight: 12 },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  heroBody: {
    fontSize: 12.5,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    lineHeight: 18,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: { borderRadius: 22, borderWidth: 1, padding: 8, marginTop: 8 },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  ctaText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMain: { flex: 1, gap: 4 },
  rowName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  rowMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  unlockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  unlockText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  appearsText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  addedText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  quickAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingBar: {
    position: "absolute",
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  floatingText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  floatingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  floatingBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
