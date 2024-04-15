import { AntDesign, Feather, FontAwesome, Octicons } from "@expo/vector-icons";
import React, {
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  VirtualizedList,
  Share,
} from "react-native";

import {
  getPostsDetail,
  loadMoreComments,
  PostDetail,
  Comment,
  vote,
  savePost,
} from "../api/PostDetail";
import { VoteOption } from "../api/Posts";
import Reply from "../components/Modals/Reply";
import Comments from "../components/RedditDataRepresentations/Post/PostParts/Comments";
import PostMedia from "../components/RedditDataRepresentations/Post/PostParts/PostMedia";
import Scroller from "../components/UI/Scroller";
import { HistoryContext, HistoryFunctions } from "../contexts/HistoryContext";
import { ModalContext } from "../contexts/ModalContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";

type PostDetailsProps = {
  url: string;
};

export type LoadMoreCommentsFunc = (
  commentIds: string[],
  commentPath: number[],
  childStartIndex: number,
) => Promise<void>;

export default function PostDetails({ url }: PostDetailsProps) {
  const { theme } = useContext(ThemeContext);
  const history = {
    ...useContext(HistoryContext),
    ...HistoryFunctions,
  };
  const { setModal } = useContext(ModalContext);

  const scrollView = useRef<VirtualizedList<unknown>>(null);

  const [postDetail, setPostDetail] = useState<PostDetail>();

  const scrollChange = useCallback(
    (changeY: number) => {
      (scrollView.current?.getScrollRef() as any)?.measure((...args: any) => {
        const scrollY: number = args[5];
        if (changeY < scrollY) {
          (scrollView.current?.getScrollRef() as any)
            ?.getInnerViewRef()
            .measure((...args: any) => {
              const viewY: number = args[5];
              scrollView.current?.scrollToOffset({
                offset: changeY - viewY,
                animated: true,
              });
            });
        }
      });
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

  const voteOnPost = async (voteOption: VoteOption) => {
    if (postDetail) {
      const result = await vote(postDetail, voteOption);
      setPostDetail({
        ...postDetail,
        upvotes: postDetail.upvotes - postDetail.userVote + result,
        userVote: result,
      });
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
        >
          {postDetail && (
            <>
              <View style={styles.postDetailsContainer}>
                <Text
                  style={t(styles.title, {
                    color: theme.text,
                  })}
                >
                  {postDetail.title}
                </Text>
                <PostMedia post={postDetail} />
                <View style={styles.metadataContainer}>
                  <View style={styles.metadataRow}>
                    <Text
                      style={t(styles.smallText, {
                        color: theme.subtleText,
                      })}
                    >
                      {"in "}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() =>
                        history.pushPath(`/r/${postDetail.subreddit}`)
                      }
                    >
                      <Text
                        style={t(styles.boldedSmallText, {
                          color: theme.subtleText,
                        })}
                      >
                        {`r/${postDetail.subreddit}`}
                      </Text>
                    </TouchableOpacity>
                    <Text
                      style={t(styles.smallText, {
                        color: theme.subtleText,
                      })}
                    >
                      {" by "}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.5}
                      onPress={() =>
                        history.pushPath(`/u/${postDetail.author}`)
                      }
                    >
                      <Text
                        style={t(styles.boldedSmallText, {
                          color: theme.subtleText,
                        })}
                      >
                        {`u/${postDetail.author}`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.metadataRow, { marginTop: 5 }]}>
                    <AntDesign
                      name="arrowup"
                      size={15}
                      color={theme.subtleText}
                    />
                    <Text
                      style={t(styles.smallText, {
                        color: theme.subtleText,
                      })}
                    >
                      {postDetail.upvotes}
                    </Text>
                    <Text
                      style={t(styles.smallText, {
                        color: theme.subtleText,
                      })}
                    >
                      {"  •  "}
                      {postDetail.timeSince}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={t(styles.buttonsBarContainer, {
                  borderTopColor: theme.divider,
                })}
              >
                <TouchableOpacity
                  style={t(styles.buttonsContainer, {
                    backgroundColor:
                      postDetail.userVote === VoteOption.UpVote
                        ? theme.upvote
                        : undefined,
                  })}
                  onPress={() => voteOnPost(VoteOption.UpVote)}
                >
                  <AntDesign
                    name="arrowup"
                    size={28}
                    color={
                      postDetail.userVote === VoteOption.UpVote
                        ? theme.text
                        : theme.iconPrimary
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={t(styles.buttonsContainer, {
                    backgroundColor:
                      postDetail.userVote === VoteOption.DownVote
                        ? theme.downvote
                        : undefined,
                  })}
                  onPress={() => voteOnPost(VoteOption.DownVote)}
                >
                  <AntDesign
                    name="arrowdown"
                    size={28}
                    color={
                      postDetail.userVote === VoteOption.DownVote
                        ? theme.text
                        : theme.iconPrimary
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={t(styles.buttonsContainer, {
                    backgroundColor: undefined,
                  })}
                  onPress={async () => {
                    await savePost(postDetail, !postDetail.saved);
                    setPostDetail({
                      ...postDetail,
                      saved: !postDetail.saved,
                    });
                  }}
                >
                  <FontAwesome
                    name={postDetail.saved ? "bookmark" : "bookmark-o"}
                    size={28}
                    color={theme.iconPrimary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonsContainer}
                  onPress={() =>
                    setModal(
                      <Reply
                        userContent={postDetail}
                        replySent={async () => await loadPostDetails()}
                      />,
                    )
                  }
                >
                  <Octicons name="reply" size={28} color={theme.iconPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonsContainer}
                  onPress={() => {
                    const currentPath =
                      history.past.slice(-1)[0]?.elem.props.url;
                    Share.share({ url: new RedditURL(currentPath).toString() });
                  }}
                >
                  <Feather name="share" size={28} color={theme.iconPrimary} />
                </TouchableOpacity>
              </View>
              {postDetail.comments.length > 0 ? (
                <Comments
                  loadMoreComments={loadMoreCommentsFunc}
                  postDetail={postDetail}
                  scrollChange={scrollChange}
                  changeComment={(comment: Comment) => changeComment(comment)}
                />
              ) : (
                <View style={styles.noCommentsContainer}>
                  <Text
                    style={t(styles.noCommentsText, {
                      color: theme.text,
                    })}
                  >
                    No comments
                  </Text>
                </View>
              )}
            </>
          )}
        </Scroller>
      ) : (
        <ActivityIndicator size="small" />
      )}
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
  noCommentsContainer: {
    marginVertical: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  noCommentsText: {
    fontSize: 15,
  },
});
