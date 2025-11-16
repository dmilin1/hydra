import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext } from "react";
import { Switch } from "react-native";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  COMMENT_SWIPE_OPTIONS,
  GesturesContext,
  POST_SWIPE_OPTIONS,
} from "../../../contexts/SettingsContexts/GesturesContext";
import { useSettingsPicker } from "../../../utils/useSettingsPicker";

export default function Gestures() {
  const { theme } = useContext(ThemeContext);
  const {
    swipeAnywhereToNavigate,
    toggleSwipeAnywhereToNavigate,
    postSwipeOptions,
    setPostSwipeOption,
    commentSwipeOptions,
    setCommentSwipeOption,
  } = useContext(GesturesContext);

  const postSwipeOptionsItems = [...POST_SWIPE_OPTIONS];
  const commentSwipeOptionsItems = [...COMMENT_SWIPE_OPTIONS];

  const {
    openPicker: openPostSwipeFarRightPicker,
    rightIcon: rightIconPostSwipeFarRight,
  } = useSettingsPicker({
    items: postSwipeOptionsItems,
    value: postSwipeOptions.farRight,
    onChange: (newValue) => setPostSwipeOption("farRight", newValue),
  });

  const {
    openPicker: openPostSwipeShortRightPicker,
    rightIcon: rightIconPostSwipeShortRight,
  } = useSettingsPicker({
    items: postSwipeOptionsItems,
    value: postSwipeOptions.right,
    onChange: (newValue) => setPostSwipeOption("right", newValue),
  });

  const {
    openPicker: openPostSwipeFarLeftPicker,
    rightIcon: rightIconPostSwipeFarLeft,
  } = useSettingsPicker({
    items: postSwipeOptionsItems,
    value: postSwipeOptions.farLeft,
    onChange: (newValue) => setPostSwipeOption("farLeft", newValue),
  });

  const {
    openPicker: openPostSwipeShortLeftPicker,
    rightIcon: rightIconPostSwipeShortLeft,
  } = useSettingsPicker({
    items: postSwipeOptionsItems,
    value: postSwipeOptions.left,
    onChange: (newValue) => setPostSwipeOption("left", newValue),
  });

  const {
    openPicker: openCommentSwipeFarRightPicker,
    rightIcon: rightIconCommentSwipeFarRight,
  } = useSettingsPicker({
    items: commentSwipeOptionsItems,
    value: commentSwipeOptions.farRight,
    onChange: (newValue) => setCommentSwipeOption("farRight", newValue),
  });

  const {
    openPicker: openCommentSwipeShortRightPicker,
    rightIcon: rightIconCommentSwipeShortRight,
  } = useSettingsPicker({
    items: commentSwipeOptionsItems,
    value: commentSwipeOptions.right,
    onChange: (newValue) => setCommentSwipeOption("right", newValue),
  });

  const {
    openPicker: openCommentSwipeFarLeftPicker,
    rightIcon: rightIconCommentSwipeFarLeft,
  } = useSettingsPicker({
    items: commentSwipeOptionsItems,
    value: commentSwipeOptions.farLeft,
    onChange: (newValue) => setCommentSwipeOption("farLeft", newValue),
  });

  const {
    openPicker: openCommentSwipeShortLeftPicker,
    rightIcon: rightIconCommentSwipeShortLeft,
  } = useSettingsPicker({
    items: commentSwipeOptionsItems,
    value: commentSwipeOptions.left,
    onChange: (newValue) => setCommentSwipeOption("left", newValue),
  });

  return (
    <>
      <List
        title="Navigation"
        items={[
          {
            key: "swipeAnywhereToNavigate",
            icon: (
              <MaterialCommunityIcons
                name="gesture-tap-button"
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
                value={swipeAnywhereToNavigate}
                onValueChange={() =>
                  toggleSwipeAnywhereToNavigate(!swipeAnywhereToNavigate)
                }
              />
            ),
            text: "Swipe Anywhere to Navigate",
            onPress: () =>
              toggleSwipeAnywhereToNavigate(!swipeAnywhereToNavigate),
          },
        ]}
      />
      <List
        title="Post Swipe Actions"
        items={[
          {
            key: "swipeFarRight",
            icon: (
              <MaterialCommunityIcons
                name="step-forward-2"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconPostSwipeFarRight,
            text: "Long Right Swipe",
            onPress: () => openPostSwipeFarRightPicker(),
          },
          {
            key: "swipeShortRight",
            icon: (
              <MaterialCommunityIcons
                name="step-forward"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconPostSwipeShortRight,
            text: "Short Right Swipe",
            onPress: () => openPostSwipeShortRightPicker(),
          },
          {
            key: "swipeFarLeft",
            icon: (
              <MaterialCommunityIcons
                name="step-backward-2"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconPostSwipeFarLeft,
            text: "Long Left Swipe",
            onPress: () => openPostSwipeFarLeftPicker(),
          },
          {
            key: "swipeShortLeft",
            icon: (
              <MaterialCommunityIcons
                name="step-backward"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconPostSwipeShortLeft,
            text: "Short Left Swipe",
            onPress: () => openPostSwipeShortLeftPicker(),
          },
        ]}
      />
      <List
        title="Comment Swipe Actions"
        items={[
          {
            key: "swipeFarRight",
            icon: (
              <MaterialCommunityIcons
                name="step-forward-2"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconCommentSwipeFarRight,
            text: "Long Right Swipe",
            onPress: () => openCommentSwipeFarRightPicker(),
          },
          {
            key: "swipeShortRight",
            icon: (
              <MaterialCommunityIcons
                name="step-forward"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconCommentSwipeShortRight,
            text: "Short Right Swipe",
            onPress: () => openCommentSwipeShortRightPicker(),
          },
          {
            key: "swipeFarLeft",
            icon: (
              <MaterialCommunityIcons
                name="step-backward-2"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconCommentSwipeFarLeft,
            text: "Long Left Swipe",
            onPress: () => openCommentSwipeFarLeftPicker(),
          },
          {
            key: "swipeShortLeft",
            icon: (
              <MaterialCommunityIcons
                name="step-backward"
                size={24}
                color={theme.text}
              />
            ),
            rightIcon: rightIconCommentSwipeShortLeft,
            text: "Short Left Swipe",
            onPress: () => openCommentSwipeShortLeftPicker(),
          },
        ]}
      />
    </>
  );
}
