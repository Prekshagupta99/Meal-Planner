import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/contexts/AppContext";
import {
  Diet,
  DIET_DESCRIPTIONS,
  DIET_LABELS,
} from "@/constants/recipes";
import { useColors } from "@/hooks/useColors";

const DIETS: Diet[] = [
  "vegan",
  "vegetarian",
  "eggetarian",
  "non-vegetarian",
];

const DIET_ICONS: Record<Diet, React.ComponentProps<typeof Feather>["name"]> = {
  vegan: "feather",
  vegetarian: "leaf" as never, // Feather doesn't have leaf; we'll fallback
  eggetarian: "circle",
  "non-vegetarian": "thermometer",
};

// Use a curated set of valid Feather icons
const SAFE_DIET_ICONS: Record<
  Diet,
  React.ComponentProps<typeof Feather>["name"]
> = {
  vegan: "feather",
  vegetarian: "wind",
  eggetarian: "circle",
  "non-vegetarian": "zap",
};

type Props = {
  selected?: Diet | null;
  onSelect?: (d: Diet) => void;
};

export function DietPicker({ selected, onSelect }: Props) {
  const colors = useColors();
  const { setDiet } = useApp();

  const handlePress = (d: Diet) => {
    if (Platform.OS !== "web") void Haptics.selectionAsync();
    if (onSelect) onSelect(d);
    else void setDiet(d);
  };

  return (
    <View style={styles.wrap}>
      {DIETS.map((d) => {
        const isSelected = d === selected;
        return (
          <Pressable
            key={d}
            onPress={() => handlePress(d)}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isSelected
                    ? colors.primaryForeground + "22"
                    : colors.muted,
                },
              ]}
            >
              <Feather
                name={SAFE_DIET_ICONS[d]}
                size={18}
                color={isSelected ? colors.primaryForeground : colors.primary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {DIET_LABELS[d]}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                    opacity: isSelected ? 0.85 : 1,
                  },
                ]}
              >
                {DIET_DESCRIPTIONS[d]}
              </Text>
            </View>
            {isSelected ? (
              <Feather
                name="check-circle"
                size={20}
                color={colors.primaryForeground}
              />
            ) : (
              <Feather
                name="chevron-right"
                size={18}
                color={colors.mutedForeground}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// silence unused warning for original mapping kept for reference
void DIET_ICONS;

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    lineHeight: 17,
  },
});
