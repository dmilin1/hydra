import * as ExpoOrientation from "expo-screen-orientation";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Modal,
  NativeScrollEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { MediaImage } from "./MediaImage.ios";
import MediaVideo from "./MediaVideo.ios";
import MediaOverlay, { MediaOverlayHandle } from "./Overlay/MediaOverlay";
import { MediaItemRow, MediaViewerProps } from "./types";
import { PostSettingsContext } from "../../../contexts/SettingsContexts/PostSettingsContext";

export type { MediaItemCollection } from "./types";

const pageAt = (offset: number, size: number, count: number) =>
  Math.min(count - 1, Math.max(0, Math.round(offset / size)));

// Negative while pulled past either end, which fades the viewer toward dismissal.
const overscroll = (offset: number, maxOffset: number) =>
  offset < 0 ? offset : offset > maxOffset ? maxOffset - offset : 0;

const flungPastEnd = (
  offset: number,
  maxOffset: number,
  velocity: number,
  pullDistance: number,
) =>
  offset < -pullDistance ||
  offset > maxOffset + pullDistance ||
  (velocity < -1 && offset < 0) ||
  (velocity > 1 && offset > maxOffset);

/**
 * A paged ScrollView keeps its pixel offset when the frame resizes, which lands it
 * mid-page, so the page is re-applied after every resize. The resize itself can
 * emit scroll events (a clamp when the content shrinks, or one measured against
 * the old frame) that reach JS after the resize commit and report a bogus page,
 * so events are dropped until the correction lands or the user scrolls again.
 */
function usePager(page: number, horizontal: boolean) {
  const { width, height } = useSafeAreaFrame();
  const size = horizontal ? width : height;
  const ref = useRef<ScrollView>(null);
  const [initialOffset] = useState(() =>
    horizontal ? { x: page * size, y: 0 } : { x: 0, y: page * size },
  );
  const previousSize = useRef(size);
  const pendingOffset = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (previousSize.current === size) return;
    previousSize.current = size;
    pendingOffset.current = page * size;
    ref.current?.scrollTo(
      horizontal
        ? { x: pendingOffset.current, animated: false }
        : { y: pendingOffset.current, animated: false },
    );
  }, [size]);

  const release = () => {
    pendingOffset.current = null;
  };

  const accepts = ({ layoutMeasurement, contentOffset }: NativeScrollEvent) => {
    const offset = horizontal ? contentOffset.x : contentOffset.y;
    if (
      Math.abs(layoutMeasurement.width - width) >= 1 ||
      Math.abs(layoutMeasurement.height - height) >= 1 ||
      (pendingOffset.current !== null &&
        Math.abs(offset - pendingOffset.current) >= 1)
    ) {
      return false;
    }
    release();
    return true;
  };

  return { ref, initialOffset, accepts, release };
}

