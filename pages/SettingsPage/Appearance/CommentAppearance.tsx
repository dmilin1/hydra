import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import AntDesign from "@react-native-vector-icons/ant-design";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import Feather from "@react-native-vector-icons/feather";
import Ionicons from "@react-native-vector-icons/ionicons";
import React, { useContext } from "react";
import { Alert, Switch } from "react-native";

import List from "../../../components/UI/List";
import { CommentSettingsContext } from "../../../contexts/SettingsContexts/CommentSettingsContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../../utils/navigation";

export default function CommentAppearance() {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();

  const {
    voteIndicator,
    toggleVoteIndicator,
    collapseAutoModerator,
    toggleCollapseAutoModerator,
    commentFlairs,
    toggleCommentFlairs,
    showCommentSummary,
    toggleShowCommentSummary,
    collapseCommentSummary,
    toggleCollapseCommentSummary,
    tapToCollapseComment,
    toggleTapToCollapseComment,
    collapseChildrenOnly,
    toggleCollapseChildrenOnly,
    showScrollToNextButton,
    toggleShowScrollToNextButton,
  } = useContext(CommentSettingsContext);

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
        ...(isPro && showCommentSummary
          ? [
              {
                key: "collapseCommentSummary",
                icon: (
                  <Feather name="minimize-2" size={22} color={theme.text} />
                ),
                rightIcon: (
                  <Switch
                    trackColor={{
                      false: theme.iconSecondary,
                      true: theme.iconPrimary,
                    }}
                    value={collapseCommentSummary}
                    onValueChange={() => toggleCollapseCommentSummary()}
                  />
                ),
                text: "Start summary collapsed",
                onPress: () => toggleCollapseCommentSummary(),
              },
            ]
          : []),
        {
          key: "tapToCollapseComment",
          icon: (
            <Ionicons name="chevron-collapse" size={24} color={theme.text} />
          ),
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={tapToCollapseComment}
              onValueChange={() => toggleTapToCollapseComment()}
            />
          ),
          text: "Tap to collapse",
          onPress: () => toggleTapToCollapseComment(),
        },
        {
          key: "collapseChildrenOnly",
          icon: (
            <MaterialCommunityIcons
              name="collapse-all"
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
              value={collapseChildrenOnly}
              onValueChange={() => toggleCollapseChildrenOnly()}
            />
          ),
          text: "Collapse children only",
          onPress: () => toggleCollapseChildrenOnly(),
        },
        {
          key: "showScrollToNextButton",
          icon: <AntDesign name="down-circle" size={24} color={theme.text} />,
          rightIcon: (
            <Switch
              trackColor={{
                false: theme.iconSecondary,
                true: theme.iconPrimary,
              }}
              value={showScrollToNextButton}
              onValueChange={() => toggleShowScrollToNextButton()}
            />
          ),
          text: "Show scroll to next button",
          onPress: () => toggleShowScrollToNextButton(),
        },
      ]}
    />
  );
}
