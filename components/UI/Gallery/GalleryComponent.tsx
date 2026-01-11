import React, { useContext, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { Post } from "../../../api/Posts";
import { Image } from "expo-image";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import MediaViewer, { MediaViewerRef } from "../MediaViewer.tsx/MediaViewer";
import Video from "./Video";
import PostOverlay from "../MediaViewer.tsx/PostOverlay";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../GetHydraProButton";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";

type GalleryItem = {
  uri: string;
  mediaAspectRatio: number;
} & (
  | {
      type: "image";
    }
  | {
      type: "video";
    }
);

type GalleryComponentProps = {
  posts: Post[];
  loadMore: () => Promise<void>;
  fullyLoaded: boolean;
  hitFilterLimit: boolean;
};

const FREE_LIMIT_POST_COUNT = 100;

export default function GalleryComponent({
  posts,
  loadMore,
  fullyLoaded,
  hitFilterLimit,
}: GalleryComponentProps) {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 1000,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [hitFreeLimit, setHitFreeLimit] = useState(false);

  const flashListRef = useRef<FlashListRef<GalleryItem>>(null);
  const mediaViewerRef = useRef<MediaViewerRef>(null);

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

  const loadMoreData = async () => {
    if (fullyLoaded || hitFreeLimit) return;
    if (!isPro && posts.length >= FREE_LIMIT_POST_COUNT) {
      setHitFreeLimit(true);
      return;
    }
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  };

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
            style={[
              styles.imageContainer,
              {
                width: contentDimensions.width / 2,
                height: contentDimensions.width / 2 / item.mediaAspectRatio,
              },
            ]}
          >
            {item.type === "image" ? (
              <Image
                style={styles.image}
                source={{ uri: item.uri }}
                contentFit="contain"
                autoplay={false}
                recyclingKey={item.uri}
                /**
                 * Downscaling images seems to cause a glitchy scrolling because
                 * of heavy CPU usage. No downscaling increase memory usage. If
                 * users start getting crashes, we may have to find a smarter way
                 * to load lower res images.
                 */
                allowDownscaling={false}
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
        drawDistance={200}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={2}
        onEndReached={() => loadMoreData()}
        ListFooterComponent={
          <View style={styles.endOfListContainer}>
            {isLoadingMore && !hitFilterLimit && (
              <ActivityIndicator size="small" />
            )}
            {!isLoadingMore && fullyLoaded && !!posts.length && (
              <Text
                style={[
                  styles.endOfListText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                {`Wow. You've reached the bottom.`}
              </Text>
            )}
            {hitFilterLimit && (
              <Text
                style={[
                  styles.endOfListText,
                  {
                    color: theme.text,
                  },
                ]}
              >
                The filter limit has been reached. Your filters may be too
                strict to show anything or this subreddit has no posts with
                media.
              </Text>
            )}
            {hitFreeLimit && (
              <View style={styles.freeLimitContainer}>
                <Text
                  style={[
                    styles.endOfListText,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Upgrade to Hydra Pro to support my work and to scroll past{" "}
                  {FREE_LIMIT_POST_COUNT} posts in Gallery Mode.
                </Text>
                <GetHydraProButton />
              </View>
            )}
          </View>
        }
      />
      <MediaViewer
        ref={mediaViewerRef}
        media={viewerMedia}
        overlayComponent={(index, rowIndex) => (
          <PostOverlay
            post={posts[index]}
            closeViewer={() => mediaViewerRef.current?.close()}
            rowIndex={rowIndex}
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
  imageContainer: {
    padding: 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  endOfListContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  endOfListText: {
    fontSize: 14,
    marginHorizontal: 20,
  },
  freeLimitContainer: {
    alignItems: "stretch",
    justifyContent: "center",
  },
});
