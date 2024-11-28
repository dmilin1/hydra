import {
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useContext, useRef } from "react";
import { ColorValue, Switch, Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import List from "../../components/UI/List";
import Picker from "../../components/UI/Picker";
import { CommentSettingsContext } from "../../contexts/SettingsContexts/CommentSettingsContext";
import { PostSettingsContext } from "../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

export default function Appearance() {
  const { theme } = useContext(ThemeContext);

  const {
    postCompactMode,
    togglePostCompactMode,
    subredditAtTop,
    toggleSubredditAtTop,
    showSubredditIcon,
    toggleSubredditIcon,
    postTitleLength,
    changePostTitleLength,
    postTextLength,
    changePostTextLength,
    blurNSFW,
    toggleBlurNSFW,
    blurSpoilers,
    toggleBlurSpoilers,
  } = useContext(PostSettingsContext);

  const { voteIndicator, toggleVoteIndicator } = useContext(
    CommentSettingsContext,
  );

  const postTitleLengthRef = useRef<RNPickerSelect>(null);
  const postTextLengthRef = useRef<RNPickerSelect>(null);

  return (
    <>
      <List
        title="Post Appearance Settings"
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
                value={postCompactMode}
                onValueChange={() => togglePostCompactMode()}
              />
            ),
            text: "Make posts compact",
            onPress: () => togglePostCompactMode(),
          },
          {
            key: "subredditAtTop",
            icon: <AntDesign name="totop" size={24} color={theme.text} />,
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
              <FontAwesome name="reddit-alien" size={24} color={theme.text} />
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
          {
            key: "postTitleLength",
            icon: <MaterialIcons name="title" size={24} color={theme.text} />,
            rightIcon: (
              <Picker
                ref={postTitleLengthRef}
                onValueChange={(value) => {
                  if (value) {
                    changePostTitleLength(value);
                  }
                }}
                items={[...Array(5).keys()].map((i) => ({
                  label: (i + 1).toString(),
                  value: i + 1,
                }))}
                value={postTitleLength}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: theme.subtleText,
                  }}
                >
                  {postTitleLength}
                </Text>
              </Picker>
            ),
            text: "Post title max lines",
            onPress: () => postTitleLengthRef.current?.togglePicker(true),
          },
          {
            key: "postTextlength",
            icon: <Entypo name="text" size={24} color={theme.text} />,
            rightIcon: (
              <Picker
                ref={postTextLengthRef}
                onValueChange={(value) => {
                  if (value) {
                    changePostTextLength(value);
                  }
                }}
                items={[...Array(10).keys()].map((i) => ({
                  label: (i + 1).toString(),
                  value: i + 1,
                }))}
                value={postTextLength}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: theme.subtleText,
                  }}
                >
                  {postTextLength}
                </Text>
              </Picker>
            ),
            text: "Post text max lines",
            onPress: () => postTextLengthRef.current?.togglePicker(true),
          },
          {
            key: "blurSpoilers",
            icon: <FontAwesome name="eye-slash" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={blurSpoilers}
                onValueChange={() => toggleBlurSpoilers()}
              />
            ),
            text: "Blur spoilers",
            onPress: () => toggleBlurSpoilers(),
          },
          {
            key: "blurNSFW",
            icon: (
              <MaterialIcons name="work-outline" size={24} color={theme.text} />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={blurNSFW}
                onValueChange={() => toggleBlurNSFW()}
              />
            ),
            text: "Blur NSFW",
            onPress: () => toggleBlurNSFW(),
          },
        ]}
      />
      <View style={{ marginTop: 5 }} />
      <List
        title="Comment Appearance Settings"
        items={[
          {
            key: "voteIndicator",
            icon: <AntDesign name="arrowup" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary as ColorValue,
                  true: theme.iconPrimary as ColorValue,
                }}
                value={voteIndicator}
                onValueChange={() => toggleVoteIndicator()}
              />
            ),
            text: "Right side vote indicators",
            onPress: () => toggleVoteIndicator(),
          },
        ]}
      />
    </>
  );
}
