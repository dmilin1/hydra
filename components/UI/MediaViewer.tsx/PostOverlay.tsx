import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Post } from "../../../api/Posts";
import { useURLNavigation } from "../../../utils/navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import useMediaSharing from "../../../utils/useMediaSharing";

export default function PostOverlay({
  post,
  rowIndex,
  closeViewer,
  shareMedia,
}: {
  post: Post;
  rowIndex: number;
  closeViewer: () => void;
  shareMedia: ReturnType<typeof useMediaSharing>;
}) {
  const { pushURL } = useURLNavigation();

  const [isDownloading, setIsDownloading] = useState(false);

  const openLink = (link: string) => {
    pushURL(link);
    closeViewer();
  };

  const shareable = post.images.length > 0 || post.videoDownloadURL;

  return (
    <View onTouchEnd={(e) => e.stopPropagation()}>
      {shareable && (
        <TouchableOpacity
          style={styles.shareButton}
          onPress={async () => {
            setIsDownloading(true);
            if (post.images.length > 0) {
              await shareMedia("image", post.images[rowIndex]);
            } else if (post.videoDownloadURL) {
              await shareMedia("video", post.videoDownloadURL);
            }
            setIsDownloading(false);
          }}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons
              name="ios-share"
              size={22}
              color="white"
              style={styles.shareButtonIcon}
            />
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.postOverlay}
        onPress={() => openLink(post.link)}
        activeOpacity={0.7}
      >
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {post.title}
        </Text>
        {post.text && (
          <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">
            {post.text}
          </Text>
        )}
        <View style={styles.metadataContainer}>
          <Text style={styles.metadataText}> in </Text>
          <TouchableOpacity onPress={() => openLink(`/r/${post.subreddit}`)}>
            <Text style={styles.metadataText}>/r/{post.subreddit}</Text>
          </TouchableOpacity>
          <Text style={styles.metadataText}> by </Text>
          <TouchableOpacity onPress={() => openLink(`/user/${post.author}`)}>
            <Text style={styles.metadataText}>{post.author}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    alignSelf: "flex-end",
    width: 40,
    aspectRatio: 1,
    backgroundColor: "rgba(50, 50, 50, 0.65)",
    marginRight: 10,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonIcon: {
    marginTop: -4,
  },
  postOverlay: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "rgba(50, 50, 50, 0.65)",
    gap: 5,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: 500,
  },
  body: {
    color: "white",
    fontSize: 14,
  },
  metadataContainer: {
    flexDirection: "row",
  },
  metadataText: {
    color: "white",
    fontSize: 12,
  },
});
