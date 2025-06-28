import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import Advanced from "./Advanced";
import Appearance from "./Appearance";
import DataUse from "./DataUse";
import Filters from "./General/Filters";
import GeneralRoot from "./General/GeneralRoot";
import HydraPro from "./HydraPro";
import Legal from "./General/Legal";
import OpenInHydra from "./General/OpenInHydra";
import Privacy from "./Privacy";
import Root from "./Root";
import Sorting from "./General/Sorting";
import Startup from "./General/Startup";
import Theme from "./Theme";
import ThemeMaker from "./ThemeMaker";
import { StackPageProps } from "../../app/stack";
import KeyboardAvoidingScroller from "../../components/UI/KeyboardAvoidingScroller";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import URL from "../../utils/URL";
import Gestures from "./General/Gestures";

export default function SettingsPage({
  route,
}: StackPageProps<"SettingsPage">) {
  const url = route.params.url;

  const { theme } = useContext(ThemeContext);

  const relativePath = new URL(url).getRelativePath();

  return (
    <View
      style={[
        styles.settingsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <KeyboardAvoidingScroller
        style={styles.scrollView}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 20,
        }}
      >
        {relativePath === "settings" && <Root />}

        {relativePath === "settings/general" && <GeneralRoot />}
        {relativePath === "settings/general/gestures" && <Gestures />}
        {relativePath === "settings/general/sorting" && <Sorting />}
        {relativePath === "settings/general/openInHydra" && <OpenInHydra />}
        {relativePath === "settings/general/filters" && <Filters />}
        {relativePath === "settings/general/startup" && <Startup />}
        {relativePath === "settings/general/legal" && <Legal />}

        {relativePath === "settings/theme" && <Theme />}
        {relativePath === "settings/themeMaker" && <ThemeMaker />}
        {relativePath === "settings/appearance" && <Appearance />}
        {relativePath === "settings/dataUse" && <DataUse />}
        {relativePath === "settings/privacy" && <Privacy />}
        {relativePath === "settings/advanced" && <Advanced />}
        {relativePath === "settings/hydraPro" && <HydraPro />}
      </KeyboardAvoidingScroller>
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
