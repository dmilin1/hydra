import { Entypo } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableHighlight } from "react-native";

import { StackPageProps } from "../app/stack";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export default function ErrorPage({ route }: StackPageProps<"ErrorPage">) {
  const { theme } = useContext(ThemeContext);

  const url = route.params.url;

  return (
    <View
      style={t(styles.errorContainer, {
        backgroundColor: theme.background,
      })}
    >
      <Entypo name="bug" size={48} color={theme.text} />
      <Text style={t(styles.errorText, { color: theme.text })}>
        {"\n"}
        Hydra was unable to load this page. It may be because this type of link
        is not yet supported.
        {"\n"}
      </Text>
      {url && (
        <>
          <Text style={t(styles.errorText, { color: theme.text })}>
            You can try opening the link in your browser by clicking the URL
            below: {"\n"}
          </Text>
          <TouchableHighlight
            onPress={() => WebBrowser.openBrowserAsync(url)}
            style={styles.linkContainer}
          >
            <Text style={t(styles.linkText, { color: theme.iconOrTextButton })}>
              {url}
            </Text>
          </TouchableHighlight>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
