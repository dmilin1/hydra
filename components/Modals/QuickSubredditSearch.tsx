import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  useAnimatedValue,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { getSearchResults } from "../../api/Search";
import { useDebouncedEffect } from "../../utils/debounce";
import { Subreddit } from "../../api/Subreddits";
import SubredditIcon from "../RedditDataRepresentations/Post/PostParts/SubredditIcon";
import {
  NavigationContainerRef,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { AppNavigationProp } from "../../utils/navigationTypes";
import { SubredditContext } from "../../contexts/SubredditContext";
import { FlashList } from "@shopify/flash-list";
import { MaterialIcons } from "@expo/vector-icons";

type QuickSubredditSearchProps = {
  show: boolean;
  onExit: () => void;
};

export default function QuickSubredditSearch({
  show,
  onExit,
}: QuickSubredditSearchProps) {
  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();

  const { theme } = useContext(ThemeContext);
  const { subreddits: userSubs } = useContext(SubredditContext);

  const textInputRef = useRef<TextInput>(null);
  const opacity = useAnimatedValue(0);
  const [searchText, setSearchText] = useState("");
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(false);

  const subredditsToShow = searchText
    ? subreddits
    : [...userSubs.favorites, ...userSubs.subscriber];

  const navigateToSubreddit = (subreddit: Subreddit) => {
    onExit();
    setSearchText("");
    setSubreddits([]);
    navigation.dispatch(
      StackActions.push("PostsPage", {
        url: `https://www.reddit.com/r/${subreddit.name}`,
      }),
    );
  };

  const loadSearchResults = async (searchText: string) => {
    if (!searchText.length) return;
    setLoading(true);
    const results = await getSearchResults<"subreddits">(
      "subreddits",
      searchText,
      {
        limit: "5",
        sr_detail: "false",
      },
    );
    setSubreddits(results);
    setLoading(false);
  };

  useDebouncedEffect(
    500,
    () => {
      loadSearchResults(searchText);
    },
    [searchText],
  );

  useEffect(() => {
    if (show) {
      textInputRef.current?.focus();
    } else {
      textInputRef.current?.blur();
    }
    Animated.timing(opacity, {
      toValue: show ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [show]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacity,
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.tint,
              borderColor: theme.divider,
              borderWidth: 1,
              borderRadius: 10,
            },
          ]}
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search for a subreddit"
          placeholderTextColor={theme.subtleText}
        />
        <FlashList
          style={{
            ...styles.subredditsContainer,
            borderColor: theme.divider,
            backgroundColor: theme.tint,
          }}
          contentContainerStyle={{ backgroundColor: theme.tint }}
          keyboardShouldPersistTaps="handled"
          data={subredditsToShow}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => navigateToSubreddit(item)}
              activeOpacity={0.5}
              style={[
                styles.subredditContainer,
                {
                  borderBottomColor:
                    index < subredditsToShow.length - 1
                      ? theme.divider
                      : "transparent",
                },
              ]}
            >
              <View style={styles.subredditSubContainer}>
                <SubredditIcon
                  subredditIcon={item.iconURL}
                  overridePostAppearanceSetting={true}
                />
                <Text
                  style={[
                    styles.subredditText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <MaterialIcons
                  name="keyboard-arrow-right"
                  size={30}
                  color={theme.verySubtleText}
                  style={styles.arrow}
                />
              </View>
            </TouchableOpacity>
          )}
        />
        {loading && (
          <ActivityIndicator
            style={styles.loading}
            size="small"
            color={theme.text}
          />
        )}
      </SafeAreaView>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.background}
        onPress={() => onExit()}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    opacity: 0.7,
    zIndex: 1,
  },
  safeArea: {
    width: "100%",
    zIndex: 2,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 10,
    pointerEvents: "box-none",
  },
  input: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 18,
    marginTop: 20,
  },
  subredditsContainer: {
    width: "100%",
    marginTop: 10,
    pointerEvents: "auto",
    maxHeight: 275,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  subredditSubContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subredditContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  subredditText: {
    fontSize: 17,
    flex: 1,
    marginLeft: 10,
  },
  arrow: {
    marginVertical: -100,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    marginTop: 20,
  },
});
