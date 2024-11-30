import { AntDesign } from "@expo/vector-icons";
import React, {
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
  ReactNode,
  useDeferredValue,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  VirtualizedList,
} from "react-native";

import {
  getPostsDetail,
  loadMoreComments,
  PostDetail,
  Comment,
} from "../api/PostDetail";
import { StackPageProps } from "../app/stack";
import PostDetailsComponent from "../components/RedditDataRepresentations/Post/PostDetailsComponent";
import Comments from "../components/RedditDataRepresentations/Post/PostParts/Comments";
import Scroller from "../components/UI/Scroller";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export type LoadMoreCommentsFunc = (
  commentIds: string[],
  commentPath: number[],
  childStartIndex: number,
) => Promise<void>;

export default function PostDetails({
  route,
}: StackPageProps<"PostDetailsPage">) {
  const url = route.params.url;

  const { theme } = useContext(ThemeContext);

  const scrollView = useRef<VirtualizedList<ReactNode>>(null);
  const commentsView = React.useRef<View>(null);

  const [postDetail, setPostDetail] = useState<PostDetail>();

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
      const scrollRef = scrollView.current.getScrollRef();
      const scrollY = (await asyncMeasure(scrollRef))[5];
      if (changeY < scrollY) {
        const innerView = (scrollView.current as any)
          .getScrollRef()
          ?.getInnerViewRef();
        const viewY = (await asyncMeasure(innerView))[5];
        (scrollView.current as any)?.scrollToOffset({
          offset: changeY - viewY,
          animated: true,
        });
      }
    },
    [scrollView.current],
  );

  const loadPostDetails = async () => {
    const postDetail = await getPostsDetail(url);
    setPostDetail(postDetail);
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

  const scrollToNextComment = async () => {
    if (!scrollView.current || !commentsView.current) return;
    const scrollRef = scrollView.current.getScrollRef();
    const innerViewRef = (scrollView.current as any)
      .getScrollRef()
      ?.getInnerViewRef();
    const scrollY = (await asyncMeasure(scrollRef, "measureInWindow"))[1];
    const currentScrollHeight = (
      await asyncMeasure(innerViewRef, "measureInWindow")
    )[1];
    const childComments = (commentsView.current as any).__internalInstanceHandle
      .child.child.child.child.child.child.memoizedProps[0];
    for (const commentView of childComments) {
      const commentRef = commentView.props.commentPropRef.current;
      const commentMeasures = await asyncMeasure(commentRef, "measureInWindow");
      const commentY = commentMeasures[1];
      const delta = commentY - currentScrollHeight;
      if (commentY > scrollY) {
        (scrollView.current as any)?.scrollToOffset({
          offset: delta + 1 /* scroll a bit over to fix bug */,
          animated: true,
        });
        break;
      }
    }
  };

  useEffect(() => {
    loadPostDetails();
  }, []);

  return (
    <View
      style={t(styles.postDetailsOuterContainer, {
        backgroundColor: theme.background,
      })}
    >
      {postDetail ? (
        <Scroller
          scrollViewRef={scrollView}
          refresh={async () => await loadPostDetails()}
          headerComponent={
            <PostDetailsComponent
              key={postDetail.id}
              postDetail={postDetail}
              loadPostDetails={loadPostDetails}
              setPostDetail={setPostDetail}
            />
          }
        >
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
                style={t(styles.noCommentsText, {
                  color: theme.text,
                })}
              >
                No comments
              </Text>
            </View>
          )}
        </Scroller>
      ) : (
        <ActivityIndicator size="small" />
      )}
      <TouchableOpacity
        activeOpacity={0.8}
        style={t(styles.skipToNextButton, {
          backgroundColor: theme.buttonText,
        })}
        onPress={scrollToNextComment}
      >
        <AntDesign name="down" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );
}

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
  skipToNextButton: {
    bottom: 20,
    right: 20,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1000,
    width: 40,
    height: 40,
  },
});
