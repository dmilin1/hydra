import { Entypo, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as WebBrowser from "expo-web-browser";
import React, { useContext, useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";

import { default as ImageView } from "./PostMediaParts/ImageView/ImageViewing";
import VideoPlayer from "./PostMediaParts/VideoPlayer";
import { PostDetail } from "../../../../api/PostDetail";
import { Post } from "../../../../api/Posts";
import { PostInteractionContext } from "../../../../contexts/PostInteractionContext";
import { DataModeContext } from "../../../../contexts/SettingsContexts/DataModeContext";
import { PostSettingsContext } from "../../../../contexts/SettingsContexts/PostSettingsContext";
import { ThemeContext } from "../../../../contexts/SettingsContexts/ThemeContext";
import URL from "../../../../utils/URL";
import useImageMenu from "../../../../utils/useImageMenu";
import RedditURL from "../../../../utils/RedditURL";
import { useURLNavigation } from "../../../../utils/navigation";

type CompactPostMediaProps = {
  post: Post | PostDetail;
  maxLines?: number;
};

const MEDIA_SQUARE_SIZE = 60;

export default function CompactPostMedia({ post }: CompactPostMediaProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);
  const { interactedWithPost } = useContext(PostInteractionContext);
  const { pushURL } = useURLNavigation();

  const { blurNSFW, blurSpoilers } = useContext(PostSettingsContext);
  const isBlurable =
    (blurNSFW && post.isNSFW) || (blurSpoilers && post.isSpoiler);
  const [blur, setBlur] = useState(isBlurable);

  const showImageMenu = useImageMenu();

  const [mediaOpen, setMediaOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  let isGif = false;
  if (post.images.length > 0) {
    isGif = new URL(post.images[0]).getRelativePath().endsWith(".gif");
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.tint,
        },
      ]}
    >
      {mediaOpen && <ActivityIndicator style={styles.loader} size="small" />}
      {post.video ? (
        <TouchableOpacity
          style={styles.videoContainer}
          onPress={() => setMediaOpen(!mediaOpen)}
        >
          <View style={styles.iconContainer}>
            <FontAwesome name="play-circle" style={styles.icon} />
          </View>
          {post.imageThumbnail && (
            <Image src={post.imageThumbnail} style={styles.image} />
          )}
          {!post.imageThumbnail && !mediaOpen && (
            <FontAwesome5
              name="video"
              style={styles.videoIcon}
              color={theme.subtleText}
            />
          )}
          {mediaOpen && (
            <VideoPlayer
              source={post.video}
              videoDownloadURL={post.videoDownloadURL}
              thumbnail={post.imageThumbnail}
              straightToFullscreen
              exitedFullScreenCallback={() => setMediaOpen(false)}
            />
          )}
        </TouchableOpacity>
      ) : post.images.length > 0 ? (
        <TouchableOpacity
          style={styles.imgContainer}
          onPress={() => setMediaOpen(!mediaOpen)}
        >
          <View style={styles.iconContainer}>
            {isGif && <FontAwesome name="play-circle" style={styles.icon} />}
            {post.images.length > 1 && (
              <Text style={styles.imageCount}>{post.images.length}</Text>
            )}
          </View>
          {post.imageThumbnail && (
            <Image src={post.imageThumbnail} style={styles.image} />
          )}
          {!post.imageThumbnail && (
            <FontAwesome5
              name="image"
              style={styles.videoIcon}
              color={theme.subtleText}
            />
          )}
          {mediaOpen && (
            <ImageView
              images={post.images.map((image) => ({ uri: image }))}
              initialImageIndex={0}
              presentationStyle="overFullScreen"
              animationType="none"
              visible
              onRequestClose={() => setMediaOpen(false)}
              onLongPress={() => showImageMenu(post.images[imageIndex])}
              onImageIndexChange={(index) => setImageIndex(index)}
              delayLongPress={500}
            />
          )}
        </TouchableOpacity>
      ) : post.poll ? (
        <View style={styles.bigIconContainer}>
          <FontAwesome5
            name="poll"
            style={styles.bigIcon}
            color={theme.subtleText}
          />
        </View>
      ) : post.externalLink || post.crossCommentLink ? (
        <TouchableOpacity
          style={styles.externalLinkContainer}
          onPress={() => {
            const url = post.externalLink ?? post.crossCommentLink;
            if (!url) return;
            interactedWithPost();
            try {
              new RedditURL(url);
              pushURL(url);
            } catch (_) {
              WebBrowser.openBrowserAsync(url);
            }
          }}
        >
          <View
            style={
              currentDataMode === "lowData"
                ? styles.bigIconContainer
                : styles.iconContainer
            }
          >
            <Entypo
              name="link"
              style={
                currentDataMode === "lowData" ? styles.bigIcon : styles.icon
              }
              color={theme.subtleText}
            />
          </View>
          {post.openGraphData && currentDataMode !== "lowData" && (
            <Image
              source={{ uri: post.openGraphData.image }}
              resizeMode="cover"
              style={styles.image}
            />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.bigIconContainer}>
          <Entypo name="text" style={styles.bigIcon} color={theme.subtleText} />
        </View>
      )}
      {isBlurable && blur && (
        <TouchableOpacity
          style={styles.blurContainer}
          onPress={() => setBlur(false)}
          activeOpacity={1}
        >
          <BlurView intensity={80} style={styles.blur} />
          <View style={styles.blurIconContainer}>
            <View
              style={[
                styles.blurIconBox,
                {
                  backgroundColor: theme.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.blurText,
                  {
                    color: theme.subtleText,
                  },
                ]}
              >
                {post.isNSFW ? "NSFW" : post.isSpoiler ? "Spoiler" : ""}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MEDIA_SQUARE_SIZE,
    height: MEDIA_SQUARE_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  loader: {
    zIndex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
    color: "white",
  },
  iconContainer: {
    padding: 3,
    position: "absolute",
    zIndex: 1,
    width: "100%",
    height: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  icon: {
    fontSize: 18,
    color: "white",
    textShadowColor: "black",
    textShadowOffset: { width: 0.5, height: 1 },
    textShadowRadius: 3,
  },
  videoIcon: {
    fontSize: 18,
  },
  bigIconContainer: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bigIcon: {
    fontSize: 35,
  },
  imageCount: {
    fontSize: 12,
    padding: 2,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    textAlign: "center",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  externalLinkContainer: {
    height: MEDIA_SQUARE_SIZE,
    width: MEDIA_SQUARE_SIZE,
  },
  imgContainer: {
    height: MEDIA_SQUARE_SIZE,
    width: MEDIA_SQUARE_SIZE,
  },
  videoContainer: {
    height: MEDIA_SQUARE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  blurContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
  blur: {
    width: "100%",
    height: "100%",
  },
  blurIconContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  blurIconBox: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
    opacity: 0.5,
    borderRadius: 10,
    backgroundColor: "pink",
    alignItems: "center",
  },
  blurText: {
    fontSize: 10,
  },
});
