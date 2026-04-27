import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
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
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { diet, resetAll, history, pantry } = useApp();

  const handleReset = () => {
    Alert.alert(
      "Reset everything?",
      "Your diet preference, pantry and meal history will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => void resetAll(),
        },
      ],
    );
  };

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
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>
          Preferences
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings
        </Text>

        <Text
          style={[styles.sectionLabel, { color: colors.mutedForeground }]}
        >
          Diet preference
        </Text>
        <DietPicker selected={diet} />

        <Text
          style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 28 }]}
        >
          Your kitchen
        </Text>
        <View
          style={[
            styles.statsCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.statRow}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: colors.cardSoft },
              ]}
            >
              <Feather name="archive" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statName, { color: colors.foreground }]}>
              Pantry items
            </Text>
            <Text
              style={[styles.statValue, { color: colors.mutedForeground }]}
            >
              {pantry.length}
            </Text>
          </View>
          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />
          <View style={styles.statRow}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: colors.cardSoft },
              ]}
            >
              <Feather name="clock" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.statName, { color: colors.foreground }]}>
              Meals cooked
            </Text>
            <Text
              style={[styles.statValue, { color: colors.mutedForeground }]}
            >
              {history.length}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 28 }]}
        >
          About
        </Text>
        <View
          style={[
            styles.aboutCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.aboutText, { color: colors.foreground }]}>
            FridgeChef plans your day around what's actually in your fridge. We
            suggest a recipe for each meal, skip anything you've cooked in the
            last few days, and only recommend dishes when you have at least 80%
            of the ingredients on hand.
          </Text>
        </View>

        <Pressable
          onPress={handleReset}
          style={({ pressed }) => [
            styles.dangerBtn,
            {
              borderColor: colors.destructive,
              backgroundColor: colors.background,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
          <Text
            style={[styles.dangerText, { color: colors.destructive }]}
          >
            Reset all data
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold", marginTop: 4, marginBottom: 18 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  statsCard: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  statValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginHorizontal: 14 },
  aboutCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  dangerBtn: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dangerText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
