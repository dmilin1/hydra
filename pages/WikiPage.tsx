import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { URLRoutes } from "../app/stack";
import { useRoute } from "../utils/navigation";
import ThemedWebView from "../components/HTML/ThemedWebView";

export default function WikiPage() {
  const { params } = useRoute<URLRoutes>();
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.wikiContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ThemedWebView url={params.url} />
    </View>
  );
}

const styles = StyleSheet.create({
  wikiContainer: {
    flex: 1,
  },
});
