import { AntDesign, FontAwesome, Octicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, {
  useContext,
  useState,
  useMemo,
  forwardRef,
  ForwardedRef,
  useRef,
  ElementRef,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Alert,
  Share,
} from "react-native";

import {
  Comment,
  deleteUserContent,
  PostDetail,
  reloadComment,
  vote,
} from "../../../../api/PostDetail";
import { VoteOption } from "../../../../api/Posts";
import { saveItem } from "../../../../api/Save";
import { AccountContext } from "../../../../contexts/AccountContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import { CommentSettingsContext } from "../../../../contexts/SettingsContexts/CommentSettingsContext";
import { FiltersContext } from "../../../../contexts/SettingsContexts/FiltersContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import { LoadMoreCommentsFunc } from "../../../../pages/PostDetails";
import RedditURL from "../../../../utils/RedditURL";
import { useURLNavigation } from "../../../../utils/navigation";
import useContextMenu from "../../../../utils/useContextMenu";
import RenderHtml from "../../../HTML/RenderHTML";
import EditComment from "../../../Modals/EditComment";
import NewComment from "../../../Modals/NewComment";
import SelectText from "../../../Modals/SelectText";
import Slideable from "../../../UI/Slideable";

interface CommentProps {
  loadMoreComments?: LoadMoreCommentsFunc;
  comment: PostDetail | Comment;
  index: number;
  scrollChange?: (y: number) => void;
  displayInList?: boolean; // Changes render style for use in something like a list of user comments,
  changeComment: (comment: Comment) => void;
  deleteComment: (comment: Comment) => void;

  // This comment prop ref thing is horrific. Don't do it. We're using it so
  // the post details page can reach into the comments inside of it to get to
  // the element it needs to scroll to.
  commentPropRef?: { current: ElementRef<typeof TouchableHighlight> | null };
}

export function CommentComponent({
  loadMoreComments,
  comment,
  index,
  scrollChange,
  displayInList,
  changeComment,
  deleteComment,
  commentPropRef,
}: CommentProps) {
  const { theme } = useContext(ThemeContext);
  const { voteIndicator, collapseAutoModerator, commentFlairs } = useContext(
    CommentSettingsContext,
  );
  const { doesCommentPassTextFilter } = useContext(FiltersContext);
  const { pushURL } = useURLNavigation();
  const { setModal } = useContext(ModalContext);
  const { currentUser } = useContext(AccountContext);
  const showContextMenu = useContextMenu();

  const isFiltered =
    comment.type === "comment" &&
    !displayInList &&
    !doesCommentPassTextFilter(comment);

  const commentRef = useRef<ElementRef<typeof TouchableHighlight>>(null);

  if (commentPropRef) {
    commentPropRef.current = commentRef.current;
  }

  const [collapsed, setCollapsed] = useState(
    collapseAutoModerator &&
      comment.depth === 0 &&
      comment.author === "AutoModerator",
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const voteOnComment = async (voteOption: VoteOption) => {
    if (comment.type === "comment") {
      const result = await vote(comment, voteOption);
      changeComment?.({
        ...comment,
        userVote: result,
        upvotes: comment.upvotes - comment.userVote + result,
        renderCount: comment.renderCount + 1,
      });
    }
  };

  const saveComment = async () => {
    if (comment.type !== "comment") return;
    await saveItem(comment, !comment.saved);
    changeComment?.({
      ...comment,
      saved: !comment.saved,
      renderCount: comment.renderCount + 1,
    });
  };

  const replyToComment = () => {
    setModal(
      <NewComment
        parent={comment}
        contentSent={() =>
          setTimeout(async () => {
            const reloadedComment = await reloadComment(comment);
            changeComment?.(reloadedComment);
          }, 5_000)
        }
      />,
    );
  };

  const editComment = () => {
    if (comment.type !== "comment") return;
    setModal(
      <EditComment
        edit={comment}
        contentSent={async () => {
          const reloadedComment = await reloadComment(comment);
          changeComment?.(reloadedComment);
        }}
      />,
    );
  };

  const confirmDeleteComment = () => {
    if (comment.type !== "comment") return;
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserContent(comment);
              deleteComment(comment);
            } catch (_) {
              alert("Failed to delete comment");
            }
          },
        },
      ],
    );
  };

  const showCommentOptions = async () => {
    const options = [
      "Upvote",
      "Downvote",
      "Select Text",
      "Reply",
      ...(comment.saved ? ["Unsave"] : ["Save"]),
      ...(currentUser?.userName === comment.author ? ["Edit", "Delete"] : []),
      "Share",
    ];
    const result = await showContextMenu({ options });

    if (result === "Upvote") {
      await voteOnComment(VoteOption.UpVote);
    } else if (result === "Downvote") {
      await voteOnComment(VoteOption.DownVote);
    } else if (result === "Reply") {
      replyToComment();
    } else if (result === "Save" || result === "Unsave") {
      saveComment();
    } else if (result === "Edit") {
      editComment();
    } else if (result === "Delete") {
      confirmDeleteComment();
    } else if (result === "Select Text") {
      setModal(<SelectText text={comment.text} />);
    } else if (result === "Share") {
      Share.share({ url: new RedditURL(comment.link).toString() });
    }
  };

  return useMemo(
    () =>
      isFiltered ? null : (
        <View key={comment.id}>
          {comment.depth >= 0 && (
            <Slideable
              xScrollToEngage={15}
              left={[
                {
                  icon: <AntDesign name="arrowup" />,
                  color: theme.upvote,
                  action: async () => await voteOnComment(VoteOption.UpVote),
                },
                {
                  icon: <AntDesign name="arrowdown" />,
                  color: theme.downvote,
                  action: async () => await voteOnComment(VoteOption.DownVote),
                },
              ]}
              right={[
                {
                  icon: <Octicons name="reply" />,
                  color: theme.reply,
                  action: () => replyToComment(),
                },
                {
                  icon: (
                    <FontAwesome
                      name={comment.saved ? "bookmark" : "bookmark-o"}
                    />
                  ),
                  color: theme.bookmark,
                  action: () => saveComment(),
                },
              ]}
            >
              <TouchableHighlight
                ref={(ref) => {
                  commentRef.current = ref;
                  if (commentPropRef) {
                    commentPropRef.current = ref;
                  }
                }}
                activeOpacity={1}
                underlayColor={theme.tint}
                onPress={() => {
                  if (displayInList) {
                    if (comment.type === "comment") {
                      pushURL(
                        new RedditURL(comment.link)
                          .setQueryParams({ context: "10" })
                          .toString(),
                      );
                    }
                  } else {
                    commentRef.current?.measureInWindow(
                      (_x, y, _width_, _height) => {
                        if (!collapsed && scrollChange) {
                          scrollChange(y);
                        }
                      },
                    );
                    setCollapsed(!collapsed);
                  }
                }}
                onLongPress={() => showCommentOptions()}
                style={[
                  styles.outerCommentContainer,
                  displayInList
                    ? styles.outerCommentContainerDisplayInList
                    : {},
                  {
                    marginLeft: 10 * comment.depth,
                    borderTopColor: theme.divider,
                  },
                ]}
              >
                <View
                  key={index}
                  style={[
                    styles.commentContainer,
                    displayInList ? styles.commentContainerDisplayInList : {},
                    {
                      borderLeftWidth: comment.depth === 0 ? 0 : 1,
                      borderLeftColor:
                        theme.commentDepthColors[
                          (comment.depth - 1) % theme.commentDepthColors.length
                        ],
                      borderRightColor:
                        comment.userVote === VoteOption.UpVote
                          ? theme.upvote
                          : theme.downvote,
                      borderRightWidth:
                        voteIndicator && comment.userVote !== VoteOption.NoVote
                          ? 1
                          : 0,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.topBar,
                      {
                        marginBottom: collapsed ? 0 : 8,
                      },
                    ]}
                  >
                    {comment.isStickied && (
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
                    <TouchableOpacity
                      onPress={() => pushURL(`/user/${comment.author}`)}
                    >
                      <Text
                        style={[
                          styles.author,
                          {
                            color: comment.isOP
                              ? theme.iconOrTextButton
                              : comment.isModerator
                                ? theme.moderator
                                : theme.text,
                          },
                        ]}
                      >
                        {comment.author}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.upvoteContainer}
                      onPress={() => voteOnComment(VoteOption.UpVote)}
                    >
                      <AntDesign
                        name={
                          comment.userVote === VoteOption.DownVote
                            ? "arrowdown"
                            : "arrowup"
                        }
                        size={14}
                        color={
                          comment.userVote === VoteOption.UpVote
                            ? theme.upvote
                            : comment.userVote === VoteOption.DownVote
                              ? theme.downvote
                              : theme.subtleText
                        }
                      />
                      <Text
                        style={[
                          styles.upvoteText,
                          {
                            color:
                              comment.userVote === VoteOption.UpVote
                                ? theme.upvote
                                : comment.userVote === VoteOption.DownVote
                                  ? theme.downvote
                                  : theme.subtleText,
                          },
                        ]}
                      >
                        {comment.scoreHidden && !comment.userVote
                          ? "-"
                          : comment.upvotes}
                      </Text>
                    </TouchableOpacity>
                    {commentFlairs && comment.flair && (
                      <View
                        style={[
                          styles.flairContainer,
                          {
                            backgroundColor: theme.divider,
                          },
                        ]}
                      >
                        {comment.flair.emojis.map((emoji, index) => (
                          <Image
                            key={index}
                            source={{ uri: emoji }}
                            style={styles.flairEmoji}
                          />
                        ))}
                        {comment.flair.text && (
                          <Text
                            style={[
                              styles.flairText,
                              {
                                color: theme.text,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {comment.flair.text}
                          </Text>
                        )}
                      </View>
                    )}
                    <View style={styles.topBarEnd}>
                      <Text
                        style={[
                          styles.upvoteText,
                          {
                            color: theme.subtleText,
                          },
                        ]}
                      >
                        {comment.shortTimeSince}
                      </Text>
                    </View>
                  </View>
                  {!collapsed ? (
                    <View style={styles.textContainer}>
                      <RenderHtml html={comment.html} />
                    </View>
                  ) : null}
                  {displayInList && (
                    <TouchableOpacity
                      style={[
                        styles.sourceContainer,
                        {
                          borderColor: theme.tint,
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        pushURL(comment.postLink);
                      }}
                    >
                      <Text
                        style={[
                          styles.sourcePostTitle,
                          {
                            color: theme.subtleText,
                          },
                        ]}
                      >
                        {comment.postTitle}
                      </Text>
                      <Text
                        style={[
                          styles.sourceSubreddit,
                          {
                            color: theme.verySubtleText,
                          },
                        ]}
                      >
                        {comment.subreddit}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {comment.saved && (
                    <View
                      style={[
                        styles.bookmarkNotch,
                        {
                          borderColor: theme.bookmark,
                        },
                      ]}
                    />
                  )}
                </View>
              </TouchableHighlight>
            </Slideable>
          )}
          {!collapsed ? (
            <>
              {comment.comments.length > 0 &&
                comment.comments.map((childComment, childIndex) => (
                  <CommentComponent
                    key={childComment.id}
                    loadMoreComments={loadMoreComments}
                    comment={childComment}
                    index={childIndex}
                    scrollChange={scrollChange}
                    changeComment={changeComment}
                    deleteComment={deleteComment}
                    commentPropRef={{ current: null }}
                  />
                ))}
              {comment.loadMore && comment.loadMore.childIds.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={async () => {
                    setLoadingMore(true);
                    if (comment.loadMore && loadMoreComments) {
                      await loadMoreComments(
                        comment.loadMore.childIds.slice(0, 10),
                        comment.path,
                        comment.comments.length,
                      );
                    }
                    setLoadingMore(false);
                  }}
                  style={[
                    styles.outerCommentContainer,
                    {
                      marginLeft: 10 * (comment.depth + 1),
                      borderTopColor: theme.divider,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.commentContainer,
                      {
                        borderLeftWidth: comment.depth === -1 ? 0 : 1,
                        borderLeftColor:
                          theme.commentDepthColors[
                            comment.depth % theme.commentDepthColors.length
                          ],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.upvoteText,
                        {
                          color: theme.iconOrTextButton,
                        },
                      ]}
                    >
                      {loadingMore
                        ? "Loading..."
                        : `${comment.loadMore.childIds.length} more replies`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </>
          ) : null}
          {displayInList && (
            <View
              style={[
                styles.spacer,
                {
                  backgroundColor: theme.divider,
                },
              ]}
            />
          )}
        </View>
      ),
    [
      isFiltered,
      commentFlairs,
      loadingMore,
      collapsed,
      comment,
      comment.renderCount,
      theme,
    ],
  );
}

interface CommentsProps {
  loadMoreComments: LoadMoreCommentsFunc;
  postDetail: PostDetail;
  scrollChange: (y: number) => void;
  changeComment: (comment: Comment) => void;
  deleteComment: (comment: Comment) => void;
}

const Comments = forwardRef(
  (
    {
      loadMoreComments,
      postDetail,
      scrollChange,
      changeComment,
      deleteComment,
    }: CommentsProps,
    ref: ForwardedRef<View>,
  ) => {
    const { theme } = useContext(ThemeContext);

    return (
      <View
        style={[
          styles.commentsContainer,
          {
            borderBottomColor: theme.divider,
          },
        ]}
        ref={ref}
      >
        <CommentComponent
          key={postDetail.id}
          loadMoreComments={loadMoreComments}
          comment={postDetail}
          index={0}
          scrollChange={scrollChange}
          changeComment={changeComment}
          deleteComment={deleteComment}
        />
      </View>
    );
  },
);

export default Comments;

const styles = StyleSheet.create({
  commentsContainer: {
    borderBottomWidth: 1,
  },
  outerCommentContainer: {
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  outerCommentContainerDisplayInList: {
    borderTopWidth: 0,
  },
  commentContainer: {
    flex: 1,
    paddingLeft: 15,
    paddingRight: 10,
  },
  commentContainerDisplayInList: {
    paddingLeft: 10,
  },
  stickiedIcon: {
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  author: {
    fontSize: 14,
    fontWeight: "500",
  },
  upvoteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  upvoteText: {
    fontSize: 14,
  },
  flairContainer: {
    flexShrink: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 5,
    gap: 2,
    marginVertical: -10,
  },
  flairEmoji: {
    width: 16,
    height: 16,
  },
  flairText: {
    flexShrink: 1,
  },
  topBarEnd: {
    flexGrow: 1,
    alignItems: "flex-end",
  },
  textContainer: {
    marginVertical: -10,
  },
  sourceContainer: {
    borderWidth: 3,
    marginTop: 15,
    marginBottom: 5,
    padding: 10,
    borderRadius: 10,
  },
  sourcePostTitle: {
    marginBottom: 10,
  },
  sourceSubreddit: {},
  text: {
    fontSize: 15,
    lineHeight: 18,
  },
  spacer: {
    height: 10,
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
