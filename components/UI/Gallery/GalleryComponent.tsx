import React, { useContext, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Platform,
} from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { Post } from "../../../api/Posts";
import { Image, ImageSource } from "expo-image";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import Video from "./Video";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../GetHydraProButton";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import { MediaViewerContext } from "../../../contexts/MediaViewerContext";
import GallerySeenTracker from "./gallerySeenTracker";

type GalleryItem = {
  post: Post;
  postId: string;
  mediaIndex: number;
  mediaCount: number;
  mediaAspectRatio: number;
} & (
  | {
      type: "image";
      source: string | ImageSource[];
    }
  | {
      type: "video";
      source: Post["videos"][number];
    }
);

type GalleryComponentProps = {
  posts: Post[];
  loadMore: () => Promise<void>;
  fullyLoaded: boolean;
  hitFilterLimit: boolean;
  onPostScrolledPast?: (post: Post) => void | Promise<void>;
};

const FREE_LIMIT_POST_COUNT = 100;

export default function GalleryComponent({
  posts,
  loadMore,
  fullyLoaded,
  hitFilterLimit,
  onPostScrolledPast,
}: GalleryComponentProps) {
  const { theme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);
  const { displayMedia, updateMedia } = useContext(MediaViewerContext);

  const [contentDimensions, setContentDimensions] = useState({
    width: 0,
    height: 1000,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(true);
  const [hitFreeLimit, setHitFreeLimit] = useState(false);

  const flashListRef = useRef<FlashListRef<GalleryItem>>(null);
  const seenTrackerRef = useRef(new GallerySeenTracker());
  const lastScrollPositionRef = useRef(0);
  const scrollingForwardRef = useRef(true);

  /**
   * This looks weird, but it's because we need to be able to fetch the post data
   * from the most recent render of the gallery. If we don't do this, when deeply
   * scrolling through the media viewer, the post data will be stale.
   */
  const getCurrentPostRef = useRef<(rowIndex: number) => Post | null>(
    () => null,
  );
  getCurrentPostRef.current = (rowIndex: number) => posts[rowIndex];

  const galleryMedia: GalleryItem[] = posts.flatMap((post) => {
    if (post.videos.length > 0) {
      const mediaCount = post.videos.length;
      return post.videos.map((video, mediaIndex) => ({
        type: "video" as const,
        source: video,
        post,
        postId: post.id,
        mediaIndex,
        mediaCount,
        mediaAspectRatio: post.mediaAspectRatio,
      }));
    } else if (post.images.length > 0) {
      const mediaCount = post.images.length;
      return post.images.map((image, mediaIndex) => ({
        type: "image" as const,
        source: image,
        post,
        postId: post.id,
        mediaIndex,
        mediaCount,
        mediaAspectRatio: post.mediaAspectRatio,
      }));
    } else {
      return [] as GalleryItem[];
    }
  });

  const viewerMedia = posts.map((post) => {
    if (post.videos.length > 0) {
      return post.videos.map((video) => ({
        type: "video" as const,
        source: video,
      }));
    } else if (post.images.length > 0) {
      return post.images.map((image) => ({
        type: "image" as const,
        source: image,
      }));
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

  useEffect(() => {
    updateMedia(viewerMedia);
  }, [viewerMedia.length]);

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
          <Touchable
            onPress={() =>
              displayMedia({
                media: viewerMedia,
                initialIndex: index,
                getCurrentPost: getCurrentPostRef,
                onFocusedItemChange: (index) =>
                  flashListRef.current?.scrollToIndex({
                    index,
                  }),
              })
            }
            activeOpacity={0.9}
            animationDuration={{ in: 0, out: 150 }}
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
                source={item.source}
                contentFit="contain"
                autoplay={false}
                recyclingKey={
                  typeof item.source === "string"
                    ? item.source
                    : item.source[0].uri
                }
                /**
                 * Downscaling images seems to cause a glitchy scrolling because
                 * of heavy CPU usage on iOS. No downscaling increase memory usage.
                 * If users start getting crashes, we may have to find a smarter way
                 * to load lower res images.
                 */
                allowDownscaling={Platform.OS === "ios" ? false : true}
              />
            ) : item.type === "video" ? (
              <Video video={item.source} />
            ) : null}
          </Touchable>
        )}
        getItemType={(item) => item.type}
        keyExtractor={(item) => `${item.postId}-${item.mediaIndex}`}
        masonry={true}
        optimizeItemArrangement={true}
        drawDistance={200}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        onScroll={
          onPostScrolledPast
            ? (event) => {
                const scrollPosition = event.nativeEvent.contentOffset.y;
                const scrollDelta =
                  scrollPosition - lastScrollPositionRef.current;
                if (Math.abs(scrollDelta) > 1) {
                  scrollingForwardRef.current = scrollDelta > 0;
                }
                lastScrollPositionRef.current = scrollPosition;
              }
            : undefined
        }
        onViewableItemsChanged={
          onPostScrolledPast
            ? ({ changed }) => {
                const changedPosts = new Map<string, Post>();
                for (const { item } of changed) {
                  changedPosts.set(item.postId, item.post);
                }

                const newlySeenPostIds = seenTrackerRef.current.update(
                  changed.map(({ item, isViewable }) => ({
                    item,
                    isViewable,
                  })),
                  scrollingForwardRef.current,
                );

                for (const postId of newlySeenPostIds) {
                  const post = changedPosts.get(postId);
                  if (post) {
                    void onPostScrolledPast(post);
                  }
                }
              }
            : undefined
        }
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
