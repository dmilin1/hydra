import FontAwesome from "@react-native-vector-icons/fontawesome";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import React, { useContext } from "react";
import { Switch } from "react-native";

import List from "../../../components/UI/List";
import { TabSettingsContext } from "../../../contexts/SettingsContexts/TabSettingsContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";

export default function TabAppearance() {
  const { theme } = useContext(ThemeContext);

  const {
    showUsername,
    toggleShowUsername,
    hideTabsOnScroll,
    toggleHideTabsOnScroll,
  } = useContext(TabSettingsContext);

  return (
    <List
      title="Tab Appearance Settings"
      items={[
        {
          key: "showUsername",
          icon: <MaterialIcons name="person" size={24} color={theme.text} />,
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={showUsername}
              onValueChange={() => toggleShowUsername()}
            />
          ),
          text: "Show username",
          onPress: () => toggleShowUsername(),
        },
        {
          key: "hideTabsOnScroll",
          icon: <FontAwesome name="arrows-v" size={24} color={theme.text} />,
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={hideTabsOnScroll}
              onValueChange={() => toggleHideTabsOnScroll()}
            />
          ),
          text: "Hide on infinite scroll",
          onPress: () => toggleHideTabsOnScroll(),
        },
      ]}
    />
  );
}
