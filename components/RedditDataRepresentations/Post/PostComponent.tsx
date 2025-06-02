import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import React, { useContext, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Share } from "react-native";

import CompactPostMedia from "./PostParts/CompactPostMedia";
import PostMedia from "./PostParts/PostMedia";
import SubredditIcon from "./PostParts/SubredditIcon";
import { vote } from "../../../api/PostDetail";
import { Post, VoteOption } from "../../../api/Posts";
import { saveItem } from "../../../api/Save";
import { URLRoutes } from "../../../app/stack";
import { PostInteractionProvider } from "../../../contexts/PostInteractionContext";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  isPostSeen,
  markPostSeen,
  markPostUnseen,
} from "../../../db/functions/SeenPosts";
import RedditURL, { PageType } from "../../../utils/RedditURL";
import { useRoute, useURLNavigation } from "../../../utils/navigation";
import useContextMenu from "../../../utils/useContextMenu";
import Slideable from "../../UI/Slideable";

type PostComponentProps = {
  post: Post;
  setPost: (post: Post) => void;
};

export default function PostComponent({ post, setPost }: PostComponentProps) {
  const { params } = useRoute<URLRoutes>();
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);
  const { postCompactMode, subredditAtTop, postTitleLength, postTextLength } =
    useContext(PostSettingsContext);

  const redditURL = params?.url ? new RedditURL(params.url) : null;

  const shouldShowSubreddits =
    !redditURL ||
    redditURL.getPageType() !== PageType.SUBREDDIT ||
    ["popular", "all"].includes(redditURL.getSubreddit());

  const seen = isPostSeen(post);

  const [_, rerender] = useState(0);

  const openContextMenu = useContextMenu();

  const currentVoteColor =
    post.userVote === VoteOption.UpVote
      ? theme.upvote
      : post.userVote === VoteOption.DownVote
        ? theme.downvote
        : theme.subtleText;

  const setSeenValue = (value: boolean) => {
    if (value) {
      markPostSeen(post);
    } else {
      markPostUnseen(post);
    }
    rerender((prev) => prev + 1);
  };

  const voteOnPost = async (voteOption: VoteOption) => {
    const result = await vote(post, voteOption);
    setPost({
      ...post,
      upvotes: post.upvotes - post.userVote + result,
      userVote: result,
    });
  };

  return (
    <PostInteractionProvider
      onPostInteraction={() => {
        setSeenValue(true);
      }}
    >
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
        right={[
          {
            icon: <Feather name={seen ? "eye-off" : "eye"} />,
            color: theme.showHide,
            action: async () => {
              setSeenValue(!seen);
            },
          },
          {
            icon: <FontAwesome name={post.saved ? "bookmark" : "bookmark-o"} />,
            color: theme.bookmark,
            action: async () => {
              await saveItem(post, !post.saved);
              setPost({ ...post, saved: !post.saved });
            },
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.postContainer,
            {
              backgroundColor: theme.background,
              flexDirection: postCompactMode ? "row" : "column",
              opacity: seen ? 0.75 : 1,
            },
          ]}
          onPress={() => {
            setSeenValue(true);
            pushURL(post.link);
          }}
          onLongPress={async (e) => {
            if (e.nativeEvent.touches.length > 1) return;
            const result = await openContextMenu({
              options: ["Share"],
            });
            if (result === "Share") {
              Share.share({ url: post.link });
            }
          }}
        >
          {postCompactMode && (
            <View style={styles.compactMediaContainer}>
              <CompactPostMedia post={post} />
            </View>
          )}
          <View style={styles.bodyContainer}>
            {subredditAtTop && shouldShowSubreddits && (
              <TouchableOpacity
                style={[
                  styles.subredditAtTopContainer,
                  styles.subredditContainer,
                ]}
                activeOpacity={0.5}
                onPress={() =>
                  pushURL(`https://www.reddit.com/r/${post.subreddit}`)
                }
              >
                <SubredditIcon post={post} />
                <Text
                  style={[
                    styles.subredditAtTopText,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {post.subreddit}
                </Text>
              </TouchableOpacity>
            )}
            <Text
              numberOfLines={postTitleLength}
              style={[
                styles.postTitle,
                {
                  fontSize: postCompactMode ? 16 : 17,
                  color: theme.text,
                },
              ]}
            >
              {post.title.trim()}
            </Text>
            <View
              style={[
                styles.postBody,
                {
                  marginVertical: postCompactMode ? 3 : 5,
                },
              ]}
            >
              {!postCompactMode && (
                <PostMedia
                  post={post}
                  maxLines={postTextLength}
                  renderHTML={false}
                />
              )}
            </View>
            <View style={styles.postFooter}>
              <View style={styles.footerLeft}>
                <View style={styles.subAndAuthorContainer}>
                  {post.isStickied && (
                    <AntDesign
                      name="pushpin"
                      style={[
                        styles.stickiedIcon,
                        {
                          color: theme.moderator,
                        },
                      ]}
                    />
                  )}
                  {!subredditAtTop && shouldShowSubreddits && (
                    <>
                      <TouchableOpacity
                        style={styles.subredditContainer}
                        activeOpacity={0.5}
                        onPress={() =>
                          pushURL(`https://www.reddit.com/r/${post.subreddit}`)
                        }
                      >
                        <SubredditIcon post={post} />
                        <Text
                          style={[
                            styles.boldedSmallText,
                            {
                              color: theme.subtleText,
                            },
                          ]}
                        >
                          {post.subreddit}{" "}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                  <Text
                    style={[
                      styles.smallText,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    by{" "}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      pushURL(`https://www.reddit.com/user/${post.author}`)
                    }
                  >
                    <Text
                      style={[
                        styles.boldedSmallText,
                        {
                          color: post.isModerator
                            ? theme.moderator
                            : theme.subtleText,
                        },
                      ]}
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
                    style={[
                      styles.metadataText,
                      {
                        color: currentVoteColor,
                      },
                    ]}
                  >
                    {post.upvotes}
                  </Text>
                  <Feather
                    name="message-square"
                    size={18}
                    color={theme.subtleText}
                  />
                  <Text
                    style={[
                      styles.metadataText,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    {post.commentCount}
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
                    {post.timeSince}
                  </Text>
                </View>
              </View>
              <View style={styles.footerRight} />
            </View>
          </View>
          {post.saved && (
            <View
              style={[
                styles.bookmarkNotch,
                {
                  borderColor: theme.bookmark,
                },
              ]}
            />
          )}
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: theme.divider,
            height: postCompactMode ? 1 : 10,
          }}
        />
      </Slideable>
    </PostInteractionProvider>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  compactMediaContainer: {
    marginLeft: 10,
  },
  bodyContainer: {
    flex: 1,
  },
  subredditContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subredditAtTopContainer: {
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  subredditAtTopText: {
    fontSize: 12,
  },
  postTitle: {
    paddingHorizontal: 10,
  },
  postBody: {
    flex: 1,
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
    flexWrap: "wrap",
    alignItems: "center",
  },
  stickiedIcon: {
    marginRight: 7,
    fontSize: 16,
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
  bookmarkNotch: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderBottomWidth: 15,
    borderLeftColor: "transparent",
  },
});
