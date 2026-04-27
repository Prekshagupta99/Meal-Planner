import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof Feather>["name"];
  tone?: "default" | "primary" | "secondary" | "warn" | "soft";
  style?: ViewStyle;
};

export function Pill({
  label,
  selected,
  onPress,
  icon,
  tone = "default",
  style,
}: Props) {
  const colors = useColors();

  const palette = (() => {
    if (selected) {
      return {
        bg: colors.primary,
        fg: colors.primaryForeground,
        border: colors.primary,
      };
    }
    if (tone === "primary") {
      return {
        bg: colors.primary,
        fg: colors.primaryForeground,
        border: colors.primary,
      };
    }
    if (tone === "secondary") {
      return {
        bg: colors.secondary,
        fg: colors.secondaryForeground,
        border: colors.secondary,
      };
    }
    if (tone === "warn") {
      return {
        bg: colors.accent,
        fg: colors.accentForeground,
        border: colors.accent,
      };
    }
    if (tone === "soft") {
      return {
        bg: colors.muted,
        fg: colors.mutedForeground,
        border: "transparent",
      };
    }
    return {
      bg: colors.card,
      fg: colors.foreground,
      border: colors.border,
    };
  })();

  const Wrapper: React.ComponentType<any> = onPress ? Pressable : View;
  const wrapperProps = onPress
    ? {
        onPress,
        android_ripple: { color: colors.muted, borderless: false },
        style: ({ pressed }: { pressed: boolean }) => [
          styles.pill,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            opacity: pressed ? 0.85 : 1,
          },
          style,
        ],
      }
    : {
        style: [
          styles.pill,
          { backgroundColor: palette.bg, borderColor: palette.border },
          style,
        ],
      };

  return (
    <Wrapper {...wrapperProps}>
      {icon ? (
        <Feather
          name={icon}
          size={14}
          color={palette.fg}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.text, { color: palette.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
