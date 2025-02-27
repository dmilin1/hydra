import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Switch, Text } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

import List from "../../../components/UI/List";
import {
  t,
  ThemeContext,
} from "../../../contexts/SettingsContexts/ThemeContext";

export const FILTER_SEEN_POSTS_KEY = "filterSeenPosts";
export const FILTER_SEEN_POSTS_DEFAULT = false;

export default function Filters() {
  const { theme } = useContext(ThemeContext);

  const [storedFilterSeenPosts, setFilterSeenPosts] = useMMKVBoolean(
    FILTER_SEEN_POSTS_KEY,
  );

  const filterSeenPosts = storedFilterSeenPosts ?? FILTER_SEEN_POSTS_DEFAULT;

  return (
    <>
      <List
        title="Filter Settings"
        items={[
          {
            key: "filterSeenPosts",
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
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={filterSeenPosts}
                onValueChange={() => setFilterSeenPosts(!filterSeenPosts)}
              />
            ),
            text: "Hide Seen Posts",
            onPress: () => setFilterSeenPosts(!filterSeenPosts),
          },
        ]}
      />
      <Text
        style={t(styles.textDescription, {
          color: theme.text,
        })}
      >
        Filters only apply to items in the main feeds and subreddits. They do
        not apply to search results or user profiles. Excessive filtering may
        make load times slower because more items have to be loaded.
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
