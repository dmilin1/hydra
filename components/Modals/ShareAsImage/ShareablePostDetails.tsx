import Feather from "@react-native-vector-icons/feather";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

import { PostDetail } from "../../../api/PostDetail";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import PostMedia from "../../RedditDataRepresentations/Post/PostParts/PostMedia";
import SubredditIcon from "../../RedditDataRepresentations/Post/PostParts/SubredditIcon";

type ShareablePostDetailsProps = {
  postDetail: PostDetail;
  hideUsernames: boolean;
  hideSubreddit: boolean;
};

/**
 * Static stand-in for PostDetailsComponent used in the captured image. That
 * component can't render here: it reads the screen's route, eagerly fetches
 * AI summaries, and shows action buttons that make no sense in an image.
 * Videos are dropped so the off screen render can't disturb the shared video
 * players on the visible page; the post's thumbnail renders instead.
 */
export default function ShareablePostDetails({
  postDetail,
  hideUsernames,
  hideSubreddit,
}: ShareablePostDetailsProps) {
  const { theme } = useContext(ThemeContext);

  return (
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
      <PostMedia
        post={{
          ...postDetail,
          videos: [],
          images: postDetail.videos.length > 0 ? [] : postDetail.images,
        }}
      />
      <View style={styles.metadataContainer}>
        <View style={styles.metadataRow}>
          {!hideSubreddit && (
            <>
              <SubredditIcon subredditIcon={postDetail.subredditIcon} />
              <Text
                style={[
                  styles.boldedSmallText,
                  {
                    color: theme.subtleText,
                    backgroundColor: hideSubreddit
                      ? theme.subtleText
                      : undefined,
                    opacity: hideSubreddit ? 0.5 : 1,
                  },
                ]}
              >
                {`r/${postDetail.subreddit}`}
              </Text>
            </>
          )}
          <Text style={[styles.smallText, { color: theme.subtleText }]}>
            {" by "}
          </Text>
          <Text
            style={[
              styles.boldedSmallText,
              {
                color: theme.subtleText,
                backgroundColor: hideUsernames ? theme.subtleText : undefined,
                opacity: hideUsernames ? 0.5 : 1,
              },
            ]}
          >
            {`u/${postDetail.author}`}
          </Text>
        </View>
        <View style={[styles.metadataRow, { marginTop: 5 }]}>
          <Feather name="arrow-up" size={15} color={theme.subtleText} />
          <Text style={[styles.smallText, { color: theme.subtleText }]}>
            {postDetail.upvotes}
          </Text>
          <Text style={[styles.smallText, { color: theme.subtleText }]}>
            {"  •  "}
            {postDetail.timeSince}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postDetailsContainer: {
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
  smallText: {
    fontSize: 14,
  },
  boldedSmallText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
