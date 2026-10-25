import AntDesign from "@react-native-vector-icons/ant-design";
import Feather from "@react-native-vector-icons/feather";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, Text, AccessibilityInfo } from "react-native";
import { openExternalLink } from "../../../utils/openExternalLink";

import CompactPostMedia from "./PostParts/CompactPostMedia";
import PostMedia from "./PostParts/PostMedia";
import SubredditIcon from "./PostParts/SubredditIcon";
import { vote } from "../../../api/PostDetail";
import { ToastContext } from "../../../contexts/ToastContext";
import {
  adjustedScore,
  createOptimisticVoteController,
  displayOptimisticVote,
  type VoteValue,
} from "../../../utils/optimisticVote";
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
import URL from "../../../utils/URL";
import RedditURL from "../../../utils/RedditURL";
import { useRoute, useURLNavigation } from "../../../utils/navigation";
import Slideable from "../../UI/Slideable";
import { FiltersContext } from "../../../contexts/SettingsContexts/FiltersContext";
import { GesturesContext } from "../../../contexts/SettingsContexts/GesturesContext";
import useComponentActions from "../../../utils/useComponentActions";
import useContextMenu from "../../../utils/useContextMenu";
import { Touchable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { shareURL } from "../../../utils/sharing";
import { textDirectionStyle } from "../../../utils/textDirection";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type PostComponentProps = {
  post: Post;
  updatePost: (update: (current: Post) => Post) => void;
  deletePost?: () => void;
  onPostOpen?: (url: string) => void;
};

export default function PostComponent({
  post: incomingPost,
  updatePost,
  deletePost,
  onPostOpen,
}: PostComponentProps) {
  const [optimisticVote, setOptimisticVote] = useState<{
    postName: string;
    vote: VoteValue;
  } | null>(null);

  const localVote =
    optimisticVote?.postName === incomingPost.name
      ? optimisticVote.vote
      : null;

  const displayed = displayOptimisticVote(
    incomingPost.upvotes,
    incomingPost.userVote as VoteValue,
    localVote,
  );

  const post =
    localVote === null
      ? incomingPost
      : {
        ...incomingPost,
        upvotes: displayed.score,
        userVote: displayed.vote as VoteOption,
      };
  const { params } = useRoute<URLRoutes | "SearchPage">();
  const { pushURL } = useURLNavigation();
  const { theme } = useContext(ThemeContext);
  const {
    postCompactMode,
    subredditAtTop,
    postTitleLength,
    postTextLength,
    showPostFlair,
    showFeedVoteButtons,
    showThumbnailsOnRightSide,
  } = useContext(PostSettingsContext);

  const { postSwipeOptions } = useContext(GesturesContext);

  const { toggleFilterSubreddit } = useContext(FiltersContext);

  const openContextMenu = useContextMenu();

  const isOnMultiSubredditPage =
    params && "url" in params && params.url
      ? new RedditURL(params.url).isCombinedSubredditFeed()
      : true;

  const seen = isPostSeen(post);

  const [_, rerender] = useState(0);

  const upvoteScale = useSharedValue(1);
  const downvoteScale = useSharedValue(1);

  const upvoteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: upvoteScale.value }],
  }));

  const downvoteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: downvoteScale.value }],
  }));

  const animateVote = (voteOption: VoteOption) => {
    const scale =
      voteOption === VoteOption.UpVote ? upvoteScale : downvoteScale;

    cancelAnimation(scale);
    scale.value = 1;

    scale.value = withSequence(
      withTiming(1.20, { duration: 75 }),
      withSpring(1, {
        stiffness: 500,
        damping: 23,
        mass: 0.7,
        overshootClamping: false,
      }),
    );
  };

  const { showToast } = useContext(ToastContext);

  const updatePostRef = useRef(updatePost);
  const showToastRef = useRef(showToast);

  updatePostRef.current = updatePost;
  showToastRef.current = showToast;

  // Keep the latest post available to asynchronous vote requests.
  const latestPostRef = useRef(incomingPost);
  latestPostRef.current = incomingPost;

  const voteControllerRef = useRef<{
    postName: string;
    controller: ReturnType<typeof createOptimisticVoteController>;
  } | null>(null);

  // Cleanup prevents queued requests and callbacks from an old post.
  useEffect(() => {
    return () => {
      if (voteControllerRef.current?.postName === incomingPost.name) {
        voteControllerRef.current.controller.invalidate();
        voteControllerRef.current = null;
      }
    };
  }, [incomingPost.name]);

  const getOrCreateVoteController = () => {
    const existing = voteControllerRef.current;

    if (existing?.postName === incomingPost.name) {
      return existing.controller;
    }

    existing?.controller.invalidate();

    const postName = incomingPost.name;

    const controller = createOptimisticVoteController(
      latestPostRef.current.userVote as VoteValue,
      async (confirmed, next) => {
        const current = latestPostRef.current;

        if (current.name !== postName) {
          throw new Error("Vote controller no longer matches this post");
        }

        const result = await vote(
          { ...current, userVote: confirmed as VoteOption },
          next as VoteOption,
        );

        if (result !== next) {
          throw new Error("Unexpected vote result");
        }
      },
      (next) => {
        if (voteControllerRef.current?.postName !== postName) return;

        setOptimisticVote({
          postName,
          vote: next,
        });
      },
      () => {
        if (voteControllerRef.current?.postName !== postName) return;

        showToastRef.current({
          title: "Vote couldn't be confirmed",
          body: "Your vote wasn't saved. Please try again.",
        });
      },
      (confirmed) => {
        if (voteControllerRef.current?.postName !== postName) return;

        updatePostRef.current((current) => {
          if (current.name !== postName) return current;

          return {
            ...current,
            upvotes: adjustedScore(
              current.upvotes,
              current.userVote as VoteValue,
              confirmed,
            ),
            userVote: confirmed as VoteOption,
          };
        });
      },
    );

    voteControllerRef.current = { postName, controller };
    return controller;
  };

  const {
    accessibilityActions,
    handleAction,
    handleAccessibilityAction,
    handleLongPress,
  } = useComponentActions([
    {
      label: "Read post contents",
      isLongPressOption: false,
      handle: async () => {
        let text = "";
        if (post.externalLink) {
          text += `An external link to ${new URL(post.externalLink).getPrettyHostName()}. `;
        }
        if (post.text.trim().length > 0) {
          text += `Post contents: ${post.text.trim()}. `;
        }
        if (post.videos.length > 0) {
          text += "A video. ";
        } else if (post.images.length > 0) {
          text += `${post.images.length} ${post.images.length === 1 ? "image" : "images"}. `;
        }
        if (post.poll) {
          text += "A poll. ";
        }
        AccessibilityInfo.announceForAccessibility(
          text.length > 0 ? text : "No post contents",
        );
      },
    },
    {
      label: `Open external link to ${post.externalLink ? new URL(post.externalLink).getPrettyHostName() : ""}`,
      isAllowed: !!post.externalLink,
      isLongPressOption: false,
      handle: async () => {
        if (!post.externalLink) return;
        try {
          new RedditURL(post.externalLink);
          pushURL(post.externalLink);
        } catch (_) {
          openExternalLink(post.externalLink);
        }
      },
    },
    {
      label: "Upvote",
      handle: async () => await voteOnPost(VoteOption.UpVote),
    },
    {
      label: "Downvote",
      handle: async () => await voteOnPost(VoteOption.DownVote),
    },
    {
      label: seen ? "Mark as Unread" : "Mark as Read",
      handle: async () => setSeenValue(!seen),
    },
    {
      label: "Filter Subreddit",
      isAllowed: !!deletePost,
      handle: async () => {
        const result = await openContextMenu({
          options: [
            "Filter for a day",
            "Filter for a week",
            "Filter forever",
          ] as const,
        });
        if (!result) return;
        let expiresAt: number | true;
        if (result === "Filter for a day") {
          expiresAt = Date.now() + 24 * 60 * 60 * 1000;
        } else if (result === "Filter for a week") {
          expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        } else {
          expiresAt = true;
        }
        toggleFilterSubreddit(post.subreddit, expiresAt);
        deletePost?.();
      },
    },
    {
      label: post.saved ? "Unsave" : "Save",
      handle: async () => {
        const nextSaved = !post.saved;
        const postName = post.name;

        await saveItem(post, nextSaved);

        updatePostRef.current((current) =>
          current.name === postName
            ? { ...current, saved: nextSaved }
            : current,
        );
      },
    },
    {
      label: "Share",
      handle: async () => {
        await shareURL(post.link);
      },
    },
  ]);

  const currentVoteColor =
    post.userVote === VoteOption.UpVote
      ? theme.upvote
      : post.userVote === VoteOption.DownVote
        ? theme.downvote
        : theme.subtleText;

  const setSeenValue = async (value: boolean) => {
    if (value) {
      await markPostSeen(post);
    } else {
      await markPostUnseen(post);
    }
    rerender((prev) => prev + 1);
  };

  const voteOnPost = (voteOption: VoteOption) => {
    getOrCreateVoteController().press(voteOption);
  };

  const accessibilityLabel = useMemo(() => {
    let text = post.title.trim();
    if (post.videos.length > 0) {
      text += ` with a video`;
    } else if (post.images.length > 0) {
      text +=
        ` with ${post.images.length} ` +
        (post.images.length === 1 ? "image" : "images");
    }
    if (post.poll) {
      text += ` with a poll`;
    }
    if (post.externalLink) {
      text += ` with an external link to ${new URL(post.externalLink).getPrettyHostName()}`;
    }
    text += ` with ${post.upvotes} ${post.upvotes === 1 ? "upvote" : "upvotes"} and ${post.commentCount} ${post.commentCount === 1 ? "comment" : "comments"}`;
    text += ` by ${post.author}`;
    text += ` in the ${post.subreddit} subreddit`;
    text += `. Posted ${post.timeSince}`;
    return text;
  }, [post.id]);

  return (
    <PostInteractionProvider
      /**
       * memoize so consumers don't re-render when this component re-renders
       */
      onPostInteraction={useMemo(
        () => () => {
          setSeenValue(true);
        },
        [post.id],
      )}
    >
      <Slideable
        options={[
          {
            name: "upvote",
            icon: <Feather name="arrow-up" />,
            size: 38,
            color: theme.upvote,
            action: () => handleAction("Upvote"),
          },
          {
            name: "downvote",
            icon: <Feather name="arrow-down" />,
            size: 38,
            color: theme.downvote,
            action: () => handleAction("Downvote"),
          },
          {
            name: "hide",
            icon: <Feather name={seen ? "eye-off" : "eye"} />,
            color: theme.showHide,
            action: () =>
              handleAction(seen ? "Mark as Unread" : "Mark as Read"),
          },
          {
            name: "bookmark",
            icon: <FontAwesome name={post.saved ? "bookmark" : "bookmark-o"} />,
            color: theme.bookmark,
            action: () => handleAction(post.saved ? "Unsave" : "Save"),
          },
          {
            name: "share",
            icon: <FontAwesome name="share" />,
            color: theme.share,
            action: () => handleAction("Share"),
          },
        ]}
        shortLeftName={postSwipeOptions.right}
        longLeftName={postSwipeOptions.farRight}
        shortRightName={postSwipeOptions.left}
        longRightName={postSwipeOptions.farLeft}
      >
        <Touchable
          accessible={true}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          accessibilityHint="Open the post"
          accessibilityActions={accessibilityActions}
          onAccessibilityAction={handleAccessibilityAction}
          style={[
            styles.postContainer,
            {
              backgroundColor: theme.background,
              flexDirection: postCompactMode
                ? showThumbnailsOnRightSide
                  ? "row-reverse"
                  : "row"
                : "column",
              justifyContent: showThumbnailsOnRightSide
                ? "space-between"
                : "flex-start",
              opacity: seen ? 0.75 : 1,
            },
          ]}
          onPress={() => {
            setSeenValue(true);
            if (onPostOpen) {
              onPostOpen(post.link);
            } else {
              pushURL(post.link);
            }
          }}
          onLongPress={async () => {
            handleLongPress();
          }}
        >
          {postCompactMode && (
            <View>
              <CompactPostMedia post={post} />
            </View>
          )}
          <View
            style={[
              styles.bodyContainer,
              postCompactMode &&
              showFeedVoteButtons && {
                flex: 1,
                minWidth: 0,
              },
            ]}
          >
            {subredditAtTop && isOnMultiSubredditPage && (
              <Touchable
                style={[
                  styles.subredditAtTopContainer,
                  styles.subredditContainer,
                ]}
                activeOpacity={0.5}
                onPress={() =>
                  pushURL(`https://www.reddit.com/r/${post.subreddit}`)
                }
              >
                <SubredditIcon subredditIcon={post.subredditIcon} />
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
              </Touchable>
            )}
            <Text
              numberOfLines={postTitleLength}
              style={[
                {
                  fontSize: postCompactMode ? 16 : 17,
                  color: theme.text,
                },
                textDirectionStyle(post.title),
              ]}
            >
              {post.title.trim()}
            </Text>
            {showPostFlair && post.postFlair && (
              <View
                style={[
                  styles.postFlairContainer,
                  {
                    marginTop: postCompactMode ? 2 : 5,
                    marginBottom: postCompactMode ? -3 : -5,
                    backgroundColor: theme.divider,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.postFlair,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {post.postFlair.text}
                </Text>
              </View>
            )}
            <View
              style={[
                styles.postBody,
                {
                  marginVertical: postCompactMode ? 3 : 5,
                  marginHorizontal: -10,
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
            <View style={showFeedVoteButtons ? styles.feedFooter : undefined}>
              <View style={styles.footerLeft}>
                <View
                  style={[
                    styles.subAndAuthorContainer,
                    showFeedVoteButtons && { flexWrap: "nowrap" },
                  ]}
                >
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
                  {!subredditAtTop && isOnMultiSubredditPage && (
                    <Touchable
                      style={styles.subredditContainer}
                      activeOpacity={0.5}
                      onPress={() =>
                        pushURL(`https://www.reddit.com/r/${post.subreddit}`)
                      }
                    >
                      <SubredditIcon subredditIcon={post.subredditIcon} />
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
                    </Touchable>
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
                  <Touchable
                    style={
                      showFeedVoteButtons
                        ? { flexShrink: 1, minWidth: 0 }
                        : undefined
                    }
                    activeOpacity={0.5}
                    onPress={() =>
                      pushURL(`https://www.reddit.com/user/${post.author}`)
                    }
                  >
                    <Text
                      numberOfLines={showFeedVoteButtons ? 1 : undefined}
                      ellipsizeMode="tail"
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
                  </Touchable>
                </View>
                <View style={styles.metadataContainer}>
                  <Feather
                    name={
                      !showFeedVoteButtons &&
                        post.userVote === VoteOption.DownVote
                        ? "arrow-down"
                        : "arrow-up"
                    }
                    size={18}
                    color={currentVoteColor}
                  />
                  <Text
                    style={[styles.metadataText, { color: currentVoteColor }]}
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
                    numberOfLines={showFeedVoteButtons ? 1 : undefined}
                    ellipsizeMode="tail"
                    style={[
                      styles.metadataText,
                      { color: theme.subtleText },
                      showFeedVoteButtons && {
                        flexShrink: 1,
                        minWidth: 0,
                      },
                    ]}
                  >
                    {post.timeSince}
                  </Text>
                </View>
              </View>
              {showFeedVoteButtons && (
                <View style={styles.feedVoteButtons}>
                  <Animated.View style={upvoteAnimatedStyle}>
                    <Touchable
                      style={[
                        styles.feedVoteButton,
                        postCompactMode && styles.compactFeedVoteButton,
                        post.userVote === VoteOption.UpVote && {
                          backgroundColor: theme.upvote,
                        },
                      ]}
                      hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
                      onPress={() => {
                        animateVote(VoteOption.UpVote);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        voteOnPost(VoteOption.UpVote);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={
                        post.userVote === VoteOption.UpVote
                          ? "Remove upvote"
                          : "Upvote"
                      }
                      accessibilityState={{
                        selected: post.userVote === VoteOption.UpVote,
                      }}
                    >
                      <Feather
                        name="arrow-up"
                        size={postCompactMode ? 24 : 28}
                        color={
                          post.userVote === VoteOption.UpVote
                            ? theme.text
                            : theme.subtleText
                        }
                      />
                    </Touchable>
                  </Animated.View>
                  <Animated.View style={downvoteAnimatedStyle}>
                    <Touchable
                      style={[
                        styles.feedVoteButton,
                        postCompactMode && styles.compactFeedVoteButton,
                        post.userVote === VoteOption.DownVote && {
                          backgroundColor: theme.downvote,
                        },
                      ]}
                      hitSlop={{ top: 3, bottom: 3, left: 3, right: 3 }}
                      onPress={() => {
                        animateVote(VoteOption.DownVote);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        voteOnPost(VoteOption.DownVote);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={
                        post.userVote === VoteOption.DownVote
                          ? "Remove downvote"
                          : "Downvote"
                      }
                      accessibilityState={{
                        selected: post.userVote === VoteOption.DownVote,
                      }}
                    >
                      <Feather
                        name="arrow-down"
                        size={postCompactMode ? 24 : 28}
                        color={
                          post.userVote === VoteOption.DownVote
                            ? theme.text
                            : theme.subtleText
                        }
                      />
                    </Touchable>
                  </Animated.View>
                </View>
              )}
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
        </Touchable>
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
  feedFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  feedVoteButtons: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: 5,
  },
  feedVoteButton: {
    width: 38,
    height: 38,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  compactFeedVoteButton: {
    width: 30,
    height: 30,
  },
  postContainer: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  bodyContainer: {
    flexShrink: 1,
  },
  subredditContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subredditAtTopContainer: {
    marginBottom: 5,
  },
  subredditAtTopText: {
    fontSize: 12,
  },
  postTitle: {
    paddingHorizontal: 10,
  },
  postFlairContainer: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  postFlair: {},
  postBody: {
    flex: 1,
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
