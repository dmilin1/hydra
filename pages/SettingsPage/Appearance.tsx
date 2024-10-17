import { MaterialCommunityIcons, AntDesign, FontAwesome } from "@expo/vector-icons";
import React, { useContext } from "react";
import { ColorValue, Switch } from "react-native";

import List from "../../components/UI/List";
import { PostSettingsContext } from "../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

export default function Appearance() {
  const { theme } = useContext(ThemeContext);
  const {
    compactMode,
    toggleCompactMode,
    subredditAtTop,
    toggleSubredditAtTop,
    showSubredditIcon,
    toggleSubredditIcon
  } = useContext(PostSettingsContext);

  return (
    <List
      title="Post List Settings"
      items={[
        {
          key: "postCompactMode",
          icon: (
            <MaterialCommunityIcons
              name="view-compact-outline"
              size={24}
              color={theme.text}
            />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary as ColorValue,
                true: theme.iconPrimary as ColorValue,
              }}
              value={compactMode}
              onValueChange={() => toggleCompactMode()}
            />
          ),
          text: "Make posts compact",
          onPress: () => toggleCompactMode(),
        },
        {
          key: "subredditAtTop",
          icon: (
            <AntDesign
              name="totop"
              size={24}
              color={theme.text}
            />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary as ColorValue,
                true: theme.iconPrimary as ColorValue,
              }}
              value={subredditAtTop}
              onValueChange={() => toggleSubredditAtTop()}
            />
          ),
          text: "Show subreddit at top",
          onPress: () => toggleSubredditAtTop(),
        },
        {
          key: "subredditIcon",
          icon: (
            <FontAwesome
              name="reddit-alien"
              size={24}
              color={theme.text}
            />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary as ColorValue,
                true: theme.iconPrimary as ColorValue,
              }}
              value={showSubredditIcon}
              onValueChange={() => toggleSubredditIcon()}
            />
          ),
          text: "Show subreddit icons",
          onPress: () => toggleSubredditIcon(),
        },
      ]}
    />
  );
}
