import AntDesign from "@react-native-vector-icons/ant-design";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { Image } from "expo-image";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { Comment, PostDetail } from "../../../../../api/PostDetail";
import { VoteOption } from "../../../../../api/Posts";
import { Theme } from "../../../../../constants/Themes";
import Time from "../../../../../utils/Time";

type CommentTopBarProps = {
  comment: PostDetail | Comment;
  theme: Theme;
  showFlair: boolean;
  bodyHidden: boolean;
  onPressAuthor: () => void;
  onPressUpvote: () => void;
};

/**
 * Props only, no hooks or context reads. This renders inside
 * CommentComponent's cached JSX, so a context read here could show fresher
 * values than the cached props around it.
 */
export default function CommentTopBar({
  comment,
  theme,
  showFlair,
  bodyHidden,
  onPressAuthor,
  onPressUpvote,
}: CommentTopBarProps) {
  const voteColor =
    comment.userVote === VoteOption.UpVote
      ? theme.upvote
      : comment.userVote === VoteOption.DownVote
        ? theme.downvote
        : theme.subtleText;

  return (
    <View style={[styles.topBar, { marginBottom: bodyHidden ? 0 : 8 }]}>
      {comment.isStickied && (
        <AntDesign
          name="pushpin"
          style={[styles.stickiedIcon, { color: theme.moderator }]}
        />
      )}
      <Touchable
        activeOpacity={0.2}
        animationDuration={{ in: 0, out: 150 }}
        onPress={onPressAuthor}
      >
        <Text
          style={[
            styles.author,
            {
              color: comment.isOP
                ? theme.iconOrTextButton
                : comment.isModerator
                  ? theme.moderator
                  : theme.text,
            },
          ]}
        >
          {comment.author}
        </Text>
      </Touchable>
      <Touchable
        style={styles.upvoteContainer}
        activeOpacity={0.2}
        animationDuration={{ in: 0, out: 150 }}
        onPress={onPressUpvote}
      >
        <AntDesign
          name={
            comment.userVote === VoteOption.DownVote ? "arrow-down" : "arrow-up"
          }
          size={14}
          color={voteColor}
        />
        <Text style={[styles.smallText, { color: voteColor }]}>
          {comment.scoreHidden && !comment.userVote ? "-" : comment.upvotes}
        </Text>
      </Touchable>
      {comment.editedAt && (
        <Touchable
          style={styles.editedAtContainer}
          activeOpacity={0.2}
          animationDuration={{ in: 0, out: 150 }}
          onPress={() => {
            if (!comment.editedAt) return;
            const timeSinceEdited = new Time(
              comment.editedAt,
            ).prettyTimeSince();
            Alert.alert(
              `Edited ${timeSinceEdited} ago`,
              `Comment was edited at ${new Date(comment.editedAt).toLocaleString()}`,
            );
          }}
        >
          <FontAwesome name="pencil" size={14} color={theme.subtleText} />
        </Touchable>
      )}
      {showFlair && comment.flair && (
        <Touchable
          style={[styles.flairContainer, { backgroundColor: theme.divider }]}
          activeOpacity={0.2}
          animationDuration={{ in: 0, out: 150 }}
          onPress={() => alert(comment.flair?.text ?? "No flair text")}
        >
          {comment.flair.emojis.map((emoji, index) => (
            <Image
              key={index}
              source={{ uri: emoji }}
              style={styles.flairEmoji}
            />
          ))}
          {comment.flair.text && (
            <Text
              style={[styles.flairText, { color: theme.text }]}
              numberOfLines={1}
            >
              {comment.flair.text}
            </Text>
          )}
        </Touchable>
      )}
      <View style={styles.topBarEnd}>
        <Text style={[styles.smallText, { color: theme.subtleText }]}>
          {comment.shortTimeSince}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stickiedIcon: {
    fontSize: 16,
  },
  author: {
    fontSize: 14,
    fontWeight: "500",
  },
  upvoteContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallText: {
    fontSize: 14,
  },
  editedAtContainer: {
    padding: 8,
    margin: -8,
    marginLeft: -3,
  },
  flairContainer: {
    flexShrink: 1,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 5,
    gap: 2,
    marginVertical: -10,
  },
  flairEmoji: {
    width: 16,
    height: 16,
  },
  flairText: {
    flexShrink: 1,
  },
  topBarEnd: {
    flexGrow: 1,
    alignItems: "flex-end",
  },
});
