import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { Switch } from "react-native";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { GesturesContext } from "../../../contexts/SettingsContexts/GesturesContext";

export default function Gestures() {
  const { theme } = useContext(ThemeContext);
  const { swipeAnywhereToNavigate, toggleSwipeAnywhereToNavigate } =
    useContext(GesturesContext);

  return (
    <List
      title="Navigation"
      items={[
        {
          key: "swipeAnywhereToNavigate",
          icon: (
            <MaterialCommunityIcons
              name="gesture-tap-button"
              size={24}
              color={theme.text}
            />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={swipeAnywhereToNavigate}
              onValueChange={() =>
                toggleSwipeAnywhereToNavigate(!swipeAnywhereToNavigate)
              }
            />
          ),
          text: "Swipe Anywhere to Navigate",
          onPress: () =>
            toggleSwipeAnywhereToNavigate(!swipeAnywhereToNavigate),
        },
      ]}
    />
  );
}
