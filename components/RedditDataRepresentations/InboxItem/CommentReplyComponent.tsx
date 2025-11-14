import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import { CommentReply, setInboxItemNewStatus } from "../../../api/Messages";
import { vote } from "../../../api/PostDetail";
import { VoteOption } from "../../../api/Posts";
import { InboxContext } from "../../../contexts/InboxContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../utils/navigation";
import RenderHtml from "../../HTML/RenderHTML";
import Slideable from "../../UI/Slideable";
import useContextMenu from "../../../utils/useContextMenu";

type CommentReplyComponentProps = {
  commentReply: CommentReply;
  setMessage: (message: CommentReply) => void;
};

export default function CommentReplyComponent({
  commentReply,
  setMessage,
}: CommentReplyComponentProps) {
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);
  const { inboxCount, setInboxCount } = useContext(InboxContext);
  const openContextMenu = useContextMenu();

  const currentVoteColor =
    commentReply.userVote === VoteOption.UpVote
      ? theme.upvote
      : commentReply.userVote === VoteOption.DownVote
        ? theme.downvote
        : theme.subtleText;

  const voteOnMessage = async (voteOption: VoteOption) => {
    const result = await vote(commentReply, voteOption);
    setMessage({
      ...commentReply,
      upvotes: commentReply.upvotes - commentReply.userVote + result,
      userVote: result,
    });
  };

  const toggleSeen = async () => {
    await setInboxItemNewStatus(commentReply, !commentReply.new);
    setInboxCount(inboxCount + (commentReply.new ? -1 : 1));
    setMessage({
      ...commentReply,
      new: !commentReply.new,
    });
  };

  return (
    <Slideable
      options={[
        {
          name: "upvote",
          icon: <Feather name="arrow-up" />,
          color: theme.upvote,
          action: async () => voteOnMessage(VoteOption.UpVote),
        },
        {
          name: "Feather",
          icon: <Feather name="arrow-down" />,
          color: theme.downvote,
          action: async () => voteOnMessage(VoteOption.DownVote),
        },
        {
          name: "markAsRead",
          icon: <Feather name="mail" size={18} color={theme.subtleText} />,
          color: theme.showHide,
          action: () => toggleSeen(),
        },
      ]}
      leftNames={["upvote", "downvote"]}
      rightNames={["markAsRead"]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.messageContainer,
          {
            backgroundColor: theme.background,
          },
        ]}
        onPress={() => {
          setInboxItemNewStatus(commentReply, false);
          setMessage({
            ...commentReply,
            new: false,
          });
          pushURL(commentReply.contextLink);
        }}
        onLongPress={async (e) => {
          if (e.nativeEvent.touches.length > 1) return;
          const result = await openContextMenu({
            options: [
              "Upvote",
              "Downvote",
              ...(commentReply.new ? ["Mark as Read"] : ["Mark as Unread"]),
            ],
          });
          if (result === "Upvote") {
            await voteOnMessage(VoteOption.UpVote);
          } else if (result === "Downvote") {
            await voteOnMessage(VoteOption.DownVote);
          } else if (result === "Mark as Unread" || result === "Mark as Read") {
            toggleSeen();
          }
        }}
      >
        <View style={styles.messageTitleContainer}>
          <Feather
            name="message-square"
            size={18}
            color={commentReply.new ? theme.iconPrimary : theme.subtleText}
          />
          <View style={styles.messageTitleTextContainer}>
            <Text
              numberOfLines={2}
              style={[
                styles.messageTitle,
                {
                  color: theme.verySubtleText,
                },
              ]}
            >
              <Text style={{ color: theme.text }}>
                Reply to your comment in{" "}
              </Text>
              {commentReply.postTitle}
            </Text>
          </View>
        </View>
        <View style={styles.messageBody}>
          <RenderHtml html={commentReply.html} />
        </View>
        <View style={styles.messageFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.subAndAuthorContainer}>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                in{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() =>
                  pushURL(`https://www.reddit.com/r/${commentReply.subreddit}`)
                }
              >
                <Text
                  style={[
                    styles.boldedSmallText,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {commentReply.subreddit}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {" "}
                by{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  pushURL(`https://www.reddit.com/user/${commentReply.author}`)
                }
              >
                <Text
                  style={[
                    styles.boldedSmallText,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {commentReply.author}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.metadataContainer}>
              <Feather
                name={
                  commentReply.userVote === VoteOption.DownVote
                    ? "arrow-down"
                    : "arrow-up"
                }
                size={18}
                color={currentVoteColor}
              />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: currentVoteColor,
                  },
                ]}
              >
                {commentReply.upvotes}
              </Text>
              <Feather name="clock" size={18} color={theme.subtleText} />
              <Text
                style={[
                  styles.metadataText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {commentReply.timeSince}
              </Text>
            </View>
          </View>
          <View style={styles.footerRight} />
        </View>
      </TouchableOpacity>
      <View
        style={[
          styles.spacer,
          {
            backgroundColor: theme.tint,
          },
        ]}
      />
    </Slideable>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  messageTitleContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "center",
  },
  messageTitleTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  messageTitle: {
    fontSize: 14,
  },
  messageBody: {
    flex: 1,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  messageFooter: {
    marginHorizontal: 10,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
  },
  subAndAuthorContainer: {
    flexDirection: "row",
  },
  smallText: {
    fontSize: 14,
  },
  boldedSmallText: {
    fontSize: 14,
    fontWeight: "600",
  },
  metadataContainer: {
    flexDirection: "row",
    marginTop: 7,
    alignItems: "center",
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 3,
    marginRight: 12,
  },
  spacer: {
    height: 10,
  },
});
