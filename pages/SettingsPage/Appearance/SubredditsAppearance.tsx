import Feather from "@react-native-vector-icons/feather";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import React, { useContext } from "react";
import { Switch } from "react-native";
import { useMMKVBoolean } from "react-native-mmkv";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  SHOW_ALL_BUTTON_STORAGE_KEY,
  SHOW_POPULAR_BUTTON_STORAGE_KEY,
} from "../../Subreddits";

export default function SubredditsAppearance() {
  const { theme } = useContext(ThemeContext);

  const [storedShowPopular, setShowPopular] = useMMKVBoolean(
    SHOW_POPULAR_BUTTON_STORAGE_KEY,
  );
  const showPopular = storedShowPopular ?? true;

  const [storedShowAll, setShowAll] = useMMKVBoolean(
    SHOW_ALL_BUTTON_STORAGE_KEY,
  );
  const showAll = storedShowAll ?? true;

  return (
    <List
      title="Subreddits Appearance Settings"
      items={[
        {
          key: "showPopularButton",
          icon: <Feather name="trending-up" size={24} color={theme.text} />,
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={showPopular}
              onValueChange={() => setShowPopular(!showPopular)}
            />
          ),
          text: "Show Popular",
          onPress: () => setShowPopular(!showPopular),
        },
        {
          key: "showAllButton",
          icon: (
            <FontAwesome5
              iconStyle="solid"
              name="sort-amount-up-alt"
              size={22}
              color={theme.text}
            />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={showAll}
              onValueChange={() => setShowAll(!showAll)}
            />
          ),
          text: "Show All",
          onPress: () => setShowAll(!showAll),
        },
      ]}
    />
  );
}