export default function MediaViewer({
  media,
  startingRowIndex,
  startingColumnIndex,
  onFocusedItemChange,
  getCurrentPost,
  onClose,
}: MediaViewerProps) {
  const { height } = useSafeAreaFrame();

  const [rowIndex, setRowIndex] = useState(startingRowIndex);
  const [columnIndex, setColumnIndex] = useState(startingColumnIndex);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  // Rows outside the mounted window keep their page here so revisiting them resumes it.
  const columnMemory = useRef(
    new Map([[startingRowIndex, startingColumnIndex]]),
  );

  const rows = usePager(rowIndex, false);
  const focusedRowRef = useRef<MediaRowHandle>(null);
  const overlayRef = useRef<MediaOverlayHandle>(null);
  const overlayTapStart = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);

  const scrolledAwayY = useRef(new Animated.Value(0));
  const scrolledAwayX = useRef(new Animated.Value(0));
  const flickedAway = useRef(new Animated.Value(0));
  const dismissAmount = Animated.add(
    flickedAway.current,
    Animated.add(scrolledAwayY.current, scrolledAwayX.current),
  );
  const opacity = dismissAmount.interpolate({
    inputRange: [-150, -50, 0],
    outputRange: [0, 0.85, 1],
  });
  const scale = dismissAmount.interpolate({
    inputRange: [-150, -50, 0],
    outputRange: [0.9, 0.95, 1],
  });

  const currentRow = media[rowIndex];
  const focusedItem = currentRow?.[columnIndex];
  const currentPost = getCurrentPost?.(rowIndex);
  const visibleRows = [rowIndex - 1, rowIndex, rowIndex + 1].filter(
    (index) => index >= 0 && index < media.length,
  );

  const animateClose = () => {
    Animated.timing(flickedAway.current, {
      toValue: -150,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  useEffect(() => {
    if (!onFocusedItemChange) return;
    let trueIndex = 0;
    for (let i = 0; i < rowIndex; i++) {
      trueIndex += media[i].length;
    }
    onFocusedItemChange(trueIndex + columnIndex);
  }, [rowIndex, columnIndex]);

  useEffect(() => {
    ExpoOrientation.unlockAsync();
    return () => {
      ExpoOrientation.lockAsync(ExpoOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  return (
    <Modal
      visible={true}
      onRequestClose={animateClose}
      transparent={true}
      supportedOrientations={["portrait", "landscape"]}
    >
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View style={[styles.background, { opacity }]} />
        <Animated.View
          style={[styles.flex, { opacity, transform: [{ scale }] }]}
          onTouchStart={(e) =>
            (overlayTapStart.current = {
              x: e.nativeEvent.locationX,
              y: e.nativeEvent.locationY,
              timestamp: Date.now(),
            })
          }
          onTouchEnd={(e) => {
            if (!overlayTapStart.current) return;
            const { x, y, timestamp } = overlayTapStart.current;
            const { locationX, locationY } = e.nativeEvent;
            if (
              Math.abs(locationX - x) < 10 &&
              Math.abs(locationY - y) < 10 &&
              Date.now() - timestamp < 300
            ) {
              overlayRef.current?.toggle();
            }
          }}
        >
          <MediaOverlay
            ref={overlayRef}
            post={currentPost ?? null}
            focusedItem={focusedItem}
            albumIndex={columnIndex}
            albumSize={currentRow?.length ?? 0}
            onAlbumStep={(direction) => focusedRowRef.current?.step(direction)}
            closeViewer={animateClose}
          />
          <ScrollView
            ref={rows.ref}
            contentContainerStyle={{ height: media.length * height }}
            contentOffset={rows.initialOffset}
            pagingEnabled={true}
            scrollEnabled={!isScrollLocked}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={rows.release}
            onScroll={({ nativeEvent }) => {
              if (!rows.accepts(nativeEvent)) return;
              const { y } = nativeEvent.contentOffset;
              const newRowIndex = pageAt(y, height, media.length);
              if (newRowIndex !== rowIndex) {
                setRowIndex(newRowIndex);
                setColumnIndex(columnMemory.current.get(newRowIndex) ?? 0);
              }
              scrolledAwayY.current.setValue(
                overscroll(y, (media.length - 1) * height),
              );
            }}
            onScrollEndDrag={({ nativeEvent }) => {
              if (
                flungPastEnd(
                  nativeEvent.contentOffset.y,
                  (media.length - 1) * height,
                  nativeEvent.velocity?.y ?? 0,
                  50,
                )
              ) {
                animateClose();
              }
            }}
          >
            {visibleRows.map((index) => (
              <MediaRow
                key={index}
                ref={index === rowIndex ? focusedRowRef : null}
                items={media[index]}
                top={index * height}
                isFocused={index === rowIndex}
                initialColumn={columnMemory.current.get(index) ?? 0}
                onColumnChange={(column) => {
                  columnMemory.current.set(index, column);
                  if (index === rowIndex) setColumnIndex(column);
                }}
                scrolledAwayX={scrolledAwayX.current}
                setIsScrollLocked={setIsScrollLocked}
                dismiss={animateClose}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

type MediaRowHandle = {
  step: (direction: "left" | "right") => void;
};

type MediaRowProps = {
  items: MediaItemRow;
  top: number;
  isFocused: boolean;
  initialColumn: number;
  onColumnChange: (column: number) => void;
  scrolledAwayX: Animated.Value;
  setIsScrollLocked: (isScrollLocked: boolean) => void;
  dismiss: () => void;
};

const MediaRow = forwardRef<MediaRowHandle, MediaRowProps>(function MediaRow(
  {
    items,
    top,
    isFocused,
    initialColumn,
    onColumnChange,
    scrolledAwayX,
    setIsScrollLocked,
    dismiss,
  },
  ref,
) {
  const { width, height } = useSafeAreaFrame();
  const { slideAnywhereToScrub } = useContext(PostSettingsContext);

  const [column, setColumn] = useState(initialColumn);
  const pages = usePager(column, true);
  // Rapid arrow taps step from the page still being scrolled to, not the settled one.
  const lastStep = useRef({ column: initialColumn, time: 0 });

  useImperativeHandle(ref, () => ({
    step: (direction) => {
      const now = Date.now();
      const from =
        now - lastStep.current.time < 300 ? lastStep.current.column : column;
      const target = Math.min(
        items.length - 1,
        Math.max(0, from + (direction === "left" ? -1 : 1)),
      );
      lastStep.current = { column: target, time: now };
      pages.release();
      pages.ref.current?.scrollTo({ x: target * width, animated: true });
    },
  }));

  const visibleColumns = [column - 1, column, column + 1].filter(
    (index) => index >= 0 && index < items.length,
  );

  return (
    <ScrollView
      ref={pages.ref}
      style={[styles.row, { top, width, height }]}
      contentContainerStyle={{ width: items.length * width, height }}
      contentOffset={pages.initialOffset}
      horizontal={true}
      pagingEnabled={true}
      showsHorizontalScrollIndicator={false}
      scrollEnabled={
        items[0]?.type !== "video" ||
        !!items[0]?.source.sourceLoadError ||
        !slideAnywhereToScrub
      }
      onScrollBeginDrag={pages.release}
      onScroll={({ nativeEvent }) => {
        if (!pages.accepts(nativeEvent)) return;
        const { x } = nativeEvent.contentOffset;
        const newColumn = pageAt(x, width, items.length);
        if (newColumn !== column) {
          setColumn(newColumn);
          onColumnChange(newColumn);
        }
        scrolledAwayX.setValue(overscroll(x, (items.length - 1) * width));
      }}
      onScrollEndDrag={({ nativeEvent }) => {
        if (
          flungPastEnd(
            nativeEvent.contentOffset.x,
            (items.length - 1) * width,
            nativeEvent.velocity?.x ?? 0,
            40,
          )
        ) {
          dismiss();
        }
      }}
    >
      {visibleColumns.map((index) => {
        const item = items[index];
        return (
          <View
            key={index}
            style={[styles.page, { left: index * width, width, height }]}
          >
            {item.type === "image" ? (
              <MediaImage item={item} setIsScrollLocked={setIsScrollLocked} />
            ) : (
              <MediaVideo
                source={item.source}
                focused={isFocused && index === column}
                onScrubbingChange={setIsScrollLocked}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
});

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
  row: {
    position: "absolute",
    left: 0,
  },
  page: {
    position: "absolute",
    top: 0,
  },
});
