import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
} from "react";
import { StyleSheet, View } from "react-native";

import CommentComponent, { CommentNode } from "./CommentComponent";
import {
  Comment,
  LoadMoreCommentsFunc,
  PostDetail,
} from "../../../../../api/PostDetail";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";

export { default as CommentComponent } from "./CommentComponent";

type CommentsProps = {
  loadMoreComments: LoadMoreCommentsFunc;
  postDetail: PostDetail;
  scrollChange: (y: number) => void;
  changeComment: (comment: Comment) => void;
  deleteComment: (comment: Comment) => void;
  collapseThread: (comment: Comment) => void;
  interactionDisabledStatus?: PostDetail["interactionDisabledStatus"];
};

export type CommentsHandle = {
  getTopLevelNodes: () => { comment: Comment; node: CommentNode }[];
  getTopLevelNode: (id: string) => CommentNode | undefined;
};

/**
 * Renders the recursive comment tree and keeps a registry of the mounted
 * top level comments' native nodes, which PostDetails uses to measure and
 * scroll (scroll to next comment, collapse thread).
 */
const Comments = forwardRef(
  (
    {
      loadMoreComments,
      postDetail,
      scrollChange,
      changeComment,
      deleteComment,
      collapseThread,
      interactionDisabledStatus = null,
    }: CommentsProps,
    ref: ForwardedRef<CommentsHandle>,
  ) => {
    const { theme } = useContext(ThemeContext);

    const topLevelNodes = useRef(new Map<string, CommentNode>());
    const postDetailRef = useRef(postDetail);
    postDetailRef.current = postDetail;

    const registerTopLevelNode = useCallback(
      (id: string, node: CommentNode | null) => {
        if (node) {
          topLevelNodes.current.set(id, node);
        } else {
          topLevelNodes.current.delete(id);
        }
      },
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        // Mapped over postDetail.comments rather than the Map so nodes come
        // back in render order, skipping unmounted (e.g. filtered) comments.
        getTopLevelNodes: () =>
          postDetailRef.current.comments.flatMap((comment) => {
            const node = topLevelNodes.current.get(comment.id);
            return node ? [{ comment, node }] : [];
          }),
        getTopLevelNode: (id) => topLevelNodes.current.get(id),
      }),
      [],
    );

    return (
      <View
        style={[
          styles.commentsContainer,
          {
            borderBottomColor: theme.divider,
          },
        ]}
      >
        <CommentComponent
          key={postDetail.id}
          comment={postDetail}
          loadMoreComments={loadMoreComments}
          scrollChange={scrollChange}
          changeComment={changeComment}
          deleteComment={deleteComment}
          collapseThread={collapseThread}
          interactionDisabledStatus={interactionDisabledStatus}
          registerTopLevelNode={registerTopLevelNode}
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
});
