import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import PostMedia from "./PostParts/PostMedia";
import { vote } from "../../../api/PostDetail";
import { Post, VoteOption } from "../../../api/Posts";
import { HistoryContext } from "../../../contexts/HistoryContext";
import {
  ThemeContext,
  t,
} from "../../../contexts/SettingsContexts/ThemeContext";
import Slideable from "../../UI/Slideable";

type PostComponentProps = {
  initialPostState: Post;
};

export default function PostComponent({
  initialPostState,
}: PostComponentProps) {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);

  const [post, setPost] = useState(initialPostState);

  const currentVoteColor =
    post.userVote === VoteOption.UpVote
      ? theme.upvote
      : post.userVote === VoteOption.DownVote
        ? theme.downvote
        : theme.subtleText;

  const voteOnPost = async (voteOption: VoteOption) => {
    const result = await vote(post, voteOption);
    setPost({
      ...post,
      upvotes: post.upvotes - post.userVote + result,
      userVote: result,
    });
  };

  return (
    <Slideable
      left={[
        {
          icon: <AntDesign name="arrowup" />,
          color: theme.upvote,
          action: async () => await voteOnPost(VoteOption.UpVote),
        },
        {
          icon: <AntDesign name="arrowdown" />,
          color: theme.downvote,
          action: async () => await voteOnPost(VoteOption.DownVote),
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        style={t(styles.postContainer, {
          backgroundColor: theme.background,
        })}
        onPress={() => {
          history.pushPath(post.link);
        }}
      >
        <Text
          numberOfLines={2}
          style={t(styles.postTitle, {
            color: theme.text,
          })}
        >
          {post.title}
        </Text>
        <View style={styles.postBody}>
          <PostMedia post={post} maxLines={3} renderHTML={false} />
        </View>
        <View style={styles.postFooter}>
          <View style={styles.footerLeft}>
            <View style={styles.subAndAuthorContainer}>
              <Text
                style={t(styles.smallText, {
                  color: theme.subtleText,
                })}
              >
                in{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() =>
                  history.pushPath(`https://www.reddit.com/r/${post.subreddit}`)
                }
              >
                <Text
                  style={t(styles.boldedSmallText, {
                    color: theme.subtleText,
                  })}
                >
                  {post.subreddit}
                </Text>
              </TouchableOpacity>
              <Text
                style={t(styles.smallText, {
                  color: theme.subtleText,
                })}
              >
                {" "}
                by{" "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  history.pushPath(`https://www.reddit.com/user/${post.author}`)
                }
              >
                <Text
                  style={t(styles.boldedSmallText, {
                    color: theme.subtleText,
                  })}
                >
                  {post.author}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.metadataContainer}>
              <Feather
                name={
                  post.userVote === VoteOption.DownVote
                    ? "arrow-down"
                    : "arrow-up"
                }
                size={18}
                color={currentVoteColor}
              />
              <Text
                style={t(styles.metadataText, {
                  color: currentVoteColor,
                })}
              >
                {post.upvotes}
              </Text>
              <Feather
                name="message-square"
                size={18}
                color={theme.subtleText}
              />
              <Text
                style={t(styles.metadataText, {
                  color: theme.subtleText,
                })}
              >
                {post.commentCount}
              </Text>
              <Feather name="clock" size={18} color={theme.subtleText} />
              <Text
                style={t(styles.metadataText, {
                  color: theme.subtleText,
                })}
              >
                {post.timeSince}
              </Text>
            </View>
          </View>
          <View style={styles.footerRight} />
        </View>
      </TouchableOpacity>
      <View
        style={t(styles.spacer, {
          backgroundColor: theme.divider,
        })}
      />
    </Slideable>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  postTitle: {
    fontSize: 17,
    paddingHorizontal: 10,
  },
  postBody: {
    flex: 1,
    marginVertical: 5,
  },
  postFooter: {
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
