import { useContext, useEffect, useRef, useState } from "react";

import {
  Comment,
  LoadMoreCommentsFunc,
  PostDetail,
} from "../../api/PostDetail";
import {
  getCommentSort,
  getPostsDetail,
  loadMoreComments as fetchMoreComments,
} from "../../api/gql/PostDetail";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../../components/Navbar/SortAndContext";
import { AccountContext } from "../../contexts/AccountContext";
import { ToastContext } from "../../contexts/ToastContext";
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
import { isAccessFailure } from "../../utils/useRedditDataState";

/**
 * Owns the postDetail state and every mutation of the comment tree. The tree
 * is mutated in place and re-rendered through the renderCount channel — see
 * utils/commentTree.ts for how that works.
 */
export default function usePostDetail(url: string, isSplitView: boolean) {
  const navigation = useURLNavigation();
  const { currentUser } = useContext(AccountContext);
  const { showToast } = useContext(ToastContext);

  const [postDetail, setPostDetail] = useState<PostDetail>();
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  // Split view changes the url of a mounted page, so an earlier post can
  // finish loading after a later one started.
  const latestLoad = useRef(0);

  const loadPostDetails = async () => {
    const load = ++latestLoad.current;
    setRefreshing(true);
    setLoadError(null);
    if (isSplitView) {
      setPostDetail(undefined);
    }
    // A failed refresh keeps the post that's already shown.
    const keepsPost = !isSplitView && !!postDetail;
    let newPostDetail: PostDetail | undefined;
    try {
      newPostDetail = await getPostsDetail(url);
    } catch (e) {
      if (load !== latestLoad.current) return;
      const error = e instanceof Error ? e : new Error(String(e));
      if (keepsPost) {
        showToast({ title: "Couldn't refresh", body: error.message });
      } else {
        setLoadError(error);
      }
      return;
    } finally {
      if (load === latestLoad.current) setRefreshing(false);
    }
    if (load !== latestLoad.current) return;
    if (!newPostDetail) {
      if (!keepsPost) {
        setLoadError(new Error("the subreddit's warning was declined"));
      }
      return;
    }
    setLoadError(null);
    setPostDetail(newPostDetail);

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
      "Share as Image",
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

  const loadMoreComments: LoadMoreCommentsFunc = async (commentPath) => {
    if (!postDetail) return;
    const parent = getCommentFromPath(postDetail, commentPath);
    if (!parent?.loadMore) return;
    // A refresh, sort change or reload of the parent replaces this array, and
    // then the new comments' paths no longer fit.
    const siblings = parent.comments;
    let more: Awaited<ReturnType<typeof fetchMoreComments>>;
    try {
      more = await fetchMoreComments(
        postDetail,
        parent,
        parent.loadMore.cursor,
        getCommentSort(url),
      );
    } catch (e) {
      showToast({
        title: "Couldn't load replies",
        body: e instanceof Error ? e.message : undefined,
      });
      return;
    }
    const { comments: newComments, loadMore } = more;
    setPostDetail((oldPostDetail) => {
      if (!oldPostDetail) return oldPostDetail;
      const current = getCommentFromPath(oldPostDetail, commentPath);
      if (current?.comments !== siblings) return oldPostDetail;
      mergeMoreComments(current, newComments, loadMore);
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

  // Like list pages: logging in or switching accounts may fix the error.
  useEffect(() => {
    if (isAccessFailure(loadError)) loadPostDetails();
  }, [currentUser?.userName]);

  return {
    postDetail,
    setPostDetail,
    loadError,
    refreshing,
    loadPostDetails,
    changeComment,
    deleteComment,
    loadMoreComments,
  };
}
