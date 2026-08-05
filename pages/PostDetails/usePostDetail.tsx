import { useContext, useEffect, useState } from "react";

import {
  Comment,
  getPostsDetail,
  LoadMoreCommentsFunc,
  loadMoreComments as fetchMoreComments,
  PostDetail,
} from "../../api/PostDetail";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../../components/Navbar/SortAndContext";
import { AccountContext } from "../../contexts/AccountContext";
import { modifyStat, Stat } from "../../db/functions/Stats";
import {
  applyCommentChange,
  getCommentFromPath,
  markPathDirty,
  mergeMoreComments,
  removeComment,
} from "../../utils/commentTree";
import RedditURL from "../../utils/RedditURL";
import { useURLNavigation } from "../../utils/navigation";

/**
 * Owns the postDetail state and every mutation of the comment tree. The tree
 * is mutated in place and re-rendered through the renderCount channel — see
 * utils/commentTree.ts for how that works.
 */
export default function usePostDetail(url: string, isSplitView: boolean) {
  const navigation = useURLNavigation();
  const { currentUser } = useContext(AccountContext);

  const [postDetail, setPostDetail] = useState<PostDetail>();
  const [refreshing, setRefreshing] = useState(true);

  const loadPostDetails = async () => {
    setRefreshing(true);
    if (isSplitView) {
      setPostDetail(undefined);
    }
    const newPostDetail = await getPostsDetail(url);
    if (!newPostDetail) return;
    setPostDetail(newPostDetail);
    setRefreshing(false);

    if (isSplitView) return;
    const contextOptions: ContextTypes[] = [
      ...(currentUser?.userName === newPostDetail.author && newPostDetail.text
        ? ["Edit" as ContextTypes]
        : []),
      ...(currentUser?.userName === newPostDetail.author
        ? ["Delete" as ContextTypes]
        : []),
      "Report",
      "Select Text",
      "Share",
    ];
    const contextSort: SortTypes[] = [
      "Best",
      "New",
      "Top",
      "Controversial",
      "Old",
      "Q&A",
    ];
    navigation.setOptions({
      title: new RedditURL(url).getPageName(),
      headerRight: () => (
        <SortAndContext
          route={url}
          navigation={navigation}
          sortOptions={contextSort}
          contextOptions={contextOptions}
          pageData={newPostDetail}
        />
      ),
    });
  };

  /**
   * Mutations run at call time against the tree generation this closure was
   * created for. A handler frozen in cached comment JSX from before a refresh
   * then mutates the discarded tree (a harmless no-op) instead of grafting
   * stale data onto the fresh one. The setPostDetail spread only triggers the
   * re-render; the mutated node objects carry the actual change.
   */
  const rerender = () =>
    setPostDetail((oldPostDetail) =>
      oldPostDetail ? { ...oldPostDetail } : oldPostDetail,
    );

  const changeComment = (newComment: Comment | PostDetail) => {
    if (!postDetail) return;
    applyCommentChange(postDetail, newComment);
    rerender();
  };

  const deleteComment = (comment: Comment) => {
    if (!postDetail) return;
    removeComment(postDetail, comment);
    markPathDirty(postDetail, comment.path.slice(0, -1));
    rerender();
  };

  const loadMoreComments: LoadMoreCommentsFunc = async (
    commentIds,
    commentPath,
    childStartIndex,
  ) => {
    if (!postDetail) return;
    const newComments = await fetchMoreComments(
      postDetail.subreddit,
      postDetail.id,
      commentIds,
      commentPath,
      childStartIndex,
    );
    setPostDetail((oldPostDetail) => {
      if (!oldPostDetail) return oldPostDetail;
      const parent = getCommentFromPath(oldPostDetail, commentPath);
      if (!parent) return oldPostDetail;
      mergeMoreComments(parent, newComments, commentIds);
      markPathDirty(oldPostDetail, commentPath);
      return { ...oldPostDetail };
    });
  };

  useEffect(() => {
    if (url) {
      modifyStat(Stat.POSTS_VIEWED, 1);
    }
    loadPostDetails();
  }, [url]);

  return {
    postDetail,
    setPostDetail,
    refreshing,
    loadPostDetails,
    changeComment,
    deleteComment,
    loadMoreComments,
  };
}
