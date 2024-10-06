import { AntDesign, Entypo, FontAwesome5 } from "@expo/vector-icons";
import React, { useContext, useEffect, useState } from "react";
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
import { DataModeContext } from "../../../../contexts/SettingsContexts/DataModeContext";
import {
  ThemeContext,
  t,
} from "../../../../contexts/SettingsContexts/ThemeContext";
import MediaLibrary from "../../../../utils/MediaLibrary";
import URL, { OpenGraphData } from "../../../../utils/URL";

type CompactPostMediaProps = {
  post: Post | PostDetail;
  maxLines?: number;
};

const MEDIA_SQUARE_SIZE = 60;

export default function CompactPostMedia({ post }: CompactPostMediaProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);

  const saveImage = MediaLibrary.useSaveImage();

  const [mediaOpen, setMediaOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [openGraphData, setOpenGraphData] = useState<OpenGraphData>();

  const fetchOpenGraphData = async () => {
    if (!post.externalLink) return;
    const data = await new URL(post.externalLink).getOpenGraphData();
    setOpenGraphData(data);
  };

  useEffect(() => {
    fetchOpenGraphData();
  }, []);

  let isGif = false;
  if (post.images.length > 0) {
    isGif = new URL(post.images[0]).getRelativePath().endsWith(".gif");
  }

  return (
    <View
      style={t(styles.container, {
        backgroundColor: theme.tint,
      })}
    >
      {mediaOpen && <ActivityIndicator style={styles.loader} size="small" />}
      {post.video ? (
        <TouchableOpacity
          style={styles.videoContainer}
          onPress={() => setMediaOpen(!mediaOpen)}
        >
          <View style={styles.iconContainer}>
            <AntDesign name="play" style={styles.icon} />
          </View>
          <Image src={post.imageThumbnail} style={styles.image} />
          {mediaOpen && (
            <VideoPlayer
              source={post.video}
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
            {isGif && <AntDesign name="play" style={styles.icon} />}
            {post.images.length > 1 && (
              <Text style={styles.imageCount}>{post.images.length}</Text>
            )}
          </View>
          <Image src={post.imageThumbnail} style={styles.image} />
          {mediaOpen && (
            <ImageView
              images={post.images.map((image) => ({ uri: image }))}
              imageIndex={0}
              presentationStyle="overFullScreen"
              animationType="none"
              visible
              onRequestClose={() => setMediaOpen(false)}
              onLongPress={() => saveImage(post.images[imageIndex])}
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
      ) : post.externalLink ? (
        <View style={styles.externalLinkContainer}>
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
          {openGraphData && currentDataMode !== "lowData" && (
            <Image
              source={{ uri: openGraphData.image }}
              resizeMode="cover"
              style={styles.image}
            />
          )}
        </View>
      ) : (
        <View style={styles.bigIconContainer}>
          <Entypo name="text" style={styles.bigIcon} color={theme.subtleText} />
        </View>
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
  },
});
