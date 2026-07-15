import { FlashList, FlashListRef } from "@shopify/flash-list";
import { VideoPlayer } from "expo-video";
import {
  useContext,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from "react";
import { StyleSheet, Animated, Modal, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as ExpoOrientation from "expo-screen-orientation";
import MediaVideo from "./MediaVideo.ios";
import { MediaImage } from "./MediaImage.ios";
import MediaOverlay, { MediaOverlayHandle } from "./Overlay/MediaOverlay";
import { MediaItem, MediaItemRow, MediaViewerProps } from "./types";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";

export type { MediaItemCollection } from "./types";

export default function MediaViewer({
  media,
  startingRowIndex,
  startingColumnIndex,
  onFocusedItemChange,
  getCurrentPost,
  isMuted,
  setIsMuted,
  onClose,
}: MediaViewerProps) {
  const { width, height } = useSafeAreaFrame();

  const { slideAnywhereToScrub } = useContext(PostSettingsContext);

  const columnFlashListRef = useRef<FlashListRef<MediaItemRow>>(null);
  const rowFlashListRef = useRef<FlashListRef<MediaItem>>(null);
  const overlayRef = useRef<MediaOverlayHandle>(null);

  const overlayTapStart = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);

  // Track horizontal scroll position for each row independently
  const rowScrollPositions = useRef<Map<number, number>>(new Map());

  const scrolledAwayY = useRef(new Animated.Value(0));
  const scrolledAwayX = useRef(new Animated.Value(0));
  const flickedAway = useRef(new Animated.Value(0));
  const opacity = Animated.add(
    flickedAway.current,
    Animated.add(scrolledAwayY.current, scrolledAwayX.current),
  ).interpolate({
    inputRange: [-150, -50, 0],
    outputRange: [0, 0.85, 1],
  });
  const scale = Animated.add(
    flickedAway.current,
    Animated.add(scrolledAwayY.current, scrolledAwayX.current),
  ).interpolate({
    inputRange: [-150, -50, 0],
    outputRange: [0.9, 0.95, 1],
  });

  const [currentRowIndex, setCurrentRowIndex] = useState(startingRowIndex);
  const [currentColumnIndex, setCurrentColumnIndex] =
    useState(startingColumnIndex);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [focusedPlayer, setFocusedPlayer] = useState<VideoPlayer | null>(null);

  const tapToScrollColumnIndex = useRef<number>(0);
  const lastTapToScrollTime = useRef<number>(0);

  const orientation = height > width ? "vertical" : "horizontal";
  const deferredOrientation = useDeferredValue(orientation);
  // These track the initial position when opening - used for initialScrollIndex
  // They don't change during scrolling, only when open() is called or orientation changes
  const initialRowIndex = useRef(startingRowIndex);
  const initialColumnIndex = useRef(startingColumnIndex);
  if (orientation !== deferredOrientation) {
    initialRowIndex.current = currentRowIndex;
    initialColumnIndex.current = currentColumnIndex;
  }

  const currentRowSize = media[currentRowIndex]?.length ?? 0;

  const currentPost = getCurrentPost?.(currentRowIndex);

  const focusedItem = media[currentRowIndex]?.[currentColumnIndex];

  const handleFocusedPlayerChange = (
    player: VideoPlayer,
    nowFocused: boolean,
  ) => {
    setFocusedPlayer((previous) =>
      nowFocused ? player : previous === player ? null : previous,
    );
  };

  const animateClose = () => {
    Animated.timing(flickedAway.current, {
      toValue: -150,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

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
    onFocusedItemChange(trueIndex);
  }, [currentRowIndex, currentColumnIndex]);

  useEffect(() => {
    ExpoOrientation.unlockAsync();
    return () => {
      ExpoOrientation.lockAsync(ExpoOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  return (
    <Modal
      visible={true}
      onRequestClose={() => animateClose()}
      transparent={true}
      supportedOrientations={["portrait", "landscape"]}
    >
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View
          style={[
            styles.background,
            {
              opacity,
            },
          ]}
        />
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
                overlayRef.current?.toggle();
              }
            }
          }}
        >
          <MediaOverlay
            ref={overlayRef}
            post={currentPost ?? null}
            focusedItem={focusedItem}
            player={focusedPlayer}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            albumIndex={currentColumnIndex}
            albumSize={currentRowSize}
            onAlbumStep={handleTapToScrollRow}
            closeViewer={() => animateClose()}
          />
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
                        onScrubbingChange={(isScrubbing) =>
                          setIsScrollLocked(isScrubbing)
                        }
                        onFocusedPlayerChange={handleFocusedPlayerChange}
                        isMuted={isMuted}
                        setIsMuted={setIsMuted}
                      />
                    ) : null}
                  </View>
                )}
                // Only apply initial scroll to the row we want to open to
                initialScrollIndex={
                  columnIndex === initialRowIndex.current
                    ? initialColumnIndex.current
                    : 0
                }
                scrollEnabled={
                  row[0]?.type !== "video" ||
                  !!row[0]?.source.sourceLoadError ||
                  !slideAnywhereToScrub
                }
                pagingEnabled={true}
                horizontal={true}
                getItemType={(item) => item.type}
                keyExtractor={(item, index) =>
                  item.type === "image"
                    ? ((typeof item.source === "string"
                        ? item.source
                        : item.source[0].uri) ?? index.toString())
                    : item.source.source.length
                      ? item.source.source
                      : index.toString()
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
                  if (
                    newIndex === 0 &&
                    event.nativeEvent.contentOffset.x <= 0
                  ) {
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
                  const rightLimit =
                    event.nativeEvent.contentSize.width -
                    event.nativeEvent.layoutMeasurement.width;
                  const pulledPastLeft =
                    event.nativeEvent.contentOffset.x < -40;
                  const pulledPastRight =
                    event.nativeEvent.contentOffset.x >= rightLimit + 40;
                  const momentumPastLeft =
                    (event.nativeEvent.velocity?.x ?? 0) < -1 &&
                    event.nativeEvent.contentOffset.x < 0;
                  const momentumPastRight =
                    (event.nativeEvent.velocity?.x ?? 0) > 1 &&
                    event.nativeEvent.contentOffset.x >= rightLimit;
                  if (
                    pulledPastLeft ||
                    pulledPastRight ||
                    momentumPastLeft ||
                    momentumPastRight
                  ) {
                    Animated.timing(flickedAway.current, {
                      toValue: -150,
                      duration: 200,
                      useNativeDriver: true,
                    }).start(() => animateClose());
                  }
                }}
              />
            )}
            /**
             * We have to do this because FlashList has a bug that causes calculations for
             * the initial scroll index to be wrong when the index is larger than the initial
             * batch of media items.
             */
            initialScrollIndex={0}
            initialScrollIndexParams={{
              viewOffset: height * initialRowIndex.current,
            }}
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
              const bottomLimit = contentSize.height - layoutMeasurement.height;
              const momentumPastTop =
                (event.nativeEvent.velocity?.y ?? 0) < -1 &&
                contentOffset.y < 0;
              const momentumPastBottom =
                (event.nativeEvent.velocity?.y ?? 0) > 1 &&
                contentOffset.y > bottomLimit;
              const pulledPastTop = contentOffset.y < -50;
              const pulledPastBottom = contentOffset.y > 50 + bottomLimit;
              if (
                pulledPastTop ||
                pulledPastBottom ||
                momentumPastTop ||
                momentumPastBottom
              ) {
                Animated.timing(flickedAway.current, {
                  toValue: -150,
                  duration: 200,
                  useNativeDriver: true,
                }).start(() => animateClose());
              }
            }}
            drawDistance={100}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  contentContainer: {
    flex: 1,
  },
});
