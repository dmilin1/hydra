import React, { useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  useWindowDimensions,
  TouchableHighlight,
} from "react-native";

import ImageViewer from "./ImageViewer";
import { PostInteractionContext } from "../../../../../contexts/PostInteractionContext";
import { DataModeContext } from "../../../../../contexts/SettingsContexts/DataModeContext";
import { ThemeContext } from "../../../../../contexts/SettingsContexts/ThemeContext";
import { PostSettingsContext } from "../../../../../contexts/SettingsContexts/PostSettingsContext";
import { Post } from "../../../../../api/Posts";
import { MediaViewerContext } from "../../../../../contexts/MediaViewerContext";
import Video from "../../../../UI/Gallery/Video";
import { PostDetail } from "../../../../../api/PostDetail";
import { FontAwesome } from "@expo/vector-icons";

type VideoPlayerProps = {
  post: Post | PostDetail;
};

export default function VideoPlayer({ post }: VideoPlayerProps) {
  const { theme } = useContext(ThemeContext);
  const { currentDataMode } = useContext(DataModeContext);
  const { autoPlayVideos } = useContext(PostSettingsContext);
  const { interactedWithPost } = useContext(PostInteractionContext);
  const { displayMedia } = useContext(MediaViewerContext);
  const { width, height } = useWindowDimensions();

  const dontRender = currentDataMode === "lowData" || !autoPlayVideos;

  const videoRatio = post.mediaAspectRatio ?? 1;
  const heightIfFullSize = width / videoRatio;
  const videoHeight = Math.min(height * 0.6, heightIfFullSize);

  return (
    <TouchableHighlight
      style={{
        height: videoHeight,
      }}
      onPress={() => {
        interactedWithPost();
        displayMedia({
          media: [
            post.videos.map((video) => ({ type: "video", source: video })),
          ],
          getCurrentPost: () => post,
        });
      }}
    >
      <View style={{ flex: 1 }}>
        {dontRender ? (
          /* Have to put an invisible layer on top of the ImageViewer to keep it from stealing clicks */
          <View style={{ flex: 1 }}>
            <View style={styles.invisibleLayer} />
            {post.imageThumbnail && (
              <ImageViewer
                images={[[post.imageThumbnail]]}
                aspectRatio={post.mediaAspectRatio}
              />
            )}
            <View style={styles.playButtonContainer}>
              <FontAwesome name="play-circle" size={50} color={theme.text} />
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Video uri={post.videos[0].source} />
          </View>
        )}
        {post.videos.length > 1 && (
          <View
            style={[
              styles.videoCountContainer,
              {
                backgroundColor: theme.background,
              },
            ]}
          >
            <Text
              style={[
                styles.videoCountText,
                {
                  color: theme.text,
                },
              ]}
            >
              {post.videos.length} VIDEOS
            </Text>
          </View>
        )}
      </View>
    </TouchableHighlight>
  );
}

const styles = StyleSheet.create({
  invisibleLayer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  videoCountContainer: {
    position: "absolute",
    borderRadius: 5,
    overflow: "hidden",
    margin: 5,
    right: 0,
    bottom: 0,
    opacity: 0.6,
  },
  videoCountText: {
    padding: 5,
  },
  playButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
    zIndex: 1,
  },
});
