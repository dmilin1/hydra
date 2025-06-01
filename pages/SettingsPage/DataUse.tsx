import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { ColorValue, StyleSheet, Switch, Text } from "react-native";

import List from "../../components/UI/List";
import { DataModeContext } from "../../contexts/SettingsContexts/DataModeContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

export default function DataUse() {
  const { theme } = useContext(ThemeContext);
  const { dataModeSettings, changeDataModeSetting } =
    useContext(DataModeContext);

  const toggleSetting = (setting: keyof typeof dataModeSettings) => {
    changeDataModeSetting(
      setting,
      dataModeSettings[setting] === "normal" ? "lowData" : "normal",
    );
  };

  return (
    <>
      <List
        title="Data Use"
        items={[
          {
            key: "wifi",
            icon: <Feather name="wifi" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={dataModeSettings.wifi === "lowData"}
                onValueChange={() => toggleSetting("wifi")}
              />
            ),
            text: "Use Low Data on Wi-Fi",
            onPress: () => toggleSetting("wifi"),
          },
          {
            key: "cellular",
            icon: <Ionicons name="cellular" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={dataModeSettings.cellular === "lowData"}
                onValueChange={() => toggleSetting("cellular")}
              />
            ),
            text: "Use Low Data on Cellular",
            onPress: () => toggleSetting("cellular"),
          },
        ]}
      />
      <Text
        style={[
          styles.textDescription,
          {
            color: theme.text,
          },
        ]}
      >
        Low data mode reduces the quality and amount of media that gets loaded
        when scrolling. For example, videos will not be loaded while scrolling
        and will only load when they are clicked on. Links will not load article
        images. Subreddit icons will be not be loaded.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
});
