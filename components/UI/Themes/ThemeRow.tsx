import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import Themes, { CustomTheme, Theme } from "../../../constants/Themes";
import ThemeColorBand from "./ThemeColorBand";

type ThemeRowProps = {
  theme: Theme | CustomTheme;
  isSelected?: boolean;
  onPress?: () => void;
};

export default function ThemeRow({
  theme,
  isSelected = false,
  onPress,
}: ThemeRowProps) {
  const { theme: currentTheme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const isProTheme = !("isPro" in theme) || theme.isPro;

  const themeData =
    "extends" in theme
      ? {
          ...Themes[theme.extends as keyof typeof Themes],
          ...theme,
        }
      : theme;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.themeItemContainer,
        {
          borderBottomColor: currentTheme.divider,
        },
      ]}
    >
      <Text
        style={[
          styles.themeNameText,
          {
            color: currentTheme.text,
          },
        ]}
      >
        {themeData.name}
      </Text>
      <ThemeColorBand theme={themeData} />
      <View style={styles.checkboxContainer}>
        {isSelected ? (
          <Feather
            name="check"
            size={24}
            color={currentTheme.iconOrTextButton}
          />
        ) : isProTheme && !isPro ? (
          <Feather
            name="lock"
            size={24}
            color={currentTheme.iconOrTextButton}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  themeItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  themeNameText: {
    width: 100,
    fontSize: 18,
    marginRight: 15,
  },
  checkboxContainer: {
    width: 30,
    height: 24,
    marginLeft: 25,
    alignItems: "flex-end",
  },
});
