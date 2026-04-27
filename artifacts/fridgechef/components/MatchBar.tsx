import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  score: number; // 0..1
  label?: string;
};

export function MatchBar({ score, label }: Props) {
  const colors = useColors();
  const pct = Math.max(0, Math.min(1, score));
  const fill = (() => {
    if (pct >= 0.8) return colors.secondary;
    if (pct >= 0.5) return colors.accent;
    return colors.destructive;
  })();
  const tag = (() => {
    if (pct >= 0.8) return "Ready to cook";
    if (pct >= 0.5) return "Mostly there";
    return "Missing a lot";
  })();

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {label ?? "Pantry match"}
        </Text>
        <Text style={[styles.value, { color: colors.foreground }]}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
      <View
        style={[
          styles.track,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: fill,
              width: `${pct * 100}%`,
            },
          ]}
        />
      </View>
      <Text
        style={[styles.tag, { color: colors.mutedForeground }]}
        numberOfLines={1}
      >
        {tag}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: { fontSize: 12, fontFamily: "Inter_500Medium" },
  value: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  tag: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 6,
  },
});
