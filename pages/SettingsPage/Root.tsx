import AntDesign from "@react-native-vector-icons/ant-design";
import Feather from "@react-native-vector-icons/feather";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import Octicons from "@react-native-vector-icons/octicons";
import * as Application from "expo-application";
import * as Updates from "expo-updates";
import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { supportsAlternateIcons } from "../../utils/appIcons";

import GetHydraProButton from "../../components/UI/GetHydraProButton";
import List from "../../components/UI/List";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../utils/navigation";
import { StartupModalContext } from "../../contexts/StartupModalContext";
import SearchBar from "../../components/UI/SearchBar";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Ionicons from "@react-native-vector-icons/ionicons";
import { openExternalLink } from "../../utils/openExternalLink";

export default function Root() {
  const { theme } = useContext(ThemeContext);
  const { setStartupModal } = useContext(StartupModalContext);
  const { pushURL } = useURLNavigation();

  return (
    <>
      <View style={{ marginHorizontal: 5 }}>
        <SearchBar
          placeholder="Ask a question..."
          onSearch={async (text) => {
            if (!text) return;
            pushURL(
              `hydra://settings/guide/?search=${encodeURIComponent(text)}`,
            );
          }}
          clearOnSearch={true}
          autoCorrect={true}
        />
      </View>
      <List
        title="Configuration"
        items={[
          {
            key: "general",
            icon: <Feather name="settings" size={22} color={theme.text} />,
            text: "General",
            onPress: () => pushURL("hydra://settings/general"),
          },
          {
            key: "account",
            icon: <FontAwesome5 name="user" size={22} color={theme.text} />,
            text: "Account",
            onPress: () => pushURL("hydra://accounts"),
          },
          {
            key: "dataUse",
            icon: <Feather name="activity" size={22} color={theme.text} />,
            text: "Data Use",
            onPress: () => pushURL("hydra://settings/dataUse"),
          },
          {
            key: "privacy",
            icon: <Feather name="lock" size={22} color={theme.text} />,
            text: "Privacy",
            onPress: () => pushURL("hydra://settings/privacy"),
          },
          {
            key: "advanced",
            icon: <FontAwesome name="wrench" size={22} color={theme.text} />,
            text: "Advanced",
            onPress: () => pushURL("hydra://settings/advanced"),
          },
        ]}
      />
      <List
        title="Personalization"
        items={[
          {
            key: "theme",
            icon: <Feather name="moon" size={22} color={theme.text} />,
            text: "Theme",
            onPress: () => pushURL("hydra://settings/theme"),
          },
          {
            key: "appearance",
            icon: <Feather name="eye" size={22} color={theme.text} />,
            text: "Appearance",
            onPress: () => pushURL("hydra://settings/appearance"),
          },
          ...(supportsAlternateIcons
            ? [
                {
                  key: "appIcon",
                  icon: (
                    <Octicons name="paintbrush" size={20} color={theme.text} />
                  ),
                  text: "App Icon",
                  onPress: () => pushURL("hydra://settings/appIcon"),
                },
              ]
            : []),
        ]}
      />
      <List
        title="Info"
        items={[
          {
            key: "guide",
            icon: <Feather name="book" size={22} color={theme.text} />,
            text: "Guide",
            onPress: () => pushURL("hydra://settings/guide"),
          },
          {
            key: "stats",
            icon: <AntDesign name="bar-chart" size={22} color={theme.text} />,
            text: "Stats",
            onPress: () => pushURL("hydra://settings/stats"),
          },
          {
            key: "legal",
            icon: <Feather name="file-text" size={22} color={theme.text} />,
            text: "Legal",
            onPress: () => pushURL("hydra://settings/general/legal"),
          },
          {
            key: "patchNotes",
            icon: (
              <MaterialIcons
                name="system-update"
                size={22}
                color={theme.text}
              />
            ),
            text: "Patch Notes",
            onPress: () => setStartupModal("updateInfo"),
          },
        ]}
      />
      <List
        title="Resources"
        items={[
          {
            key: "discordServer",
            icon: (
              <FontAwesome6
                iconStyle="brand"
                name="discord"
                size={19}
                color={theme.text}
              />
            ),
            text: "Discord Server",
            onPress: () => openExternalLink("https://discord.gg/ypaD4KYJ3R"),
          },
          {
            key: "website",
            icon: <Feather name="globe" size={22} color={theme.text} />,
            text: "Website",
            onPress: () => openExternalLink("https://www.hydraapp.io/"),
          },
          {
            key: "sourceCode",
            icon: <FontAwesome name="code" size={22} color={theme.text} />,
            text: "Source Code",
            onPress: () => openExternalLink("https://github.com/dmilin1/hydra"),
          },
        ]}
      />
      <List
        title="Subreddits"
        items={[
          {
            key: "hydraClient",
            icon: (
              <FontAwesome6
                iconStyle="brand"
                name="reddit-alien"
                size={22}
                color={theme.text}
              />
            ),
            text: "HydraClient",
            onPress: () => pushURL("/r/HydraClient/"),
          },
          {
            key: "hydraFeatureRequest",
            icon: (
              <Feather name="git-pull-request" size={24} color={theme.text} />
            ),
            text: "HydraFeatureRequest",
            onPress: () => pushURL("/r/HydraFeatureRequest/top?t=all"),
          },
          {
            key: "hydraThemes",
            icon: (
              <Ionicons
                name="color-palette-outline"
                size={25}
                color={theme.text}
              />
            ),
            text: "HydraThemes",
            onPress: () => pushURL("/r/HydraThemes/top?t=all"),
          },
        ]}
      />
      <List
        title="Contribute"
        items={[
          {
            key: "tipJar",
            icon: <Feather name="heart" size={22} color={theme.text} />,
            text: "Tip Jar",
            onPress: () => pushURL("hydra://settings/tipJar"),
          },
          {
            key: "gitHubSponsors",
            icon: (
              <FontAwesome6
                iconStyle="brand"
                name="github"
                size={21}
                color={theme.text}
              />
            ),
            text: "GitHub Sponsors",
            onPress: () =>
              openExternalLink("https://github.com/sponsors/dmilin1"),
          },
        ]}
      />
      <View style={styles.hydraProContainer}>
        <GetHydraProButton />
      </View>
      <View style={styles.appDetails}>
        <Text
          style={[
            styles.appDetailsText,
            {
              color: theme.text,
            },
          ]}
        >
          {Application.applicationName}: {Application.nativeApplicationVersion}
          {"\n"}
          Build #{Application.nativeBuildVersion}
          {"\n"}
          Update Group:{" "}
          {(Updates.manifest as any)?.metadata?.updateGroup ?? "development"}
          {"\n"}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appDetails: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    textAlign: "center",
    marginVertical: 25,
    marginHorizontal: 15,
  },
  appDetailsText: {
    flex: 1,
    textAlign: "center",
  },
  hydraProContainer: {
    marginTop: 10,
    marginHorizontal: -10,
  },
});
