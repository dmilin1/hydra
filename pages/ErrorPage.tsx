import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";

import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export default function ErrorPage() {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={t(styles.errorContainer, {
        backgroundColor: theme.background,
      })}
    >
      <Text style={t(styles.errorText, { color: theme.text })}>
        Error loading page
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
  },
});
