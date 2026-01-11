import {
  ActivityIndicator,
  Alert,
  Share,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { File, Paths } from "expo-file-system/next";
import { Post } from "../../../api/Posts";
import { useURLNavigation } from "../../../utils/navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { getBase64Img } from "../../../utils/useImageMenu";
import URL from "../../../utils/URL";
import { useState } from "react";

export default function PostOverlay({
  post,
  rowIndex,
  closeViewer,
}: {
  post: Post;
  rowIndex: number;
  closeViewer: () => void;
}) {
  const { pushURL } = useURLNavigation();

  const [isDownloading, setIsDownloading] = useState(false);

  const openLink = (link: string) => {
    pushURL(link);
    closeViewer();
  };

  const shareImage = async () => {
    try {
      const imageUrl = post.images[rowIndex];
      setIsDownloading(true);
      const base64 = await getBase64Img(imageUrl);
      Share.share({
        url: base64,
      });
    } catch (_e) {
      Alert.alert("Error", "Failed to download image");
    }
    setIsDownloading(false);
  };

  const shareVideo = async () => {
    const videoUrl = post.videoDownloadURL;
    if (!videoUrl) return;
    setIsDownloading(true);
    try {
      const fileName = new URL(videoUrl).getBasePath().split("/").pop();
      const file = new File(`${Paths.cache.uri}/${fileName}`);
      if (file.exists) {
        file.delete();
      }
      await File.downloadFileAsync(videoUrl, file);
      setIsDownloading(false);
      await Share.share({
        url: file.uri,
      });
      file.delete();
    } catch (_e) {
      setIsDownloading(false);
      Alert.alert("Error", "Failed to download video");
    }
  };

  const shareMedia = () => {
    if (post.images.length > 0) {
      shareImage();
    } else if (post.video) {
      shareVideo();
    }
  };

  return (
    <View onTouchEnd={(e) => e.stopPropagation()}>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => shareMedia()}
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
