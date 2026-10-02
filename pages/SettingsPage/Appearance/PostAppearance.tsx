import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import AntDesign from "@react-native-vector-icons/ant-design";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import Entypo from "@react-native-vector-icons/entypo";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import Feather from "@react-native-vector-icons/feather";
import Ionicons from "@react-native-vector-icons/ionicons";
import React, { useContext } from "react";
import { Alert, Platform, Switch } from "react-native";

import List from "../../../components/UI/List";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../../utils/navigation";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";
import { useSplitViewSupport } from "../../../utils/useSplitViewSupport";

export default function PostAppearance() {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();

  const { deviceSupportsSplitView, splitViewEnabled, setSplitViewEnabled } =
    useSplitViewSupport();

  const {
    postCompactMode,
    togglePostCompactMode,
    showThumbnailsOnRightSide,
    toggleShowThumbnailsOnRightSide,
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
    collapsePostSummary,
    toggleCollapsePostSummary,
    autoPlayVideos,
    toggleAutoPlayVideos,
    muteVideosByDefault,
    toggleMuteVideosByDefault,
    liveTextInteraction,
    toggleLiveTextInteraction,
    tapToCollapsePost,
    toggleTapToCollapsePost,
    slideAnywhereToScrub,
    toggleSlideAnywhereToScrub,
    showMediaPostInfo,
    toggleShowMediaPostInfo,
  } = useContext(PostSettingsContext);

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
        ...(postCompactMode
          ? [
              {
                key: "showThumbnailsOnRightSide",
                icon: (
                  <MaterialCommunityIcons
                    name="image-outline"
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
                    value={showThumbnailsOnRightSide}
                    onValueChange={() => toggleShowThumbnailsOnRightSide()}
                  />
                ),
                text: "Show thumbnails on right",
                onPress: () => toggleShowThumbnailsOnRightSide(),
              },
            ]
          : []),
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
        ...(isPro && showPostSummary
          ? [
              {
                key: "collapsePostSummary",
                icon: (
                  <Feather name="minimize-2" size={22} color={theme.text} />
                ),
                rightIcon: (
                  <Switch
                    trackColor={{
                      false: theme.iconSecondary,
                      true: theme.iconPrimary,
                    }}
                    value={collapsePostSummary}
                    onValueChange={() => toggleCollapsePostSummary()}
                  />
                ),
                text: "Start summary collapsed",
                onPress: () => toggleCollapsePostSummary(),
              },
            ]
          : []),
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
        ...(Platform.OS === "ios" || Platform.OS === "macos"
          ? [
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
            ]
          : []),
        {
          key: "muteVideosByDefault",
          icon: (
            <MaterialIcons name="volume-off" size={24} color={theme.text} />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={muteVideosByDefault}
              onValueChange={() => toggleMuteVideosByDefault()}
            />
          ),
          text: "Mute videos by default",
          onPress: () => toggleMuteVideosByDefault(),
        },
        {
          key: "slideAnywhereToScrub",
          icon: (
            <MaterialIcons name="fast-forward" size={24} color={theme.text} />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={slideAnywhereToScrub}
              onValueChange={() => toggleSlideAnywhereToScrub()}
            />
          ),
          text: "Slide anywhere to scrub videos",
          onPress: () => toggleSlideAnywhereToScrub(),
        },
        {
          key: "showMediaPostInfo",
          icon: <MaterialIcons name="title" size={24} color={theme.text} />,
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={showMediaPostInfo}
              onValueChange={() => toggleShowMediaPostInfo()}
            />
          ),
          text: "Post title over fullscreen media",
          onPress: () => toggleShowMediaPostInfo(),
        },
        {
          key: "tapToCollapsePost",
          icon: (
            <Ionicons name="chevron-collapse" size={24} color={theme.text} />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={tapToCollapsePost}
              onValueChange={() => toggleTapToCollapsePost()}
            />
          ),
          text: "Tap to collapse",
          onPress: () => toggleTapToCollapsePost(),
        },
      ]}
    />
  );
}
