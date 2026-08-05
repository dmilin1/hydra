import Feather from "@react-native-vector-icons/feather";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialCommunityIcons from "@react-native-vector-icons/material-design-icons";
import Octicons from "@react-native-vector-icons/octicons";

import useCommentActions from "./useCommentActions";
import { Comment, PostDetail } from "../../../../../api/PostDetail";
import { VoteOption } from "../../../../../api/Posts";
import { Theme } from "../../../../../constants/Themes";
import { CommentSwipeOption } from "../../../../../contexts/SettingsContexts/GesturesContext";
import { SlideItem } from "../../../../UI/Slideable";

export function buildCommentSwipeOptions(
  comment: PostDetail | Comment,
  theme: Theme,
  actions: ReturnType<typeof useCommentActions>,
): SlideItem<CommentSwipeOption>[] {
  return [
    {
      name: "upvote",
      icon: <Feather name="arrow-up" />,
      size: 38,
      color: theme.upvote,
      action: () => actions.voteOnComment(VoteOption.UpVote),
    },
    {
      name: "downvote",
      icon: <Feather name="arrow-down" />,
      size: 38,
      color: theme.downvote,
      action: () => actions.voteOnComment(VoteOption.DownVote),
    },
    {
      name: "reply",
      icon: <Octicons name="reply" />,
      color: theme.reply,
      action: actions.replyToComment,
    },
    {
      name: "bookmark",
      icon: <FontAwesome name={comment.saved ? "bookmark" : "bookmark-o"} />,
      color: theme.bookmark,
      action: actions.saveComment,
    },
    {
      name: "share",
      icon: <FontAwesome name="share" />,
      color: theme.share,
      action: actions.shareComment,
    },
    {
      name: "collapse",
      icon: (
        <Ionicons
          name={comment.collapsed ? "chevron-expand" : "chevron-collapse"}
        />
      ),
      color: theme.collapse,
      action: actions.toggleCollapse,
    },
    {
      name: "collapseThread",
      icon: <MaterialCommunityIcons name="arrow-collapse-all" />,
      color: theme.collapse,
      action: actions.collapseCommentThread,
    },
  ];
}
