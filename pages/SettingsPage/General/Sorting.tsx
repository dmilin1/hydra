import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { StyleSheet, ColorValue, Switch, View, Text } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import List from "../../../components/UI/List";
import {
  DEFAULT_COMMENT_SORT_KEY,
  DEFAULT_MULTIREDDIT_SORT_KEY,
  DEFAULT_MULTIREDDIT_SORT_TOP_KEY,
  DEFAULT_POST_SORT_KEY,
  DEFAULT_POST_SORT_TOP_KEY,
  REMEMBER_COMMENT_SUBREDDIT_SORT_KEY,
  REMEMBER_MULTIREDDIT_SORT_KEY,
  REMEMBER_POST_SUBREDDIT_SORT_KEY,
  SORT_HOME_PAGE,
} from "../../../constants/SettingsKeys";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import KeyStore from "../../../utils/KeyStore";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";

const POST_SORT_OPTIONS = [
  {
    label: "Default",
    value: "default",
  },
  {
    label: "Best",
    value: "best",
  },
  {
    label: "Hot",
    value: "hot",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Top",
    value: "top",
  },
  {
    label: "Rising",
    value: "rising",
  },
];

const TOP_SORT_OPTIONS = [
  {
    label: "Hour",
    value: "hour",
  },
  {
    label: "Day",
    value: "day",
  },
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
  {
    label: "Year",
    value: "year",
  },
  {
    label: "All Time",
    value: "all",
  },
];

const MULTIREDDIT_SORT_OPTIONS = [
  {
    label: "Default",
    value: "default",
  },
  {
    label: "Hot",
    value: "hot",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Top",
    value: "top",
  },
  {
    label: "Rising",
    value: "rising",
  },
  {
    label: "Controversial",
    value: "controversial",
  },
];

const COMMENT_SORT_OPTIONS = [
  {
    label: "Default",
    value: "default",
  },
  {
    label: "Best",
    value: "best",
  },
  {
    label: "New",
    value: "new",
  },
  {
    label: "Top",
    value: "top",
  },
  {
    label: "Controversial",
    value: "controversial",
  },
  {
    label: "Old",
    value: "old",
  },
  {
    label: "Q&A",
    value: "qa",
  },
];

