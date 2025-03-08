import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, Switch, Text } from "react-native";

import List from "../../../components/UI/List";
import SectionTitle from "../../../components/UI/SectionTitle";
import TextInput from "../../../components/UI/TextInput";
import { FiltersContext } from "../../../contexts/SettingsContexts/FiltersContext";
import {
  t,
  ThemeContext,
} from "../../../contexts/SettingsContexts/ThemeContext";

export default function Filters() {
  const { theme } = useContext(ThemeContext);
  const { filterSeenPosts, toggleFilterSeenPosts, filterText, setFilterText } =
    useContext(FiltersContext);

  return (
    <>
      <Text
        style={t(styles.textDescription, {
          color: theme.text,
        })}
      >
        Filters only apply to items in the main feeds and subreddits. They do
        not apply to search results or user profiles. Excessive filtering may
        make load times slower because more items have to be loaded before
        showing results.
      </Text>
      <List
        title="Post Settings"
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
                onValueChange={() => toggleFilterSeenPosts()}
              />
            ),
            text: "Hide Seen Posts",
            onPress: () => toggleFilterSeenPosts(),
          },
        ]}
      />
      <SectionTitle text="Text Filter List" />
      <TextInput
        style={t(styles.filterText, {
          backgroundColor: theme.tint,
          borderColor: theme.divider,
          color: theme.text,
        })}
        multiline
        value={filterText}
        onChangeText={(text) => setFilterText(text)}
      />
      <Text
        style={t(styles.textDescription, {
          color: theme.text,
        })}
      >
        Words or phrases can be seperated by commas or new lines. If a post or
        comment contains items on this list, it will be hidden from view. Post
        filter text includes the title, author username, post text, poll
        options, link titles, and link descriptions. Comment filter text
        includes the comment text, and author username. Text filtering is case
        insensitive and won't match subwords. For example, "cat" won't match
        "caterpillar".
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  textDescription: {
    margin: 15,
    lineHeight: 20,
  },
  filterText: {
    marginHorizontal: 15,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    minHeight: 100,
  },
});
