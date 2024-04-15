import * as WebBrowser from "expo-web-browser";
import React, { useContext } from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";

export default function Link({ link }: { link: string }) {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={t(styles.externalLinkContainer, {
        borderColor: theme.tint,
      })}
      activeOpacity={0.5}
      onPress={() => {
        if (link) {
          WebBrowser.openBrowserAsync(link);
        }
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: theme.subtleText,
        }}
      >
        {link}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  externalLinkContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
});
