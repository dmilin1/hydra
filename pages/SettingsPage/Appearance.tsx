import {
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome,
  Entypo,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useContext, useRef } from "react";
import { Alert, Switch, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import List from "../../components/UI/List";
import Picker from "../../components/UI/Picker";
import { CommentSettingsContext } from "../../contexts/SettingsContexts/CommentSettingsContext";
import { PostSettingsContext } from "../../contexts/SettingsContexts/PostSettingsContext";
import { TabSettingsContext } from "../../contexts/SettingsContexts/TabSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../utils/navigation";

export default function Appearance() {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();

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
    linkDescriptionLength,
    changeLinkDescriptionLength,
    showPostFlair,
    toggleShowPostFlair,
    blurNSFW,
    toggleBlurNSFW,
    blurSpoilers,
    toggleBlurSpoilers,
    showPostSummary,
    toggleShowPostSummary,
    autoPlayVideos,
    toggleAutoPlayVideos,
    liveTextInteraction,
    toggleLiveTextInteraction,
  } = useContext(PostSettingsContext);

  const {
    voteIndicator,
    toggleVoteIndicator,
    collapseAutoModerator,
    toggleCollapseAutoModerator,
    commentFlairs,
    toggleCommentFlairs,
    showCommentSummary,
    toggleShowCommentSummary,
  } = useContext(CommentSettingsContext);

  const {
    showUsername,
    toggleShowUsername,
    hideTabsOnScroll,
    toggleHideTabsOnScroll,
  } = useContext(TabSettingsContext);

  const postTitleLengthRef = useRef<RNPickerSelect>(null);
  const postTextLengthRef = useRef<RNPickerSelect>(null);
  const linkDescriptionLengthRef = useRef<RNPickerSelect>(null);

  const showProAlert = (title: string, message: string) => {
    Alert.alert(title, message, [
      {
        text: "Get Hydra Pro",
        isPreferred: true,
        onPress: () => {
          pushURL("hydra://settings/hydraPro");
        },
      },
      {
        text: "Maybe Later",
        style: "cancel",
      },
    ]);
  };

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
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
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
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
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
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
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
                onValueChange={(value: string | number) => {
                  if (value) {
                    changePostTitleLength(Number(value));
                  }
                }}
                items={[...Array(10).keys()].map((i) => ({
                  label: (i + 1).toString(),
                  value: i + 1,
                }))}
                value={postTitleLength}
              />
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
                onValueChange={(value: string | number) => {
                  if (value) {
                    changePostTextLength(Number(value));
                  }
                }}
                items={[...Array(10).keys()].map((i) => ({
                  label: (i + 1).toString(),
                  value: i + 1,
                }))}
                value={postTextLength}
              />
            ),
            text: "Post text max lines",
            onPress: () => postTextLengthRef.current?.togglePicker(true),
          },
          {
            key: "linkDescriptionLength",
            icon: <MaterialIcons name="link" size={24} color={theme.text} />,
            rightIcon: (
              <Picker
                ref={linkDescriptionLengthRef}
                onValueChange={(value: string | number) => {
                  if (value) {
                    changeLinkDescriptionLength(Number(value));
                  }
                }}
                items={[...Array(30).keys()].map((i) => ({
                  label: (i + 1).toString(),
                  value: i + 1,
                }))}
                value={linkDescriptionLength}
              />
            ),
            text: "Link description max lines",
            onPress: () => linkDescriptionLengthRef.current?.togglePicker(true),
          },
          {
            key: "showPostFlair",
            icon: <AntDesign name="tago" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={showPostFlair}
                onValueChange={() => toggleShowPostFlair()}
              />
            ),
            text: "Show post flairs",
            onPress: () => toggleShowPostFlair(),
          },
          {
            key: "blurSpoilers",
            icon: <FontAwesome name="eye-slash" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
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
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={blurNSFW}
                onValueChange={() => toggleBlurNSFW()}
              />
            ),
            text: "Blur NSFW",
            onPress: () => toggleBlurNSFW(),
          },
          {
            key: "showPostSummary",
            icon: (
              <MaterialIcons name="short-text" size={24} color={theme.text} />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={isPro && showPostSummary}
                onValueChange={() => {
                  if (isPro) {
                    toggleShowPostSummary();
                  } else {
                    showProAlert(
                      "Hydra Pro",
                      "Post summaries are only available to Hydra Pro subscribers.",
                    );
                  }
                }}
              />
            ),
            text: "Show post summary",
            onPress: () => {
              if (isPro) {
                toggleShowPostSummary();
              } else {
                showProAlert(
                  "Hydra Pro",
                  "Post summaries are only available to Hydra Pro subscribers.",
                );
              }
            },
          },
          {
            key: "autoPlayVideos",
            icon: (
              <MaterialIcons name="play-arrow" size={24} color={theme.text} />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={autoPlayVideos}
                onValueChange={() => toggleAutoPlayVideos()}
              />
            ),
            text: "Auto play videos",
            onPress: () => toggleAutoPlayVideos(),
          },
          {
            key: "liveTextInteraction",
            icon: (<MaterialIcons name="document-scanner" size={24} color={theme.text}
            />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={liveTextInteraction}
                onValueChange={() => toggleLiveTextInteraction()}
              />
            ),
            text: "Live text",
            onPress: () => toggleLiveTextInteraction(),
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
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={voteIndicator}
                onValueChange={() => toggleVoteIndicator()}
              />
            ),
            text: "Right side vote indicators",
            onPress: () => toggleVoteIndicator(),
          },
          {
            key: "collapseAutoModerator",
            icon: (
              <MaterialCommunityIcons
                name="robot-angry-outline"
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
                value={collapseAutoModerator}
                onValueChange={() => toggleCollapseAutoModerator()}
              />
            ),
            text: "Collapse AutoModerator",
            onPress: () => toggleCollapseAutoModerator(),
          },
          {
            key: "commentFlairs",
            icon: <AntDesign name="tago" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={commentFlairs}
                onValueChange={() => toggleCommentFlairs()}
              />
            ),
            text: "Show flairs",
            onPress: () => toggleCommentFlairs(),
          },
          {
            key: "showCommentSummary",
            icon: (
              <MaterialIcons name="short-text" size={24} color={theme.text} />
            ),
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={isPro && showCommentSummary}
                onValueChange={() => {
                  if (isPro) {
                    toggleShowCommentSummary();
                  } else {
                    showProAlert(
                      "Hydra Pro",
                      "Comment summaries are only available to Hydra Pro subscribers.",
                    );
                  }
                }}
              />
            ),
            text: "Show comment summary",
            onPress: () => {
              if (isPro) {
                toggleShowCommentSummary();
              } else {
                showProAlert(
                  "Hydra Pro",
                  "Comment summaries are only available to Hydra Pro subscribers.",
                );
              }
            },
          },
        ]}
      />
      <View style={{ marginTop: 5 }} />
      <List
        title="Tab Appearance Settings"
        items={[
          {
            key: "showUsername",
            icon: <MaterialIcons name="person" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={showUsername}
                onValueChange={() => toggleShowUsername()}
              />
            ),
            text: "Show username",
            onPress: () => toggleShowUsername(),
          },
          {
            key: "hideTabsOnScroll",
            icon: <FontAwesome name="arrows-v" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={hideTabsOnScroll}
                onValueChange={() => toggleHideTabsOnScroll()}
              />
            ),
            text: "Hide on infinite scroll",
            onPress: () => toggleHideTabsOnScroll(),
          },
        ]}
      />
    </>
  );
}
