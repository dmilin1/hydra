import { AntDesign, Feather, FontAwesome, Octicons } from "@expo/vector-icons";
import React, {
  useContext,
  useCallback,
  useRef,
  useEffect,
  useState,
  ReactNode,
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
import ContentEditor from "../components/Modals/ContentEditor";
import Comments from "../components/RedditDataRepresentations/Post/PostParts/Comments";
import PostMedia from "../components/RedditDataRepresentations/Post/PostParts/PostMedia";
import SubredditIcon from "../components/RedditDataRepresentations/Post/PostParts/SubredditIcon";
import Scroller from "../components/UI/Scroller";
import {
  HistoryContext,
  HistoryFunctionsContext,
} from "../contexts/HistoryContext";
import { ModalContext } from "../contexts/ModalContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../utils/RedditURL";
import { StackPageProps } from "../app/stack";

export type LoadMoreCommentsFunc = (
  commentIds: string[],
  commentPath: number[],
  childStartIndex: number,
) => Promise<void>;

export default function PostDetails({ route, navigation }: StackPageProps<"PostDetailsPage">) {
  const url = route.params.url;

  const { theme } = useContext(ThemeContext);
  const history = {
    ...useContext(HistoryContext),
    ...useContext(HistoryFunctionsContext),
  };
  const { setModal } = useContext(ModalContext);

  const scrollView = useRef<VirtualizedList<ReactNode>>(null);
  const commentsView = React.useRef<View>(null);

  const [postDetail, setPostDetail] = useState<PostDetail>();
  const [mediaCollapsed, setMediaCollapsed] = useState(false);

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
    const childComments = (commentsView.current as any)._children[0]._children;
    for (const comment of childComments) {
      const commentMeasures = await asyncMeasure(comment, "measureInWindow");
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
        >
          {postDetail && (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMediaCollapsed(!mediaCollapsed)}
              >
                <View style={styles.postDetailsContainer}>
                  <Text
                    style={t(styles.title, {
                      color: theme.text,
                    })}
                  >
                    {postDetail.title}
                  </Text>

                  {!mediaCollapsed && <PostMedia post={postDetail} />}
                  <View style={styles.metadataContainer}>
                    <View style={styles.metadataRow}>
                      {postDetail.isStickied && (
                        <AntDesign
                          name="pushpin"
                          style={t(styles.stickiedIcon, {
                            color: theme.moderator,
                          })}
                        />
                      )}
                      <TouchableOpacity
                        style={styles.subredditContainer}
                        activeOpacity={0.5}
                        onPress={() =>
                          history.pushPath(`/r/${postDetail.subreddit}`)
                        }
                      >
                        <SubredditIcon post={postDetail} />
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
                            color: postDetail.isModerator
                              ? theme.moderator
                              : theme.subtleText,
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
              </TouchableOpacity>
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
                      <ContentEditor
                        mode="makeComment"
                        parent={postDetail}
                        contentSent={async () => await loadPostDetails()}
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
                  ref={commentsView}
                  loadMoreComments={loadMoreCommentsFunc}
                  postDetail={postDetail}
                  scrollChange={scrollChange}
                  changeComment={(comment: Comment) => changeComment(comment)}
                  deleteComment={(comment: Comment) => deleteComment(comment)}
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
