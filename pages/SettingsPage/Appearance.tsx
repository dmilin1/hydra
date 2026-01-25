import {
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome,
  Entypo,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import React, { useContext } from "react";
import { Alert, Switch, View } from "react-native";

import List from "../../components/UI/List";
import { CommentSettingsContext } from "../../contexts/SettingsContexts/CommentSettingsContext";
import { PostSettingsContext } from "../../contexts/SettingsContexts/PostSettingsContext";
import { TabSettingsContext } from "../../contexts/SettingsContexts/TabSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../utils/navigation";
import { useSettingsPicker } from "../../utils/useSettingsPicker";
import { useSplitViewSupport } from "../../utils/useSplitViewSupport";

export default function Appearance() {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();

  const { deviceSupportsSplitView, splitViewEnabled, setSplitViewEnabled } =
    useSplitViewSupport();

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

  const {
    openPicker: openPostTitleLengthPicker,
    rightIcon: rightIconPostTitleLength,
  } = useSettingsPicker({
    items: [...Array(10).keys()].map((i) => ({
      label: (i + 1).toString(),
      value: i + 1,
    })),
    value: postTitleLength,
    onChange: changePostTitleLength,
  });

  const {
    openPicker: openPostTextLengthPicker,
    rightIcon: rightIconPostTextLength,
  } = useSettingsPicker({
    items: [...Array(10 + 1).keys()].map((i) => ({
      label: i.toString(),
      value: i,
    })),
    value: postTextLength,
    onChange: changePostTextLength,
  });

  const {
    openPicker: openLinkDescriptionLengthPicker,
    rightIcon: rightIconLinkDescriptionLength,
  } = useSettingsPicker({
    items: [...Array(30 + 1).keys()].map((i) => ({
      label: i.toString(),
      value: i,
    })),
    value: linkDescriptionLength,
    onChange: changeLinkDescriptionLength,
  });

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
            key: "splitViewEnabled",
            hide: !deviceSupportsSplitView,
            icon: <AntDesign name="split-cells" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={splitViewEnabled}
                onValueChange={() => setSplitViewEnabled(!splitViewEnabled)}
              />
            ),
            text: "Enable split view",
            onPress: () => setSplitViewEnabled(!splitViewEnabled),
          },
          {
            key: "subredditAtTop",
            icon: <AntDesign name="to-top" size={24} color={theme.text} />,
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
            rightIcon: rightIconPostTitleLength,
            text: "Post title max lines",
            onPress: () => openPostTitleLengthPicker(),
          },
          {
            key: "postTextlength",
            icon: <Entypo name="text" size={24} color={theme.text} />,
            rightIcon: rightIconPostTextLength,
            text: "Post text max lines",
            onPress: () => openPostTextLengthPicker(),
          },
          {
            key: "linkDescriptionLength",
            icon: <MaterialIcons name="link" size={24} color={theme.text} />,
            rightIcon: rightIconLinkDescriptionLength,
            text: "Link description max lines",
            onPress: () => openLinkDescriptionLengthPicker(),
          },
          {
            key: "showPostFlair",
            icon: <AntDesign name="tag" size={24} color={theme.text} />,
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
            icon: (
              <MaterialIcons
                name="document-scanner"
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
            icon: <Feather name="arrow-up" size={24} color={theme.text} />,
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
            icon: <AntDesign name="tag" size={24} color={theme.text} />,
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
