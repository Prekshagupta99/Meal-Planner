import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { Pill } from "@/components/Pill";
import { useApp } from "@/contexts/AppContext";
import {
  COMMON_GROCERIES,
  GROCERY_CATEGORIES,
  GroceryCategory,
} from "@/constants/commonGroceries";
import { useColors } from "@/hooks/useColors";
import { normalizeName } from "@/lib/normalize";

export default function PantryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    pantry,
    addPantryItem,
    addPantryItems,
    removePantryItem,
    clearPantry,
  } = useApp();

  const [text, setText] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<GroceryCategory>("Produce");

  const pantrySet = useMemo(
    () => new Set(pantry.map((p) => normalizeName(p.name))),
    [pantry],
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof pantry> = {};
    for (const item of pantry) {
      const found = COMMON_GROCERIES.find(
        (g) => normalizeName(g.name) === normalizeName(item.name),
      );
      const cat = found?.category ?? "Other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    }
    return map;
  }, [pantry]);

  const handleAdd = () => {
    const v = text.trim();
    if (!v) return;
    if (Platform.OS !== "web")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void addPantryItem(v);
    setText("");
  };

  const handleQuickAdd = (name: string) => {
    if (Platform.OS !== "web") void Haptics.selectionAsync();
    void addPantryItem(name);
  };

  const handleClear = () => {
    Alert.alert(
      "Clear pantry?",
      "This will remove every item from your pantry.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => void clearPantry(),
        },
      ],
    );
  };

  const handleAddAllInCategory = () => {
    const items = COMMON_GROCERIES.filter(
      (g) =>
        g.category === activeCategory && !pantrySet.has(normalizeName(g.name)),
    ).map((g) => g.name);
    if (items.length === 0) return;
    if (Platform.OS !== "web")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    void addPantryItems(items);
  };

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? 34 + 84 : insets.bottom + 90;

  const categoryItems = COMMON_GROCERIES.filter(
    (g) => g.category === activeCategory,
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
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
              {pantry.length} items
            </Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Pantry
            </Text>
          </View>
          {pantry.length > 0 ? (
            <Pressable
              onPress={handleClear}
              hitSlop={8}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text
                style={[styles.clearText, { color: colors.destructive }]}
              >
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View
          style={[
            styles.inputRow,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather
            name="search"
            size={16}
            color={colors.mutedForeground}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add an item, like 'eggs'"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
            autoCapitalize="words"
          />
          {text.length > 0 ? (
            <Pressable
              onPress={handleAdd}
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </Pressable>
          ) : null}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          Quick add
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {GROCERY_CATEGORIES.map((c) => (
            <Pill
              key={c}
              label={c}
              selected={c === activeCategory}
              onPress={() => setActiveCategory(c)}
            />
          ))}
        </ScrollView>

        <View
          style={[
            styles.quickCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.quickGrid}>
            {categoryItems.map((g) => {
              const inPantry = pantrySet.has(normalizeName(g.name));
              return (
                <Pressable
                  key={g.name}
                  onPress={() => handleQuickAdd(g.name)}
                  disabled={inPantry}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: inPantry
                        ? colors.secondary
                        : colors.muted,
                      borderColor: inPantry
                        ? colors.secondary
                        : colors.border,
                      opacity: pressed && !inPantry ? 0.85 : 1,
                    },
                  ]}
                >
                  <Feather
                    name={inPantry ? "check" : "plus"}
                    size={12}
                    color={
                      inPantry
                        ? colors.secondaryForeground
                        : colors.foreground
                    }
                  />
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: inPantry
                          ? colors.secondaryForeground
                          : colors.foreground,
                      },
                    ]}
                  >
                    {g.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={handleAddAllInCategory}
            style={({ pressed }) => [
              styles.addAllBtn,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="plus-circle" size={14} color={colors.primary} />
            <Text style={[styles.addAllText, { color: colors.primary }]}>
              Add all {activeCategory}
            </Text>
          </Pressable>
        </View>

        <Text
          style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}
        >
          In your fridge
        </Text>

        {pantry.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <EmptyState
              icon="archive"
              title="Nothing here yet"
              subtitle="Tap any item above to start filling your pantry."
            />
          </View>
        ) : (
          <View style={{ gap: 16, marginTop: 8 }}>
            {Object.entries(grouped).map(([cat, items]) => (
              <View key={cat}>
                <Text
                  style={[styles.groupHeader, { color: colors.mutedForeground }]}
                >
                  {cat}
                </Text>
                <View
                  style={[
                    styles.groupCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {items.map((it, idx) => (
                    <View
                      key={it.id}
                      style={[
                        styles.itemRow,
                        idx > 0 && {
                          borderTopWidth: 1,
                          borderTopColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.itemDot,
                          { backgroundColor: colors.secondary },
                        ]}
                      />
                      <Text
                        style={[styles.itemName, { color: colors.foreground }]}
                      >
                        {it.name}
                      </Text>
                      <Pressable
                        onPress={() => void removePantryItem(it.id)}
                        hitSlop={10}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                      >
                        <Feather
                          name="x"
                          size={18}
                          color={colors.mutedForeground}
                        />
                      </Pressable>
                    </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 4 },
  clearText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    paddingVertical: 8,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 22,
    marginBottom: 10,
  },
  catRow: { gap: 8, paddingRight: 12 },
  quickCard: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  addAllBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 8,
    padding: 8,
  },
  groupHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  itemDot: { width: 8, height: 8, borderRadius: 4 },
  itemName: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
});
