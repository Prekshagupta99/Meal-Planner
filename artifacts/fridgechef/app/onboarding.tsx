import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DietPicker } from "@/components/DietPickerSheet";
import { useApp } from "@/contexts/AppContext";
import { Diet } from "@/constants/recipes";
import { useColors } from "@/hooks/useColors";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setDiet } = useApp();
  const [picked, setPicked] = useState<Diet | null>(null);

  const handleContinue = async () => {
    if (!picked) return;
    await setDiet(picked);
    router.replace("/(tabs)");
  };

  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topInset + 24,
          paddingBottom: bottomInset + 24,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.logoBadge,
            { backgroundColor: colors.primary + "1A", borderColor: colors.primary },
          ]}
        >
          <Feather name="coffee" size={20} color={colors.primary} />
          <Text style={[styles.logoText, { color: colors.primary }]}>
            FridgeChef
          </Text>
        </View>
        <Text style={[styles.heading, { color: colors.foreground }]}>
          What do you eat?
        </Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          We'll plan every meal around your diet and what's already in your
          fridge — no last-minute "what's for dinner" panic.
        </Text>

        <View style={{ marginTop: 28 }}>
          <DietPicker selected={picked} onSelect={setPicked} />
        </View>

        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.cardSoft, borderColor: colors.border },
          ]}
        >
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            You can change your diet anytime in Settings.
          </Text>
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottomInset + 16,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable
          onPress={handleContinue}
          disabled={!picked}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: picked ? colors.primary : colors.muted,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.ctaText,
              {
                color: picked ? colors.primaryForeground : colors.mutedForeground,
              },
            ]}
          >
            Continue
          </Text>
          <Feather
            name="arrow-right"
            size={16}
            color={picked ? colors.primaryForeground : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  logoText: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.4 },
  heading: { fontSize: 32, fontFamily: "Inter_700Bold", marginTop: 22 },
  sub: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 8, lineHeight: 22 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 24,
  },
  infoText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  ctaText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
