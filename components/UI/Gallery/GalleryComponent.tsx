import React, { useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Post } from "../../../api/Posts";
import { Image } from "expo-image";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import MediaViewer, { MediaViewerRef } from "../MediaViewer.tsx/MediaViewer";
import Video from "./Video";
import PostOverlay from "../MediaViewer.tsx/PostOverlay";

type GalleryItem = {
  type: "image" | "video";
  uri: string;
  mediaAspectRatio: number;
};

type GalleryComponentProps = {
  posts: Post[];
  loadMore: () => void;
};

export default function GalleryComponent({
  posts: unfilteredPosts,
  loadMore,
}: GalleryComponentProps) {
  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 1000,
  });

  const flashListRef = useRef<FlashListRef<GalleryItem>>(null);
  const mediaViewerRef = useRef<MediaViewerRef>(null);

  const posts = unfilteredPosts.filter(
    (post) => post.images.length > 0 || post.video !== undefined,
  );

  const galleryMedia: GalleryItem[] = posts.flatMap((post) => {
    if (post.images.length > 0) {
      return post.images.map((image) => ({
        type: "image",
        uri: image,
        mediaAspectRatio: post.mediaAspectRatio,
      }));
    } else if (post.video !== undefined) {
      return [
        {
          type: "video",
          uri: post.video,
          mediaAspectRatio: post.mediaAspectRatio,
        },
      ];
    } else {
      return [] as GalleryItem[];
    }
  });

  const viewerMedia = posts.map((post) => {
    if (post.images.length > 0) {
      return post.images.map((image) => ({
        type: "image" as const,
        uri: image,
      }));
    } else if (post.video !== undefined) {
      return [{ type: "video" as const, uri: post.video }];
    } else {
      return [];
    }
  });

  return (
    <View
      style={styles.container}
      onLayout={({ nativeEvent }) => {
        setContentDimensions({
          width: nativeEvent.layout.width,
          height: nativeEvent.layout.height,
        });
      }}
    >
      <FlashList
        ref={flashListRef}
        data={galleryMedia}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => mediaViewerRef.current?.open(index)}
            activeOpacity={0.9}
            style={{
              padding: 2,
              width: contentDimensions.width / 2,
              height: contentDimensions.width / 2 / item.mediaAspectRatio,
            }}
          >
            {item.type === "image" ? (
              <Image
                style={{ width: "100%", height: "100%" }}
                source={{ uri: item.uri }}
                contentFit="contain"
                autoplay={false}
                recyclingKey={item.uri}
              />
            ) : item.type === "video" ? (
              <Video uri={item.uri} />
            ) : null}
          </TouchableOpacity>
        )}
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.uri}
        masonry={true}
        optimizeItemArrangement={true}
        drawDistance={500}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={2}
        onEndReached={() => {
          loadMore();
        }}
      />
      <MediaViewer
        ref={mediaViewerRef}
        media={viewerMedia}
        overlayComponent={(index) => (
          <PostOverlay
            post={posts[index]}
            closeViewer={() => mediaViewerRef.current?.close()}
          />
        )}
        onFocusedItemChange={(columnIndex, rowIndex) => {
          let trueIndex = 0;
          for (let i = 0; i < columnIndex; i++) {
            trueIndex += viewerMedia[i].length;
          }
          trueIndex += rowIndex;
          flashListRef.current?.scrollToIndex({
            index: trueIndex,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
