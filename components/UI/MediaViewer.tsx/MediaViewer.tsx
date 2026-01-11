import { FontAwesome6 } from "@expo/vector-icons";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
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

type MediaItem = ImageItem | VideoItem;

type MediaItemRow = MediaItem[];

export type MediaItemCollection = MediaItemRow[];

export type MediaViewerRef = {
  open: (index?: number) => void;
  close: () => void;
};

type MediaViewerProps = {
  media: MediaItemCollection;
  ref?: Ref<MediaViewerRef>;
  overlayComponent?: (index: number, rowIndex: number) => React.ReactNode;
  onFocusedItemChange?: (columnIndex: number, rowIndex: number) => void;
};

export default function MediaViewer({
  media,
  ref,
  overlayComponent,
  onFocusedItemChange,
}: MediaViewerProps) {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // These track the initial position when opening - used for initialScrollIndex
  // They don't change during scrolling, only when open() is called
  const [initialRowIndex, setInitialRowIndex] = useState(0);
  const [initialItemIndex, setInitialItemIndex] = useState(0);

  const currentRowSize = media[currentIndex]?.length ?? 0;

  useImperativeHandle(
    ref,
    () =>
      ({
        open: (index) => {
          let rowIndex = 0;
          let itemIndex = 0;
          if (index !== undefined) {
            let remaining = index;
            while (
              rowIndex < media.length &&
              remaining >= media[rowIndex].length
            ) {
              remaining -= media[rowIndex].length;
              rowIndex++;
            }
            itemIndex = remaining;
          }
          rowScrollPositions.current.clear();
          rowScrollPositions.current.set(rowIndex, itemIndex);

          setCurrentIndex(rowIndex);
          setCurrentRowIndex(itemIndex);
          setInitialRowIndex(rowIndex);
          setInitialItemIndex(itemIndex);
          setIsVisible(true);
          setIsScrollLocked(false);
        },
        close: () => setIsVisible(false),
      }) as MediaViewerRef,
  );

  useEffect(() => {
    onFocusedItemChange?.(currentIndex, currentRowIndex);
  }, [currentIndex, currentRowIndex]);

  return (
    <Modal
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
      transparent={true}
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
        onPress={() => setIsVisible(false)}
        style={[
          styles.closeButton,
          {
            top: top + 10,
          },
        ]}
      >
        <FontAwesome6 name="xmark" size={20} color="white" />
      </TouchableOpacity>
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
              paddingTop: top,
              paddingBottom: bottom,
              opacity: overlayOpacity.current,
            },
          ]}
        >
          {overlayComponent?.(currentIndex, currentRowIndex)}
        </Animated.View>
        {currentRowSize > 1 && (
          <Animated.View
            style={[
              styles.itemIndexContainer,
              {
                bottom: bottom + 10,
                opacity: overlayOpacity.current.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            <Text style={styles.itemIndexText}>
              {currentRowIndex + 1} / {currentRowSize}
            </Text>
          </Animated.View>
        )}
        <FlashList
          ref={columnFlashListRef}
          data={media}
          scrollEnabled={!isScrollLocked}
          renderItem={({ item: row, index: rowIndex }) => (
            <FlashList
              ref={rowFlashListRef}
              // Key ensures the inner list resets when the row data changes
              key={rowIndex}
              data={row}
              style={{ width, height }}
              renderItem={({ item: mediaItem }) => (
                <View style={{ width, height }}>
                  {mediaItem.type === "image" ? (
                    <MediaImage
                      item={mediaItem}
                      setIsScrollLocked={setIsScrollLocked}
                    />
                  ) : mediaItem.type === "video" ? (
                    <MediaVideo
                      uri={mediaItem.uri}
                      focused={rowIndex === currentIndex}
                      overlayOpacity={overlayOpacity.current}
                    />
                  ) : null}
                </View>
              )}
              // Only apply initial scroll to the row we want to open to
              initialScrollIndex={
                rowIndex === initialRowIndex ? initialItemIndex : 0
              }
              scrollEnabled={row[0]?.type !== "video"}
              pagingEnabled={true}
              horizontal={true}
              getItemType={(item) => item.type}
              keyExtractor={(item) => item.uri}
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const newIndex = Math.min(
                  row.length - 1,
                  Math.max(
                    0,
                    Math.round(event.nativeEvent.contentOffset.x / width),
                  ),
                );
                rowScrollPositions.current.set(rowIndex, newIndex);
                if (rowIndex === currentIndex && newIndex !== currentRowIndex) {
                  setCurrentRowIndex(newIndex);
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
                  setIsVisible(false);
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
            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex);
              setCurrentRowIndex(rowScrollPositions.current.get(newIndex) ?? 0);
            }
            if (newIndex === 0 && event.nativeEvent.contentOffset.y <= 0) {
              scrolledAwayY.current.setValue(event.nativeEvent.contentOffset.y);
            } else {
              scrolledAwayY.current.setValue(0);
            }
          }}
          onScrollEndDrag={(event) => {
            if (event.nativeEvent.contentOffset.y < -50) {
              setIsVisible(false);
            }
          }}
          drawDistance={1000}
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
  itemIndexContainer: {
    position: "absolute",
    right: 10,
    backgroundColor: "rgba(100, 100, 100, 0.5)",
    padding: 10,
    borderRadius: 10,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  itemIndexText: {
    color: "white",
  },
});
