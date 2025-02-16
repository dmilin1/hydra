import React, { useContext } from "react";
import { StyleSheet, View, ScrollView } from "react-native";

import Appearance from "./Appearance";
import DataUse from "./DataUse";
import GeneralRoot from "./General/GeneralRoot";
import Sorting from "./General/Sorting";
import Startup from "./General/Startup";
import Privacy from "./Privacy";
import Root from "./Root";
import Theme from "./Theme";
import { StackPageProps } from "../../app/stack";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import URL from "../../utils/URL";

export default function SettingsPage({
  route,
}: StackPageProps<"SettingsPage">) {
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

        {relativePath === "settings/general" && <GeneralRoot />}
        {relativePath === "settings/general/sorting" && <Sorting />}
        {relativePath === "settings/general/startup" && <Startup />}

        {relativePath === "settings/theme" && <Theme />}
        {relativePath === "settings/appearance" && <Appearance />}
        {relativePath === "settings/dataUse" && <DataUse />}
        {relativePath === "settings/privacy" && <Privacy />}
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
