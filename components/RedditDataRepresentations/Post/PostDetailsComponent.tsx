import { AntDesign, Feather, FontAwesome, Octicons } from "@expo/vector-icons";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  TouchableOpacity,
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Share,
} from "react-native";

import PostMedia from "./PostParts/PostMedia";
import SubredditIcon from "./PostParts/SubredditIcon";
import { summarizePostDetails, summarizePostComments } from "../../../api/AI";
import { PostDetail, vote } from "../../../api/PostDetail";
import { VoteOption } from "../../../api/Posts";
import { saveItem } from "../../../api/Save";
import { ModalContext } from "../../../contexts/ModalContext";
import { CommentSettingsContext } from "../../../contexts/SettingsContexts/CommentSettingsContext";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import RedditURL from "../../../utils/RedditURL";
import { useRoute, useURLNavigation } from "../../../utils/navigation";
import NewComment from "../../Modals/NewComment";

type Summary = {
  post: string | null;
  comments: string | null;
};

type PostDetailsComponentProps = {
  postDetail: PostDetail;
  loadPostDetails: () => Promise<void>;
  setPostDetail: Dispatch<SetStateAction<PostDetail | undefined>>;
};

export default function PostDetailsComponent({
  postDetail,
  loadPostDetails,
  setPostDetail,
}: PostDetailsComponentProps) {
  const { params } = useRoute<"PostDetailsPage">();
  const url = params.url;
  const { pushURL } = useURLNavigation();

  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);
  const { isPro, customerId } = useContext(SubscriptionsContext);
  const { showPostSummary } = useContext(PostSettingsContext);
  const { showCommentSummary } = useContext(CommentSettingsContext);

  const [mediaCollapsed, setMediaCollapsed] = useState(false);
  const [commentSummaryCollapsed, setCommentSummaryCollapsed] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const contextDepth = Number(new RedditURL(url).getQueryParam("context") ?? 0);

  const voteOnPost = async (voteOption: VoteOption) => {
    const result = await vote(postDetail, voteOption);
    setPostDetail({
      ...postDetail,
      upvotes: postDetail.upvotes - postDetail.userVote + result,
      userVote: result,
    });
  };

  const getSummary = async () => {
    if (!isPro || !customerId) return;
    let postSummary = null;
    let commentsSummary = null;
    if (showPostSummary && postDetail.text.length > 850) {
      postSummary = await summarizePostDetails(customerId, postDetail);
      setSummary({
        post: postSummary,
        comments: null,
      });
    }
    if (
      showCommentSummary &&
      postDetail.comments.reduce(
        (acc, comment) => acc + comment.text.length,
        0,
      ) > 1_000
    ) {
      commentsSummary = await summarizePostComments(
        customerId,
        postDetail,
        postSummary ?? postDetail.text,
      );
      setSummary({
        post: postSummary,
        comments: commentsSummary,
      });
    }
  };

  useEffect(() => {
    getSummary();
  }, []);

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setMediaCollapsed(!mediaCollapsed)}
      >
        <View style={styles.postDetailsContainer}>
          <Text
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            {postDetail.title}
          </Text>
          {!mediaCollapsed && summary?.post && postDetail.text.length > 850 && (
            <View
              style={[
                styles.postSummaryContainer,
                {
                  borderColor: theme.divider,
                },
              ]}
            >
              <Text
                style={[
                  styles.postSummaryTitle,
                  {
                    color: theme.text,
                  },
                ]}
              >
                Summary
              </Text>
              <Text
                style={[
                  styles.postSummaryText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {summary.post}
              </Text>
            </View>
          )}
          {!mediaCollapsed && <PostMedia post={postDetail} />}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataRow}>
              {postDetail.isStickied && (
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
                style={styles.subredditContainer}
                activeOpacity={0.5}
                onPress={() => pushURL(`/r/${postDetail.subreddit}`)}
              >
                <SubredditIcon post={postDetail} />
                <Text
                  style={[
                    styles.boldedSmallText,
                    {
                      color: theme.subtleText,
                    },
                  ]}
                >
                  {`r/${postDetail.subreddit}`}
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {" by "}
              </Text>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => pushURL(`/user/${postDetail.author}`)}
              >
                <Text
                  style={[
                    styles.boldedSmallText,
                    {
                      color: postDetail.isModerator
                        ? theme.moderator
                        : theme.subtleText,
                    },
                  ]}
                >
                  {`u/${postDetail.author}`}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.metadataRow, { marginTop: 5 }]}>
              <AntDesign name="arrowup" size={15} color={theme.subtleText} />
              <Text
                style={[
                  styles.smallText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {postDetail.upvotes}
              </Text>
              <Text
                style={[
                  styles.smallText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {"  •  "}
                {postDetail.timeSince}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View
        style={[
          styles.buttonsBarContainer,
          {
            borderTopColor: theme.divider,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.buttonsContainer,
            {
              backgroundColor:
                postDetail.userVote === VoteOption.UpVote
                  ? theme.upvote
                  : undefined,
            },
          ]}
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
          style={[
            styles.buttonsContainer,
            {
              backgroundColor:
                postDetail.userVote === VoteOption.DownVote
                  ? theme.downvote
                  : undefined,
            },
          ]}
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
          style={[
            styles.buttonsContainer,
            {
              backgroundColor: undefined,
            },
          ]}
          onPress={async () => {
            await saveItem(postDetail, !postDetail.saved);
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
              <NewComment
                parent={postDetail}
                contentSent={() => setTimeout(() => loadPostDetails(), 5_000)}
              />,
            )
          }
        >
          <Octicons name="reply" size={28} color={theme.iconPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonsContainer}
          onPress={() => {
            Share.share({ url: new RedditURL(url).toString() });
          }}
        >
          <Feather name="share" size={28} color={theme.iconPrimary} />
        </TouchableOpacity>
      </View>
      {contextDepth > 0 && (
        <TouchableHighlight
          onPress={() => {
            pushURL(
              new RedditURL(
                `https://www.reddit.com/r/${postDetail.subreddit}/comments/${postDetail.id}/`,
              ).toString(),
            );
          }}
          style={[
            styles.showContextContainer,
            {
              borderTopColor: theme.divider,
            },
          ]}
        >
          <Text style={{ color: theme.iconOrTextButton }}>
            This is a comment thread. Click here to view all comments.
          </Text>
        </TouchableHighlight>
      )}
      {summary?.comments && (
        <TouchableHighlight
          onPress={() => setCommentSummaryCollapsed(!commentSummaryCollapsed)}
          style={[
            styles.commentsSummaryContainer,
            {
              borderTopColor: theme.divider,
            },
          ]}
        >
          <>
            <Text
              style={[
                styles.commentsSummaryTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              Comments Summary
            </Text>
            {!commentSummaryCollapsed && (
              <Text
                style={[
                  styles.commentsSummaryText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {summary.comments}
              </Text>
            )}
          </>
        </TouchableHighlight>
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
  postSummaryContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 3,
  },
  postSummaryText: {
    fontSize: 15,
  },
  postSummaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 5,
  },
  commentsSummaryContainer: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  commentsSummaryTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  commentsSummaryText: {
    marginTop: 8,
    fontSize: 15,
  },
});
