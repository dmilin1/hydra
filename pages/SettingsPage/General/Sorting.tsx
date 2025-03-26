import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext, useRef, useState } from "react";
import {
  StyleSheet,
  ColorValue,
  Switch,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";
import RNPickerSelect from "react-native-picker-select";

import List from "../../../components/UI/List";
import Picker from "../../../components/UI/Picker";
import {
  DEFAULT_COMMENT_SORT_KEY,
  DEFAULT_POST_SORT_KEY,
  DEFAULT_POST_SORT_TOP_KEY,
  REMEMBER_COMMENT_SUBREDDIT_SORT_KEY,
  REMEMBER_POST_SUBREDDIT_SORT_KEY,
  SORT_HOME_PAGE
} from "../../../constants/SettingsKeys";
import {
  t,
  ThemeContext,
} from "../../../contexts/SettingsContexts/ThemeContext";
import KeyStore from "../../../utils/KeyStore";

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

  const defaultPostSortRef = useRef<RNPickerSelect>(null);
  const defaultPostSortTopRef = useRef<RNPickerSelect>(null);
  const defaultCommentSortRef = useRef<RNPickerSelect>(null);

  const [storedDefaultPostSort, setDefaultPostSort] = useMMKVString(
    DEFAULT_POST_SORT_KEY,
  );
  const [storedDefaultPostSortTop, setDefaultPostSortTop] = useMMKVString(
    DEFAULT_POST_SORT_TOP_KEY,
  );
  const [storedRememberPostSubredditSort, setRememberPostSubredditSort] =
    useMMKVBoolean(REMEMBER_POST_SUBREDDIT_SORT_KEY);
  const [storedDefaultCommentSort, setDefaultCommentSort] = useMMKVString(
    DEFAULT_COMMENT_SORT_KEY,
  );
  const [storedRememberCommentSubredditSort, setRememberCommentSubredditSort] =
    useMMKVBoolean(REMEMBER_COMMENT_SUBREDDIT_SORT_KEY);
  const [storedSortHomePage, setSortHomePage] =
    useMMKVBoolean(SORT_HOME_PAGE);

  const defaultPostSort = storedDefaultPostSort ?? "default";
  const defaultPostSortTop = storedDefaultPostSortTop ?? "all";
  const rememberPostSubredditSort = storedRememberPostSubredditSort ?? false;
  const defaultCommentSort = storedDefaultCommentSort ?? "default";
  const rememberCommentSubredditSort =
    storedRememberCommentSubredditSort ?? false;
  const sortHomePage = storedSortHomePage ?? false;

  const keys = KeyStore.getAllKeys();

  const [numRememberedPostSubreddits, setNumRememberedPostSubreddits] =
    useState(keys.filter((key) => key.startsWith("PostSubredditSort-")).length);
  const [numRememberedCommentSubreddits, setNumRememberedCommentSubreddits] =
    useState(
      keys.filter((key) => key.startsWith("CommentSubredditSort-")).length,
    );

  const clearRememberedPostSubredditSorts = () => {
    keys.forEach((key) => {
      if (key.startsWith("PostSubredditSort-")) {
        KeyStore.delete(key);
      }
    });
    setNumRememberedPostSubreddits(0);
  };

  const clearRememberedCommentSubredditSorts = () => {
    keys.forEach((key) => {
      if (key.startsWith("CommentSubredditSort-")) {
        KeyStore.delete(key);
      }
    });
    setNumRememberedCommentSubreddits(0);
  };

  return (
    <>
      <List
        title="Posts"
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
            rightIcon: (
              <Picker
                ref={defaultPostSortRef}
                onValueChange={(value: string) => {
                  if (value) {
                    setDefaultPostSort(value);
                  }
                }}
                items={POST_SORT_OPTIONS}
                value={defaultPostSort}
              />
            ),
            onPress: () => defaultPostSortRef.current?.togglePicker(true),
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
                rightIcon: (
                  <Picker
                    ref={defaultPostSortTopRef}
                    onValueChange={(value: string) => {
                      if (value) {
                        setDefaultPostSortTop(value);
                      }
                    }}
                    items={TOP_SORT_OPTIONS}
                    value={defaultPostSortTop}
                  />
                ),
                onPress: () =>
                  defaultPostSortTopRef.current?.togglePicker(true),
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
                onValueChange={() =>
                  setSortHomePage(!sortHomePage)
                }
              />
            ),
            text: "Sort on home page",
            onPress: () =>
              setSortHomePage(!sortHomePage),
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
          <TouchableOpacity
            style={t(styles.clearButton, {
              backgroundColor: theme.buttonText,
            })}
            activeOpacity={0.8}
            onPress={() => {
              clearRememberedPostSubredditSorts();
            }}
          >
            <Text
              style={t(styles.clearButtonText, {
                color: theme.text,
              })}
            >
              Clear custom post sorts ({numRememberedPostSubreddits} sub
              {numRememberedPostSubreddits === 1 ? "" : "s"})
            </Text>
          </TouchableOpacity>
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
            rightIcon: (
              <Picker
                ref={defaultCommentSortRef}
                onValueChange={(value: string) => {
                  if (value) {
                    setDefaultCommentSort(value);
                  }
                }}
                items={COMMENT_SORT_OPTIONS}
                value={defaultCommentSort}
              />
            ),
            onPress: () => defaultCommentSortRef.current?.togglePicker(true),
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
          <TouchableOpacity
            style={t(styles.clearButton, {
              backgroundColor: theme.buttonText,
            })}
            activeOpacity={0.8}
            onPress={() => {
              clearRememberedCommentSubredditSorts();
            }}
          >
            <Text
              style={t(styles.clearButtonText, {
                color: theme.text,
              })}
            >
              Clear custom comment sorts ({numRememberedCommentSubreddits} sub
              {numRememberedCommentSubreddits === 1 ? "" : "s"})
            </Text>
          </TouchableOpacity>
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