export default function General() {
  const { theme } = useContext(ThemeContext);

  const [storedDefaultPostSort, setDefaultPostSort] = useMMKVString(
    DEFAULT_POST_SORT_KEY,
  );
  const [storedDefaultPostSortTop, setDefaultPostSortTop] = useMMKVString(
    DEFAULT_POST_SORT_TOP_KEY,
  );
  const [storedRememberPostSubredditSort, setRememberPostSubredditSort] =
    useMMKVBoolean(REMEMBER_POST_SUBREDDIT_SORT_KEY);
  const [storedDefaultMultiredditSort, setDefaultMultiredditSort] =
    useMMKVString(DEFAULT_MULTIREDDIT_SORT_KEY);
  const [storedDefaultMultiredditSortTop, setDefaultMultiredditSortTop] =
    useMMKVString(DEFAULT_MULTIREDDIT_SORT_TOP_KEY);
  const [storedRememberMultiredditSort, setRememberMultiredditSort] =
    useMMKVBoolean(REMEMBER_MULTIREDDIT_SORT_KEY);
  const [storedDefaultCommentSort, setDefaultCommentSort] = useMMKVString(
    DEFAULT_COMMENT_SORT_KEY,
  );
  const [storedRememberCommentSubredditSort, setRememberCommentSubredditSort] =
    useMMKVBoolean(REMEMBER_COMMENT_SUBREDDIT_SORT_KEY);
  const [storedSortHomePage, setSortHomePage] = useMMKVBoolean(SORT_HOME_PAGE);

  const defaultPostSort = storedDefaultPostSort ?? "default";
  const defaultPostSortTop = storedDefaultPostSortTop ?? "all";
  const rememberPostSubredditSort = storedRememberPostSubredditSort ?? false;
  const defaultMultiredditSort = storedDefaultMultiredditSort ?? "default";
  const defaultMultiredditSortTop = storedDefaultMultiredditSortTop ?? "all";
  const rememberMultiredditSort = storedRememberMultiredditSort ?? false;
  const defaultCommentSort = storedDefaultCommentSort ?? "default";
  const rememberCommentSubredditSort =
    storedRememberCommentSubredditSort ?? false;
  const sortHomePage = storedSortHomePage ?? false;

  const {
    openPicker: openDefaultPostSortPicker,
    rightIcon: rightIconDefaultPostSort,
  } = useSettingsPicker({
    items: POST_SORT_OPTIONS,
    value: defaultPostSort,
    onChange: setDefaultPostSort,
  });

  const {
    openPicker: openDefaultPostSortTopPicker,
    rightIcon: rightIconDefaultPostSortTop,
  } = useSettingsPicker({
    items: TOP_SORT_OPTIONS,
    value: defaultPostSortTop,
    onChange: setDefaultPostSortTop,
  });

  const {
    openPicker: openDefaultMultiredditSortPicker,
    rightIcon: rightIconDefaultMultiredditSort,
  } = useSettingsPicker({
    items: MULTIREDDIT_SORT_OPTIONS,
    value: defaultMultiredditSort,
    onChange: setDefaultMultiredditSort,
  });

  const {
    openPicker: openDefaultMultiredditSortTopPicker,
    rightIcon: rightIconDefaultMultiredditSortTop,
  } = useSettingsPicker({
    items: TOP_SORT_OPTIONS,
    value: defaultMultiredditSortTop,
    onChange: setDefaultMultiredditSortTop,
  });

  const {
    openPicker: openDefaultCommentSortPicker,
    rightIcon: rightIconDefaultCommentSort,
  } = useSettingsPicker({
    items: COMMENT_SORT_OPTIONS,
    value: defaultCommentSort,
    onChange: setDefaultCommentSort,
  });

  const keys = KeyStore.getAllKeys();

  const [numRememberedPostSubreddits, setNumRememberedPostSubreddits] =
    useState(keys.filter((key) => key.startsWith("PostSubredditSort-")).length);
  const [numRememberedMultireddits, setNumRememberedMultireddits] = useState(
    keys.filter((key) => key.startsWith("PostMultiredditSort-")).length,
  );
  const [numRememberedCommentSubreddits, setNumRememberedCommentSubreddits] =
    useState(
      keys.filter((key) => key.startsWith("CommentSubredditSort-")).length,
    );

  const clearRememberedPostSubredditSorts = () => {
    keys.forEach((key) => {
      if (
        key.startsWith("PostSubredditSort-") ||
        key.startsWith("PostSubredditSortTop-")
      ) {
        KeyStore.remove(key);
      }
    });
    setNumRememberedPostSubreddits(0);
  };

  const clearRememberedMultiredditSorts = () => {
    keys.forEach((key) => {
      if (
        key.startsWith("PostMultiredditSort-") ||
        key.startsWith("PostMultiredditSortTop-")
      ) {
        KeyStore.remove(key);
      }
    });
    setNumRememberedMultireddits(0);
  };

  const clearRememberedCommentSubredditSorts = () => {
    keys.forEach((key) => {
      if (key.startsWith("CommentSubredditSort-")) {
        KeyStore.remove(key);
      }
    });
    setNumRememberedCommentSubreddits(0);
  };

  return (
    <>
      <List
        title="Subreddits"
        items={[
          {
            key: "defaultPostSort",
            icon: (
              <FontAwesome
                name="sort-amount-desc"
                size={24}
                color={theme.text}
              />
            ),
            text: "Default sort",
            rightIcon: rightIconDefaultPostSort,
            onPress: () => openDefaultPostSortPicker(),
          },
          ...(defaultPostSort === "top"
            ? [
                {
                  key: "defaultPostSortTop",
                  icon: (
                    <MaterialCommunityIcons
                      name="podium-gold"
                      size={24}
                      color={theme.text}
                    />
                  ),
                  text: "Default top sort",
                  rightIcon: rightIconDefaultPostSortTop,
                  onPress: () => openDefaultPostSortTopPicker(),
                },
              ]
            : []),
          {
            key: "sortHomePage",
            icon: <FontAwesome name="home" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={sortHomePage}
                onValueChange={() => setSortHomePage(!sortHomePage)}
              />
            ),
            text: "Apply sort to home",
            onPress: () => setSortHomePage(!sortHomePage),
          },
          {
            key: "rememberPostSubredditSort",
            icon: <FontAwesome name="save" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={rememberPostSubredditSort}
                onValueChange={() =>
                  setRememberPostSubredditSort(!rememberPostSubredditSort)
                }
              />
            ),
            text: "Remember subreddit sort",
            onPress: () =>
              setRememberPostSubredditSort(!rememberPostSubredditSort),
          },
        ]}
      />
      {rememberPostSubredditSort && numRememberedPostSubreddits > 0 && (
        <View style={styles.clearButtonContainer}>
          <Touchable
            style={[
              styles.clearButton,
              {
                backgroundColor: theme.buttonBg,
              },
            ]}
            activeOpacity={0.8}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() => {
              clearRememberedPostSubredditSorts();
            }}
          >
            <Text
              style={[
                styles.clearButtonText,
                {
                  color: theme.buttonText,
                },
              ]}
            >
              Clear custom post sorts ({numRememberedPostSubreddits} sub
              {numRememberedPostSubreddits === 1 ? "" : "s"})
            </Text>
          </Touchable>
        </View>
      )}
      <List
        title="Multireddits"
        items={[
          {
            key: "defaultMultiredditSort",
            icon: (
              <FontAwesome
                name="sort-amount-desc"
                size={24}
                color={theme.text}
              />
            ),
            text: "Default sort",
            rightIcon: rightIconDefaultMultiredditSort,
            onPress: () => openDefaultMultiredditSortPicker(),
          },
          ...(defaultMultiredditSort === "top"
            ? [
                {
                  key: "defaultMultiredditSortTop",
                  icon: (
                    <MaterialCommunityIcons
                      name="podium-gold"
                      size={24}
                      color={theme.text}
                    />
                  ),
                  text: "Default top sort",
                  rightIcon: rightIconDefaultMultiredditSortTop,
                  onPress: () => openDefaultMultiredditSortTopPicker(),
                },
              ]
            : []),
          {
            key: "rememberMultiredditSort",
            icon: <FontAwesome name="save" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={rememberMultiredditSort}
                onValueChange={() =>
                  setRememberMultiredditSort(!rememberMultiredditSort)
                }
              />
            ),
            text: "Remember multireddit sort",
            onPress: () => setRememberMultiredditSort(!rememberMultiredditSort),
          },
        ]}
      />
      {rememberMultiredditSort && numRememberedMultireddits > 0 && (
        <View style={styles.clearButtonContainer}>
          <Touchable
            style={[
              styles.clearButton,
              {
                backgroundColor: theme.buttonBg,
              },
            ]}
            activeOpacity={0.8}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() => {
              clearRememberedMultiredditSorts();
            }}
          >
            <Text
              style={[
                styles.clearButtonText,
                {
                  color: theme.buttonText,
                },
              ]}
            >
              Clear custom multireddit sorts ({numRememberedMultireddits} multi
              {numRememberedMultireddits === 1 ? "" : "s"})
            </Text>
          </Touchable>
        </View>
      )}
      <List
        title="Comments"
        items={[
          {
            key: "defaultCommentSort",
            icon: (
              <FontAwesome
                name="sort-amount-desc"
                size={24}
                color={theme.text}
              />
            ),
            text: "Default sort",
            rightIcon: rightIconDefaultCommentSort,
            onPress: () => openDefaultCommentSortPicker(),
          },
          {
            key: "rememberCommentSubredditSort",
            icon: <FontAwesome name="save" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={rememberCommentSubredditSort}
                onValueChange={() =>
                  setRememberCommentSubredditSort(!rememberCommentSubredditSort)
                }
              />
            ),
            text: "Remember subreddit sort",
            onPress: () =>
              setRememberCommentSubredditSort(!rememberCommentSubredditSort),
          },
        ]}
      />
      {rememberCommentSubredditSort && numRememberedCommentSubreddits > 0 && (
        <View style={styles.clearButtonContainer}>
          <Touchable
            style={[
              styles.clearButton,
              {
                backgroundColor: theme.iconOrTextButton,
              },
            ]}
            activeOpacity={0.8}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() => {
              clearRememberedCommentSubredditSorts();
            }}
          >
            <Text
              style={[
                styles.clearButtonText,
                {
                  color: theme.text,
                },
              ]}
            >
              Clear custom comment sorts ({numRememberedCommentSubreddits} sub
              {numRememberedCommentSubreddits === 1 ? "" : "s"})
            </Text>
          </Touchable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  clearButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  clearButton: {
    padding: 10,
    borderRadius: 10,
  },
  clearButtonText: {
    fontSize: 16,
  },
});
