import { ComponentRef, useContext, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import CommentTopBar from "./CommentTopBar";
import MoreRepliesRow from "./MoreRepliesRow";
import { buildCommentSwipeOptions } from "./swipeOptions";
import useCommentActions from "./useCommentActions";
import {
  Comment,
  LoadMoreCommentsFunc,
  PostDetail,
} from "../../../../../api/PostDetail";
import { VoteOption } from "../../../../../api/Posts";
import { CommentSettingsContext } from "../../../../../contexts/SettingsContexts/CommentSettingsContext";
import { FiltersContext } from "../../../../../contexts/SettingsContexts/FiltersContext";
import { GesturesContext } from "../../../../../contexts/SettingsContexts/GesturesContext";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../../../../../utils/RedditURL";
import { useURLNavigation } from "../../../../../utils/navigation";
import RenderHtml from "../../../../HTML/RenderHTML";
import Slideable from "../../../../UI/Slideable";

export type CommentNode = ComponentRef<typeof Touchable>;

type CommentProps = {
  comment: PostDetail | Comment;
  changeComment: (comment: Comment) => void;
  deleteComment: (comment: Comment) => void;
  displayInList?: boolean; // Render style for standalone lists like a user's comment history
  loadMoreComments?: LoadMoreCommentsFunc;
  scrollChange?: (y: number) => void;
  collapseThread?: (comment: Comment) => void;
  interactionDisabledStatus?: PostDetail["interactionDisabledStatus"];
  registerTopLevelNode?: (id: string, node: CommentNode | null) => void;
  postDetail?: PostDetail; // Tree root, for actions that need the comment's ancestors
  displayForImageShareSettings?: {
    depth: number;
    hideUsernames: boolean;
  };
};

export default function CommentComponent({
  comment,
  changeComment,
  deleteComment,
  displayInList,
  loadMoreComments,
  scrollChange,
  collapseThread,
  interactionDisabledStatus = null,
  registerTopLevelNode,
  postDetail,
  displayForImageShareSettings,
}: CommentProps) {
  const { theme } = useContext(ThemeContext);
  const {
    voteIndicator,
    commentFlairs,
    tapToCollapseComment,
    collapseChildrenOnly,
  } = useContext(CommentSettingsContext);
  const { commentSwipeOptions } = useContext(GesturesContext);
  const { doesCommentPassTextFilter } = useContext(FiltersContext);
  const { pushURL } = useURLNavigation();

  const actions = useCommentActions({
    comment,
    changeComment,
    deleteComment,
    collapseThread,
    interactionDisabledStatus,
    displayInList,
    postDetail,
  });

  const commentRef = useRef<CommentNode>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const isFiltered =
    comment.type === "comment" &&
    !displayInList &&
    !doesCommentPassTextFilter(comment);

  const onPressComment = () => {
    if (displayInList) {
      if (comment.type === "comment") {
        pushURL(
          new RedditURL(comment.link)
            .setQueryParams({ context: "10" })
            .toString(),
        );
      }
    } else if (tapToCollapseComment) {
      commentRef.current?.measureInWindow((_x, y) => {
        if (!comment.collapsed && scrollChange) {
          scrollChange(y);
        }
      });
      actions.toggleCollapse();
    }
  };

  const onPressLoadMore = async () => {
    if (!comment.loadMore || !loadMoreComments) return;
    setLoadingMore(true);
    await loadMoreComments(
      comment.loadMore.childIds.slice(0, 10),
      comment.path,
      comment.comments.length,
    );
    setLoadingMore(false);
  };

  /**
   * The entire render is cached so that a page level state change only
   * re-renders the comments that actually changed. Two channels invalidate a
   * comment: a new comment object (UserPage swaps objects on change), or a
   * renderCount bump (PostDetails mutates the tree in place and dirties the
   * path to the change — see utils/commentTree.ts). Handlers are deliberately
   * not dependencies: they are recreated on every run and would defeat the
   * cache. The stale closures this caches stay correct because they read from
   * the same mutated-in-place comment object.
   */
  return useMemo(
    () =>
      isFiltered ? null : (
        <View key={comment.id}>
          {comment.depth >= 0 && (
            <Slideable
              xScrollToEngage={15}
              options={buildCommentSwipeOptions(comment, theme, actions)}
              shortLeftName={commentSwipeOptions.right}
              longLeftName={commentSwipeOptions.farRight}
              shortRightName={commentSwipeOptions.left}
              longRightName={commentSwipeOptions.farLeft}
            >
              <Touchable
                ref={(node) => {
                  commentRef.current = node;
                  registerTopLevelNode?.(comment.id, node);
                }}
                activeOpacity={1}
                onPress={onPressComment}
                onLongPress={() => actions.showCommentOptions()}
                style={[
                  styles.outerCommentContainer,
                  displayInList || displayForImageShareSettings?.depth === 0
                    ? styles.outerCommentContainerDisplayInList
                    : {},
                  {
                    marginLeft: 10 * comment.depth,
                    borderTopColor: theme.divider,
                  },
                ]}
              >
                <View
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
                  <CommentTopBar
                    comment={comment}
                    theme={theme}
                    showFlair={commentFlairs}
                    bodyHidden={comment.collapsed && !collapseChildrenOnly}
                    hideUsername={!!displayForImageShareSettings?.hideUsernames}
                    onPressAuthor={() => pushURL(`/user/${comment.author}`)}
                    onPressUpvote={() =>
                      actions.voteOnComment(VoteOption.UpVote)
                    }
                  />
                  {(collapseChildrenOnly || !comment.collapsed) && (
                    <View style={styles.textContainer}>
                      <RenderHtml html={comment.html} />
                    </View>
                  )}
                  {displayInList && (
                    <Touchable
                      style={[
                        styles.sourceContainer,
                        {
                          borderColor: theme.tint,
                        },
                      ]}
                      activeOpacity={0.8}
                      animationDuration={{ in: 0, out: 150 }}
                      onPress={() => pushURL(comment.postLink)}
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
                      <Text style={{ color: theme.verySubtleText }}>
                        {comment.subreddit}
                      </Text>
                    </Touchable>
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
              </Touchable>
            </Slideable>
          )}
          {!comment.collapsed ? (
            <>
              {comment.comments.map((childComment) => (
                <CommentComponent
                  key={childComment.id}
                  comment={childComment}
                  changeComment={changeComment}
                  deleteComment={deleteComment}
                  loadMoreComments={loadMoreComments}
                  scrollChange={scrollChange}
                  collapseThread={collapseThread}
                  interactionDisabledStatus={interactionDisabledStatus}
                  registerTopLevelNode={
                    comment.depth === -1 ? registerTopLevelNode : undefined
                  }
                  postDetail={postDetail}
                  displayForImageShareSettings={displayForImageShareSettings}
                />
              ))}
              {comment.loadMore && comment.loadMore.childIds.length > 0 && (
                <MoreRepliesRow
                  depth={comment.depth}
                  theme={theme}
                  label={
                    loadingMore
                      ? "Loading..."
                      : `${comment.loadMore.childIds.length} more replies`
                  }
                  onPress={onPressLoadMore}
                />
              )}
            </>
          ) : collapseChildrenOnly && comment.comments.length > 0 ? (
            <MoreRepliesRow
              depth={comment.depth}
              theme={theme}
              label={`${comment.comments.length} more replies`}
              onPress={actions.toggleCollapse}
            />
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
      loadingMore,
      comment,
      comment.renderCount,
      comment.collapsed,
      interactionDisabledStatus,
      theme,
      commentFlairs,
      voteIndicator,
      tapToCollapseComment,
      collapseChildrenOnly,
      commentSwipeOptions.left,
      commentSwipeOptions.right,
      commentSwipeOptions.farLeft,
      commentSwipeOptions.farRight,
      displayForImageShareSettings?.hideUsernames,
    ],
  );
}

const styles = StyleSheet.create({
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
