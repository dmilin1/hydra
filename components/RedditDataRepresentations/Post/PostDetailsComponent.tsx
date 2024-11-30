import { AntDesign, Feather, FontAwesome, Octicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useContext, useState } from "react";
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
import { PostDetail, savePost, vote } from "../../../api/PostDetail";
import { VoteOption } from "../../../api/Posts";
import { ModalContext } from "../../../contexts/ModalContext";
import {
  t,
  ThemeContext,
} from "../../../contexts/SettingsContexts/ThemeContext";
import RedditURL from "../../../utils/RedditURL";
import { useRoute, useURLNavigation } from "../../../utils/navigation";
import ContentEditor from "../../Modals/ContentEditor";

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

  const [mediaCollapsed, setMediaCollapsed] = useState(false);

  const contextDepth = Number(new RedditURL(url).getQueryParam("context") ?? 0);

  const voteOnPost = async (voteOption: VoteOption) => {
    const result = await vote(postDetail, voteOption);
    setPostDetail({
      ...postDetail,
      upvotes: postDetail.upvotes - postDetail.userVote + result,
      userVote: result,
    });
  };

  return (
    <View>
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
                onPress={() => pushURL(`/r/${postDetail.subreddit}`)}
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
                onPress={() => pushURL(`/u/${postDetail.author}`)}
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
              <AntDesign name="arrowup" size={15} color={theme.subtleText} />
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
          style={t(styles.showContextContainer, {
            borderTopColor: theme.divider,
          })}
        >
          <Text style={{ color: theme.buttonText }}>
            This is a comment thread. Click here to view all comments.
          </Text>
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
});
