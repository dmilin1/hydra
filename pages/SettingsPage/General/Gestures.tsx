import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useContext, useRef } from "react";
import { Switch } from "react-native";
import RNPickerSelect from "react-native-picker-select";

import List from "../../../components/UI/List";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  COMMENT_SWIPE_OPTIONS,
  CommentSwipeOption,
  GesturesContext,
  POST_SWIPE_OPTIONS,
  PostSwipeOption,
} from "../../../contexts/SettingsContexts/GesturesContext";
import Picker from "../../../components/UI/Picker";

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

  const postSwipeFarRightRef = useRef<RNPickerSelect>(null);
  const postSwipeShortRightRef = useRef<RNPickerSelect>(null);
  const postSwipeFarLeftRef = useRef<RNPickerSelect>(null);
  const postSwipeShortLeftRef = useRef<RNPickerSelect>(null);

  const commentSwipeFarRightRef = useRef<RNPickerSelect>(null);
  const commentSwipeShortRightRef = useRef<RNPickerSelect>(null);
  const commentSwipeFarLeftRef = useRef<RNPickerSelect>(null);
  const commentSwipeShortLeftRef = useRef<RNPickerSelect>(null);

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
            rightIcon: (
              <Picker
                ref={postSwipeFarRightRef}
                onValueChange={(value: PostSwipeOption) => {
                  if (value) {
                    setPostSwipeOption("farRight", value);
                  }
                }}
                items={[...POST_SWIPE_OPTIONS]}
                value={postSwipeOptions.farRight}
              />
            ),
            text: "Long Right Swipe",
            onPress: () => postSwipeFarRightRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={postSwipeShortRightRef}
                onValueChange={(value: PostSwipeOption) => {
                  if (value) {
                    setPostSwipeOption("right", value);
                  }
                }}
                items={[...POST_SWIPE_OPTIONS]}
                value={postSwipeOptions.right}
              />
            ),
            text: "Short Right Swipe",
            onPress: () => postSwipeShortRightRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={postSwipeFarLeftRef}
                onValueChange={(value: PostSwipeOption) => {
                  if (value) {
                    setPostSwipeOption("farLeft", value);
                  }
                }}
                items={[...POST_SWIPE_OPTIONS]}
                value={postSwipeOptions.farLeft}
              />
            ),
            text: "Long Left Swipe",
            onPress: () => postSwipeFarLeftRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={postSwipeShortLeftRef}
                onValueChange={(value: PostSwipeOption) => {
                  if (value) {
                    setPostSwipeOption("left", value);
                  }
                }}
                items={[...POST_SWIPE_OPTIONS]}
                value={postSwipeOptions.left}
              />
            ),
            text: "Short Left Swipe",
            onPress: () => postSwipeShortLeftRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={commentSwipeFarRightRef}
                onValueChange={(value: CommentSwipeOption) => {
                  if (value) {
                    setCommentSwipeOption("farRight", value);
                  }
                }}
                items={[...COMMENT_SWIPE_OPTIONS]}
                value={commentSwipeOptions.farRight}
              />
            ),
            text: "Long Right Swipe",
            onPress: () => commentSwipeFarRightRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={commentSwipeShortRightRef}
                onValueChange={(value: CommentSwipeOption) => {
                  if (value) {
                    setCommentSwipeOption("right", value);
                  }
                }}
                items={[...COMMENT_SWIPE_OPTIONS]}
                value={commentSwipeOptions.right}
              />
            ),
            text: "Short Right Swipe",
            onPress: () =>
              commentSwipeShortRightRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={commentSwipeFarLeftRef}
                onValueChange={(value: CommentSwipeOption) => {
                  if (value) {
                    setCommentSwipeOption("farLeft", value);
                  }
                }}
                items={[...COMMENT_SWIPE_OPTIONS]}
                value={commentSwipeOptions.farLeft}
              />
            ),
            text: "Long Left Swipe",
            onPress: () => commentSwipeFarLeftRef.current?.togglePicker(true),
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
            rightIcon: (
              <Picker
                ref={commentSwipeShortLeftRef}
                onValueChange={(value: CommentSwipeOption) => {
                  if (value) {
                    setCommentSwipeOption("left", value);
                  }
                }}
                items={[...COMMENT_SWIPE_OPTIONS]}
                value={commentSwipeOptions.left}
              />
            ),
            text: "Short Left Swipe",
            onPress: () => commentSwipeShortLeftRef.current?.togglePicker(true),
          },
        ]}
      />
    </>
  );
}
