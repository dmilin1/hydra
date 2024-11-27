import { AntDesign, Octicons } from "@expo/vector-icons";
import React, {
  useContext,
  useState,
  useMemo,
  Suspense,
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
import { AccountContext } from "../../../../contexts/AccountContext";
import { ModalContext } from "../../../../contexts/ModalContext";
import {
  ThemeContext,
  t,
} from "../../../../contexts/SettingsContexts/ThemeContext";
import { LoadMoreCommentsFunc } from "../../../../pages/PostDetails";
import RedditURL from "../../../../utils/RedditURL";
import { useURLNavigation } from "../../../../utils/navigation";
import useContextMenu from "../../../../utils/useContextMenu";
import RenderHtml from "../../../HTML/RenderHTML";
import ContentEditor from "../../../Modals/ContentEditor";
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
  const { pushURL } = useURLNavigation();
  const { setModal } = useContext(ModalContext);
  const { currentUser } = useContext(AccountContext);
  const showContextMenu = useContextMenu();

  const commentRef = useRef<ElementRef<typeof TouchableHighlight>>(null);

  if (commentPropRef) {
    commentPropRef.current = commentRef.current;
  }

  const [collapsed, setCollapsed] = useState(false);
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

  const replyToComment = () => {
    setModal(
      <ContentEditor
        mode="makeComment"
        parent={comment}
        contentSent={async () => {
          const reloadedComment = await reloadComment(comment);
          changeComment?.(reloadedComment);
        }}
      />,
    );
  };

  const editComment = () => {
    if (comment.type !== "comment") return;
    setModal(
      <ContentEditor
        mode="editComment"
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
      "Reply",
      ...(currentUser?.userName === comment.author ? ["Edit", "Delete"] : []),
      "Share",
    ];
    const result = await showContextMenu({ options });

    if (result === "Reply") {
      replyToComment();
    } else if (result === "Edit") {
      editComment();
    } else if (result === "Delete") {
      confirmDeleteComment();
    } else if (result === "Share") {
      Share.share({ url: new RedditURL(comment.link).toString() });
    }
  };

  return useMemo(
    () => (
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
            ]}
          >
            <TouchableHighlight
              ref={(ref) => {
                // @ts-ignore: Need to mutate this ref here because we need to set 2 refs which you'd never normally do
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
                    pushURL(comment.link);
                  }
                } else {
                  commentRef.current?.measure(
                    (_fx, _fy, _width, _height, _px, py) => {
                      if (!collapsed && scrollChange) {
                        scrollChange(py);
                      }
                    },
                  );
                  setCollapsed(!collapsed);
                }
              }}
              onLongPress={() => showCommentOptions()}
              style={t(
                styles.outerCommentContainer,
                displayInList ? styles.outerCommentContainerDisplayInList : {},
                {
                  marginLeft: 10 * comment.depth,
                  borderTopColor: theme.divider,
                },
              )}
            >
              <View
                key={index}
                style={t(
                  styles.commentContainer,
                  displayInList ? styles.commentContainerDisplayInList : {},
                  {
                    borderLeftWidth: comment.depth === 0 ? 0 : 1,
                    borderLeftColor:
                      theme.postColorTint[
                        (comment.depth - 1) % theme.postColorTint.length
                      ],
                  },
                )}
              >
                <View
                  style={t(styles.topBar, {
                    marginBottom: collapsed ? 0 : 8,
                  })}
                >
                  {comment.isStickied && (
                    <AntDesign
                      name="pushpin"
                      style={t(styles.stickiedIcon, {
                        color: theme.moderator,
                      })}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => pushURL(`/u/${comment.author}`)}
                  >
                    <Text
                      style={t(styles.author, {
                        color: comment.isOP
                          ? theme.buttonText
                          : comment.isModerator
                            ? theme.moderator
                            : theme.text,
                      })}
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
                      style={t(styles.upvoteText, {
                        color:
                          comment.userVote === VoteOption.UpVote
                            ? theme.upvote
                            : comment.userVote === VoteOption.DownVote
                              ? theme.downvote
                              : theme.subtleText,
                      })}
                    >
                      {comment.scoreHidden && !comment.userVote
                        ? "-"
                        : comment.upvotes}
                    </Text>
                  </TouchableOpacity>
                  <Text
                    style={t(styles.upvoteText, {
                      color: theme.subtleText,
                    })}
                  >
                    {"  ·  "}
                    {comment.timeSince}
                  </Text>
                </View>
                {!collapsed ? (
                  <View style={styles.textContainer}>
                    <RenderHtml html={comment.html} />
                  </View>
                ) : null}
                {displayInList && (
                  <TouchableOpacity
                    style={t(styles.sourceContainer, {})}
                    activeOpacity={0.8}
                    onPress={() => {
                      pushURL(comment.postLink);
                    }}
                  >
                    <Text
                      style={t(styles.sourcePostTitle, {
                        color: theme.subtleText,
                      })}
                    >
                      {comment.postTitle}
                    </Text>
                    <Text
                      style={t(styles.sourceSubreddit, {
                        color: theme.verySubtleText,
                      })}
                    >
                      {comment.subreddit}
                    </Text>
                  </TouchableOpacity>
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
                      comment.loadMore.childIds.slice(0, 5),
                      comment.path,
                      comment.comments.length,
                    );
                  }
                  setLoadingMore(false);
                }}
                style={t(styles.outerCommentContainer, {
                  marginLeft: 10 * (comment.depth + 1),
                  borderTopColor: theme.divider,
                })}
              >
                <View
                  style={t(styles.commentContainer, {
                    borderLeftWidth: comment.depth === -1 ? 0 : 1,
                    borderLeftColor:
                      theme.postColorTint[
                        comment.depth % theme.postColorTint.length
                      ],
                  })}
                >
                  <Text
                    style={t(styles.upvoteText, {
                      color: theme.buttonText,
                    })}
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
            style={t(styles.spacer, {
              backgroundColor: theme.divider,
            })}
          />
        )}
      </View>
    ),
    [loadingMore, collapsed, comment, comment.renderCount, theme],
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
        style={t(styles.commentsContainer, {
          borderBottomColor: theme.divider,
        })}
        ref={ref}
      >
        <Suspense
          fallback={
            <View>
              <Text>Loading</Text>
            </View>
          }
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
        </Suspense>
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
    marginRight: 7,
    fontSize: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  upvoteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  upvoteText: {
    fontSize: 14,
  },
  textContainer: {
    marginVertical: -10,
  },
  sourceContainer: {
    marginTop: 15,
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
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
});
