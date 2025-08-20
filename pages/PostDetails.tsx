import React, {
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
  useDeferredValue,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";

import {
  getPostsDetail,
  loadMoreComments,
  PostDetail,
  Comment,
} from "../api/PostDetail";
import { StackPageProps } from "../app/stack";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../components/Navbar/SortAndContext";
import PostDetailsComponent from "../components/RedditDataRepresentations/Post/PostDetailsComponent";
import Comments from "../components/RedditDataRepresentations/Post/PostParts/Comments";
import { AccountContext } from "../contexts/AccountContext";
import { ScrollerContext, ScrollerProvider } from "../contexts/ScrollerContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";
import { useURLNavigation } from "../utils/navigation";
import { TabScrollContext } from "../contexts/TabScrollContext";
import { modifyStat, Stat } from "../db/functions/Stats";
import ScrollToNextButton from "../components/UI/ScrollToNextButton";

export type LoadMoreCommentsFunc = (
  commentIds: string[],
  commentPath: number[],
  childStartIndex: number,
) => Promise<void>;

type PostDetailsProps = StackPageProps<"PostDetailsPage">;

function PostDetails({ route }: PostDetailsProps) {
  const url = route.params.url;

  const navigation = useURLNavigation();

  const { theme } = useContext(ThemeContext);
  const { scrollDisabled } = useContext(ScrollerContext);
  const { currentUser } = useContext(AccountContext);
  const { handleScrollForTabBar } = useContext(TabScrollContext);

  const topOfScroll = useRef<View>(null);
  const scrollView = useRef<ScrollView>(null);
  const commentsView = React.useRef<View>(null);

  const [postDetail, setPostDetail] = useState<PostDetail>();
  const [refreshing, setRefreshing] = useState(false);

  const deferredPostDetail = useDeferredValue(postDetail);

  const asyncMeasure = (
    ref: any,
    type: "measure" | "measureInWindow" = "measure",
  ): Promise<number[]> => {
    return new Promise((resolve) => {
      ref[type]((...args: any) => {
        resolve(args);
      });
    });
  };

  const scrollChange = useCallback(
    async (changeY: number) => {
      if (!scrollView.current) return;
      const scrollRef = scrollView.current;
      const scrollWindowTop = (await asyncMeasure(scrollRef))[5];
      if (changeY < scrollWindowTop) {
        const scrollDepth = (await asyncMeasure(topOfScroll.current))[5];
        scrollView.current.scrollTo({
          y: scrollWindowTop - scrollDepth + (changeY - scrollWindowTop),
          animated: true,
        });
      }
    },
    [scrollView.current],
  );

  const loadPostDetails = async () => {
    setRefreshing(true);
    const postDetail = await getPostsDetail(url);
    setPostDetail(postDetail);
    setRefreshing(false);

    const contextOptions: ContextTypes[] = [
      ...(currentUser?.userName === postDetail.author && postDetail.text
        ? ["Edit" as ContextTypes]
        : []),
      ...(currentUser?.userName === postDetail.author
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
      title: new RedditURL(route.params.url).getPageName(),
      headerRight: () => {
        return (
          <SortAndContext
            route={route}
            navigation={navigation}
            sortOptions={contextSort}
            contextOptions={contextOptions}
            pageData={postDetail}
          />
        );
      },
    });
  };

  const getCommentFromPath = (
    parentObject: PostDetail | Comment,
    commentPath: number[],
  ) => {
    return commentPath.reduce((path: PostDetail | Comment, num) => {
      return path.comments[num];
    }, parentObject);
  };

  const changeComment = (newComment: Comment | PostDetail) => {
    if (postDetail) {
      const oldComment = getCommentFromPath(postDetail, newComment.path);
      Object.assign(oldComment, newComment);
      rerenderComment(oldComment);
    }
  };

  const deleteComment = (comment: Comment) => {
    if (postDetail) {
      const parent = getCommentFromPath(postDetail, comment.path.slice(0, -1));
      parent.comments = parent.comments.filter((c) => c.id !== comment.id);
      rerenderComment(comment);
    }
  };

  const rerenderComment = (comment: Comment | PostDetail) => {
    if (postDetail) {
      let currentComment: Comment | PostDetail = postDetail;
      for (const num of comment.path) {
        currentComment.renderCount++;
        currentComment = currentComment.comments[num];
      }
      setPostDetail({ ...postDetail });
    }
  };

  const loadMoreCommentsFunc: LoadMoreCommentsFunc = async (
    commentIds,
    commentPath,
    childStartIndex,
  ) => {
    if (!postDetail) return;
    const newComments = await loadMoreComments(
      postDetail.subreddit,
      postDetail?.id,
      commentIds,
      commentPath,
      childStartIndex,
    );
    setPostDetail((oldPostDetail) => {
      if (oldPostDetail) {
        const parent = getCommentFromPath(oldPostDetail, commentPath);
        parent.comments.push(...newComments);
        if (parent.loadMore) {
          parent.loadMore.childIds = parent.loadMore.childIds.filter(
            (childId) => !commentIds.includes(childId),
          );
        }
        return oldPostDetail;
      }
    });
  };

  const scrollToNextComment = async (goPrevious = false) => {
    if (!scrollView.current || !commentsView.current) return;
    const FUZZY_DISTANCE = 5;
    const scrollRef = scrollView.current;
    const scrollY = (await asyncMeasure(scrollRef, "measureInWindow"))[1];
    const currentScrollHeight = (
      await asyncMeasure(topOfScroll.current, "measureInWindow")
    )[1];
    const childComments = (commentsView.current as any).__internalInstanceHandle
      .child.child.child.child.memoizedProps[0];
    let prevDelta = 0;
    for (const commentView of childComments) {
      const commentRef = commentView.props.commentPropRef.current;
      const commentMeasures = await asyncMeasure(commentRef, "measureInWindow");
      const commentY = commentMeasures[1];
      const delta = commentY - currentScrollHeight;
      if (
        commentY > scrollY &&
        !(Math.abs(commentY - scrollY) < FUZZY_DISTANCE)
      ) {
        scrollView.current.scrollTo({
          y: goPrevious ? prevDelta : delta,
          animated: true,
        });
        break;
      }
      if (commentY < scrollY - FUZZY_DISTANCE) {
        prevDelta = delta;
      }
    }
  };

  useEffect(() => {
    loadPostDetails();
  }, []);

  return (
    <View
      style={[
        styles.postDetailsOuterContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {postDetail ? (
        <ScrollView
          ref={scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPostDetails()}
            />
          }
          scrollEnabled={!scrollDisabled}
          onScroll={(e) => handleScrollForTabBar(e)}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        >
          <View ref={topOfScroll} />
          <PostDetailsComponent
            key={postDetail.id}
            postDetail={postDetail}
            loadPostDetails={loadPostDetails}
            setPostDetail={setPostDetail}
          />
          {deferredPostDetail && deferredPostDetail.comments.length > 0 ? (
            <Comments
              key={`${deferredPostDetail.id}-comments`}
              ref={commentsView}
              loadMoreComments={loadMoreCommentsFunc}
              postDetail={deferredPostDetail}
              scrollChange={scrollChange}
              changeComment={(comment: Comment) => changeComment(comment)}
              deleteComment={(comment: Comment) => deleteComment(comment)}
            />
          ) : postDetail !== deferredPostDetail ? (
            <View
              key="loading-comments"
              style={styles.loadingCommentsContainer}
            >
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <View key="no-comments" style={styles.noCommentsContainer}>
              <Text
                style={[
                  styles.noCommentsText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                No comments
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ActivityIndicator size="small" />
      )}
      <ScrollToNextButton
        scrollToNext={() => scrollToNextComment()}
        scrollToPrevious={() => scrollToNextComment(true)}
      />
    </View>
  );
}

export default (props: PostDetailsProps) => {
  modifyStat(Stat.POSTS_VIEWED, 1);
  return (
    <ScrollerProvider>
      <PostDetails {...props} />
    </ScrollerProvider>
  );
};

const styles = StyleSheet.create({
  postDetailsOuterContainer: {
    flex: 1,
    justifyContent: "center",
  },
  postDetailsContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  metadataContainer: {
    marginTop: 5,
    paddingHorizontal: 15,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  stickiedIcon: {
    marginRight: 7,
    fontSize: 16,
  },
  subredditContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallText: {
    fontSize: 14,
  },
  boldedSmallText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonsBarContainer: {
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  buttonsContainer: {
    padding: 3,
    borderRadius: 5,
  },
  showContextContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  loadingCommentsContainer: {
    marginVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  noCommentsContainer: {
    marginVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 15,
  },
});
