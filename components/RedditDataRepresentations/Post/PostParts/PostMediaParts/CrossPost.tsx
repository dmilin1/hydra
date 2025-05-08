import { AntDesign, Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import { Post } from "../../../../../api/Posts";
import {
  ThemeContext,
  t,
} from "../../../../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../../../../utils/navigation";
import PostMedia from "../PostMedia";
import SubredditIcon from "../SubredditIcon";

type CrossPostProps = {
  post: Post;
};

export default function CrossPost({ post }: CrossPostProps) {
  const { theme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => pushURL(post.link)}
      style={t(styles.container, { borderColor: theme.divider })}
    >
      <Text numberOfLines={2} style={t(styles.title, { color: theme.text })}>
        {post.title}
      </Text>

      <View style={styles.mediaContainer}>
        <PostMedia post={post} />
      </View>

      <View style={styles.footer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.subredditContainer}
            activeOpacity={0.5}
            onPress={() =>
              pushURL(`https://www.reddit.com/r/${post.subreddit}`)
            }
          >
            <SubredditIcon post={post} />
            <Text style={t(styles.subredditText, { color: theme.subtleText })}>
              r/{post.subreddit}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <AntDesign name="arrowup" size={16} color={theme.subtleText} />
            <Text style={t(styles.metadataText, { color: theme.subtleText })}>
              {post.upvotes}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Feather name="message-square" size={16} color={theme.subtleText} />
            <Text style={t(styles.metadataText, { color: theme.subtleText })}>
              {post.commentCount}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Feather name="clock" size={16} color={theme.subtleText} />
            <Text style={t(styles.metadataText, { color: theme.subtleText })}>
              {post.timeSince}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    padding: 12,
    paddingBottom: 0,
    marginBottom: -5,
  },
  mediaContainer: {
    width: "100%",
  },
  footer: {
    padding: 12,
    paddingTop: 0,
    marginTop: -5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subredditContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  subredditText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metadataText: {
    fontSize: 14,
    marginLeft: 4,
  },
});
