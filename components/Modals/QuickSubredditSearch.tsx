import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  useAnimatedValue,
  ActivityIndicator,
} from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { getSearchResults } from "../../api/Search";
import { useDebouncedEffect } from "../../utils/debounce";
import { Subreddit } from "../../api/Subreddits";
import List from "../UI/List";
import SubredditIcon from "../RedditDataRepresentations/Post/PostParts/SubredditIcon";
import {
  NavigationContainerRef,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import { AppNavigationProp } from "../../utils/navigationTypes";

type QuickSubredditSearchProps = {
  show: boolean;
  onExit: () => void;
};

export default function QuickSubredditSearch({
  show,
  onExit,
}: QuickSubredditSearchProps) {
  const { theme } = useContext(ThemeContext);

  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();

  const textInputRef = useRef<TextInput>(null);
  const opacity = useAnimatedValue(0);
  const [searchText, setSearchText] = useState("");
  const [subreddits, setSubreddits] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (searchText.length < 3) return;
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
      <View style={styles.subContainer}>
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
          {loading && (
            <ActivityIndicator
              style={styles.loading}
              size="small"
              color={theme.text}
            />
          )}
          <List
            items={subreddits.map((subreddit) => ({
              key: subreddit.id,
              icon: (
                <SubredditIcon
                  subredditIcon={subreddit.iconURL}
                  overridePostAppearanceSetting={true}
                />
              ),
              text: subreddit.name,
              onPress: () => navigateToSubreddit(subreddit),
            }))}
            containerStyle={{
              marginHorizontal: 0,
              marginTop: 20,
            }}
          />
        </SafeAreaView>
      </View>
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
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  subContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
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
    marginTop: 20,
    gap: 10,
  },
  subredditContainer: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  loading: {
    marginTop: 20,
  },
});
