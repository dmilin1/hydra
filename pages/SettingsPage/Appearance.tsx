import {
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useContext, useRef } from "react";
import { ColorValue, Switch, Text } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import List from "../../components/UI/List";
import Picker from "../../components/UI/Picker";
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
  } = useContext(PostSettingsContext);

  const postTitleLengthRef = useRef<RNPickerSelect>(null);
  const postTextLengthRef = useRef<RNPickerSelect>(null);

  return (
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
      ]}
    />
  );
}
