import React, { useContext } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import Appearance from "./Appearance";
import DataUse from "./DataUse";
import Root from "./Root";
import Theme from "./Theme";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import URL from "../../utils/URL";
import { StackPageProps } from "../../app/stack";

export default function SettingsPage({ route, navigation }: StackPageProps<"SettingsPage">) {
  const url = route.params.url;

  const { theme } = useContext(ThemeContext);

  const relativePath = new URL(url).getRelativePath();

  return (
    <View
      style={t(styles.settingsContainer, {
        backgroundColor: theme.background,
      })}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        {relativePath === "settings" && <Root />}
        {relativePath === "settings/theme" && <Theme />}
        {relativePath === "settings/appearance" && <Appearance />}
        {relativePath === "settings/dataUse" && <DataUse />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
