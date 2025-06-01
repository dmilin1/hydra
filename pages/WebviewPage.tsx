import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

import { StackPageProps } from "../app/stack";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import URL from "../utils/URL";

export default function WebviewPage({ route }: StackPageProps<"WebviewPage">) {
  const { theme } = useContext(ThemeContext);

  const { url } = route.params;

  const link = new URL(url).getQueryParam("url");

  return (
    <View
      style={[
        styles.postsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <WebView
        source={{ uri: link ?? "https://reddit.com" }}
        style={{ backgroundColor: theme.background }}
        allowsBackForwardNavigationGestures
      />
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    height: "100%",
  },
});
