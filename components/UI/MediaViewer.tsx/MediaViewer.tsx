import { FontAwesome6 } from "@expo/vector-icons";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MediaVideo, { VideoItem } from "./MediaVideo";
import { ImageItem, MediaImage } from "./MediaImage";
import * as ExpoOrientation from "expo-screen-orientation";
import PostOverlay from "./PostOverlay";
import { Post } from "../../../api/Posts";
import { PostDetail } from "../../../api/PostDetail";

type MediaItem = ImageItem | VideoItem;

type MediaItemRow = MediaItem[];

export type MediaItemCollection = MediaItemRow[];

type MediaViewerProps = {
  media: MediaItemCollection;
  startingRowIndex: number;
  startingColumnIndex: number;
  onFocusedItemChange?: (index: number) => void;
  getCurrentPost?: (rowIndex: number) => Post | PostDetail | null;
  onClose: () => void;
};

export default function MediaViewer({
  media,
  startingRowIndex,
  startingColumnIndex,
  onFocusedItemChange,
  getCurrentPost,
  onClose,
}: MediaViewerProps) {
  const { width, height } = useWindowDimensions();
  const {
    top: safeAreaTop,
    bottom: safeAreaBottom,
    left: safeAreaLeft,
    right: safeAreaRight,
  } = useSafeAreaInsets();

  const columnFlashListRef = useRef<FlashListRef<MediaItemRow>>(null);
  const rowFlashListRef = useRef<FlashListRef<MediaItem>>(null);

  const overlayTapStart = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);

  // Track horizontal scroll position for each row independently
  const rowScrollPositions = useRef<Map<number, number>>(new Map());

  const scrolledAwayY = useRef(new Animated.Value(0));
  const scrolledAwayX = useRef(new Animated.Value(0));
  const opacity = Animated.add(
    scrolledAwayY.current,
    scrolledAwayX.current,
  ).interpolate({
    inputRange: [-150, -50, 0],
    outputRange: [0, 0.85, 1],
  });
  const scale = Animated.add(
    scrolledAwayY.current,
    scrolledAwayX.current,
  ).interpolate({
    inputRange: [-150, -50, 0],
    outputRange: [0.9, 0.95, 1],
  });

  const showOverlay = useRef(false);
  const overlayOpacity = useRef(new Animated.Value(0));

  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const [isScrollLocked, setIsScrollLocked] = useState(false);

  const tapToScrollColumnIndex = useRef<number>(0);
  const lastTapToScrollTime = useRef<number>(0);

  // These track the initial position when opening - used for initialScrollIndex
  // They don't change during scrolling, only when open() is called or orientation changes
  const [initialRowIndex, setInitialRowIndex] = useState(startingRowIndex);
  const [initialColumnIndex, setInitialColumnIndex] =
    useState(startingColumnIndex);

  const currentRowSize = media[currentRowIndex]?.length ?? 0;

  const currentPost = getCurrentPost?.(currentRowIndex);

  const handleTapToScrollRow = (direction: "left" | "right") => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapToScrollTime.current;
    const currentIndex =
      timeSinceLastTap < 300
        ? tapToScrollColumnIndex.current
        : currentColumnIndex;
    lastTapToScrollTime.current = now;
    tapToScrollColumnIndex.current =
      currentIndex + (direction === "left" ? -1 : 1);
    rowFlashListRef.current?.scrollToIndex({
      index: tapToScrollColumnIndex.current,
    });
  };

  useEffect(() => {
    if (!onFocusedItemChange) return;
    let trueIndex = 0;
    for (let i = 0; i < currentRowIndex; i++) {
      trueIndex += media[i].length;
    }
    trueIndex += currentColumnIndex;
    onFocusedItemChange?.(trueIndex);
  }, [currentRowIndex, currentColumnIndex]);

  useEffect(() => {
    ExpoOrientation.unlockAsync();
    return () => {
      ExpoOrientation.lockAsync(ExpoOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const [orientation, setOrientation] = useState<ExpoOrientation.Orientation>(
    ExpoOrientation.Orientation.PORTRAIT_UP,
  );
  useEffect(() => {
    /**
     * Resetting the FlashLists using a key when orientation changes feels like a hack,
     * but something is broken inside FlashList that causes the snapping mechanism to
     * break when width and height changes. This may not be necessary in the future
     * if they fix it.
     */
    const listener = ExpoOrientation.addOrientationChangeListener((e) => {
      setOrientation(e.orientationInfo.orientation);
      setInitialRowIndex(currentRowIndex);
      setInitialColumnIndex(currentColumnIndex);
    });
    return () => listener.remove();
  }, [currentRowIndex, currentColumnIndex]);

  return (
    <Modal
      visible={true}
      onRequestClose={() => onClose()}
      transparent={true}
      supportedOrientations={["portrait", "landscape"]}
    >
      <Animated.View
        style={[
          styles.background,
          {
            opacity,
          },
        ]}
      />
      <TouchableOpacity
        onPress={() => onClose()}
        style={[
          styles.closeButton,
          {
            top: safeAreaTop + 10,
            right: safeAreaRight + 10,
          },
        ]}
      >
        <FontAwesome6 name="xmark" size={20} color="white" />
      </TouchableOpacity>
      {currentRowSize > 1 && (
        <Animated.View
          style={[
            styles.rowDetailsContainer,
            {
              bottom: safeAreaBottom + 10,
              right: safeAreaRight + 10,
              opacity: overlayOpacity.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.rowNavigationButton,
              {
                opacity: currentColumnIndex === 0 ? 0.5 : 1,
              },
            ]}
            disabled={currentColumnIndex === 0}
            onPress={() => handleTapToScrollRow("left")}
            hitSlop={10}
          >
            <FontAwesome6 name="arrow-left" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.rowNavigationButton,
              {
                opacity: currentColumnIndex === currentRowSize - 1 ? 0.5 : 1,
              },
            ]}
            disabled={currentColumnIndex === currentRowSize - 1}
            onPress={() => handleTapToScrollRow("right")}
            hitSlop={10}
          >
            <FontAwesome6 name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
          <View style={styles.itemIndexContainer}>
            <Text style={styles.itemIndexText}>
              {currentColumnIndex + 1} / {currentRowSize}
            </Text>
          </View>
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity,
            transform: [
              {
                scale,
              },
            ],
          },
        ]}
        onTouchStart={(e) =>
          (overlayTapStart.current = {
            x: e.nativeEvent.locationX,
            y: e.nativeEvent.locationY,
            timestamp: Date.now(),
          })
        }
        onTouchEnd={(e) => {
          if (overlayTapStart.current) {
            const { x, y, timestamp } = overlayTapStart.current;
            const { locationX, locationY } = e.nativeEvent;
            if (
              Math.abs(locationX - x) < 10 &&
              Math.abs(locationY - y) < 10 &&
              Date.now() - timestamp < 300
            ) {
              showOverlay.current = !showOverlay.current;
              Animated.timing(overlayOpacity.current, {
                toValue: showOverlay.current ? 1 : 0,
                duration: 150,
                useNativeDriver: true,
              }).start();
            }
          }
        }}
      >
        <Animated.View
          style={[
            styles.overlayContainer,
            {
              paddingTop: safeAreaTop,
              paddingBottom: safeAreaBottom,
              paddingLeft: safeAreaLeft,
              paddingRight: safeAreaRight,
              opacity: overlayOpacity.current,
            },
          ]}
        >
          {currentPost && (
            <PostOverlay
              post={currentPost}
              closeViewer={() => onClose()}
              columnIndex={currentColumnIndex}
            />
          )}
        </Animated.View>
        <FlashList
          ref={columnFlashListRef}
          /**
           * Key ensures the outer list reset to the correct index when the orientation
           * changes.
           */
          key={orientation}
          data={media}
          scrollEnabled={!isScrollLocked}
          renderItem={({ item: row, index: columnIndex }) => (
            <FlashList
              ref={columnIndex === currentRowIndex ? rowFlashListRef : null}
              /**
               * Key ensures the inner list resets when the row data changes
               * or the orientation changes.
               */
              key={`${columnIndex}-${orientation}`}
              data={row}
              style={{ width, height }}
              renderItem={({ item: mediaItem, index: rowIndex }) => (
                <View style={{ width, height }}>
                  {mediaItem.type === "image" ? (
                    <MediaImage
                      item={mediaItem}
                      setIsScrollLocked={setIsScrollLocked}
                    />
                  ) : mediaItem.type === "video" ? (
                    <MediaVideo
                      source={mediaItem.source}
                      focused={
                        columnIndex === currentRowIndex &&
                        rowIndex === currentColumnIndex
                      }
                      overlayOpacity={overlayOpacity.current}
                      setIsScrollLocked={setIsScrollLocked}
                    />
                  ) : null}
                </View>
              )}
              // Only apply initial scroll to the row we want to open to
              initialScrollIndex={
                columnIndex === initialRowIndex ? initialColumnIndex : 0
              }
              scrollEnabled={row[0]?.type !== "video"}
              pagingEnabled={true}
              horizontal={true}
              getItemType={(item) => item.type}
              keyExtractor={(item, index) =>
                item.type === "image"
                  ? ((typeof item.source === "string"
                      ? item.source
                      : item.source[0].uri) ?? index.toString())
                  : item.source.source
              }
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                if (width !== event.nativeEvent.layoutMeasurement.width) {
                  /**
                   * Device orientation just changed. Don't handle this since
                   * we will be updating the index in the listener above.
                   */
                  return;
                }
                const newIndex = Math.min(
                  row.length - 1,
                  Math.max(
                    0,
                    Math.round(event.nativeEvent.contentOffset.x / width),
                  ),
                );
                rowScrollPositions.current.set(columnIndex, newIndex);
                if (
                  columnIndex === currentRowIndex &&
                  newIndex !== currentColumnIndex
                ) {
                  setCurrentColumnIndex(newIndex);
                }
                if (newIndex === 0 && event.nativeEvent.contentOffset.x <= 0) {
                  scrolledAwayX.current.setValue(
                    event.nativeEvent.contentOffset.x,
                  );
                } else if (
                  newIndex === row.length - 1 &&
                  event.nativeEvent.contentOffset.x >=
                    event.nativeEvent.contentSize.width -
                      event.nativeEvent.layoutMeasurement.width
                ) {
                  scrolledAwayX.current.setValue(
                    event.nativeEvent.contentSize.width -
                      event.nativeEvent.layoutMeasurement.width -
                      event.nativeEvent.contentOffset.x,
                  );
                }
              }}
              onScrollEndDrag={(event) => {
                if (
                  event.nativeEvent.contentOffset.x < -40 ||
                  event.nativeEvent.contentOffset.x >=
                    event.nativeEvent.contentSize.width -
                      event.nativeEvent.layoutMeasurement.width +
                      40
                ) {
                  onClose();
                }
              }}
            />
          )}
          initialScrollIndex={initialRowIndex}
          pagingEnabled={true}
          onScroll={(event) => {
            const newIndex = Math.min(
              media.length - 1,
              Math.max(
                0,
                Math.round(event.nativeEvent.contentOffset.y / height),
              ),
            );
            if (newIndex !== currentRowIndex) {
              setCurrentRowIndex(newIndex);
              setCurrentColumnIndex(
                rowScrollPositions.current.get(newIndex) ?? 0,
              );
            }
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent;
            const maxScrollY = contentSize.height - layoutMeasurement.height;
            const isAtTop = newIndex === 0 && contentOffset.y <= 0;
            const isAtBottom =
              newIndex === media.length - 1 && contentOffset.y >= maxScrollY;
            if (isAtTop) {
              scrolledAwayY.current.setValue(contentOffset.y);
            } else if (isAtBottom) {
              scrolledAwayY.current.setValue(maxScrollY - contentOffset.y);
            } else {
              scrolledAwayY.current.setValue(0);
            }
          }}
          onScrollEndDrag={(event) => {
            const { contentOffset, contentSize, layoutMeasurement } =
              event.nativeEvent;
            const pulledPastTop = contentOffset.y < -50;
            const pulledPastBottom =
              contentOffset.y >
              50 + (contentSize.height - layoutMeasurement.height);
            if (pulledPastTop || pulledPastBottom) {
              onClose();
            }
          }}
          drawDistance={100}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  closeButton: {
    position: "absolute",
    right: 10,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    padding: 10,
    borderRadius: 100,
    width: 40,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  overlayContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    zIndex: 1,
    pointerEvents: "box-none",
  },
  rowDetailsContainer: {
    position: "absolute",
    flexDirection: "row",
    right: 10,
    zIndex: 1,
    gap: 15,
  },
  rowNavigationButton: {
    aspectRatio: 1,
    borderRadius: 100,
    padding: 10,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIndexContainer: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemIndexText: {
    color: "white",
  },
});
