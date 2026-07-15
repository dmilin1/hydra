import { FontAwesome6 } from "@expo/vector-icons";
import * as ExpoOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
  Touchable,
  usePanGesture,
} from "react-native-gesture-handler";
import Animated, {
  clamp,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MediaImage } from "./MediaImage.android";
import PostOverlay from "./PostOverlay";
import { MediaItemRow, MediaViewerProps } from "./types";
import MediaVideo from "./MediaVideo.android";
import { AnimatedStyleHandle } from "react-native-reanimated/lib/typescript/hook/commonTypes";

export type { MediaItemCollection } from "./types";

const FLICK_VELOCITY = 500;
const DISMISS_DISTANCE = 50;
const DISMISS_VELOCITY = 1000;

const PAGING_SPRING = {
  stiffness: 250,
  damping: 28,
  overshootClamping: true,
};
const CLOSE_TIMING = { duration: 200 };
const OVERLAY_TIMING = { duration: 150 };

function snapTarget(position: number, velocity: number, maxIndex: number) {
  "worklet";
  let target = Math.round(position);
  if (velocity > FLICK_VELOCITY) {
    target = Math.max(target, Math.floor(position) + 1);
  } else if (velocity < -FLICK_VELOCITY) {
    target = Math.min(target, Math.ceil(position) - 1);
  }
  return clamp(target, 0, maxIndex);
}

function rubberBand(value: number, min: number, max: number) {
  "worklet";
  if (value < min) return min - (min - value) / 2;
  if (value > max) return max + (value - max) / 2;
  return value;
}

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
  const {
    top: safeAreaTop,
    bottom: safeAreaBottom,
    left: safeAreaLeft,
    right: safeAreaRight,
  } = useSafeAreaInsets();

  const [rowIndex, setRowIndex] = useState(startingRowIndex);
  const [columnIndex, setColumnIndex] = useState(startingColumnIndex);
  const columnMemory = useRef(
    new Map([[startingRowIndex, startingColumnIndex]]),
  );

  // Continuous scroll positions in pixels. scrollX always belongs to the
  // active row; inactive rows sit at their remembered column from `columns`.
  const scrollX = useSharedValue(startingColumnIndex * width);
  const scrollY = useSharedValue(startingRowIndex * height);
  const activeRow = useSharedValue(startingRowIndex);
  const columns = useSharedValue<Record<number, number>>({
    [startingRowIndex]: startingColumnIndex,
  });
  const axis = useSharedValue<"x" | "y" | null>(null);
  const gestureBase = useSharedValue(0);
  const pagerEnabled = useSharedValue(true);
  const flickAway = useSharedValue(0);
  const overlayProgress = useSharedValue(0);

  const overlayShown = useRef(false);
  const overlayTapStart = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);
  const pendingColumn = useRef(startingColumnIndex);
  const lastArrowTap = useRef(0);

  const rowLengths = media.map((row) => row.length);
  const currentRowSize = media[rowIndex]?.length ?? 0;
  const orientation = width > height ? "landscape" : "portrait";

  const setFocus = (row: number, column: number) => {
    setRowIndex(row);
    setColumnIndex(column);
  };

  const rememberColumn = (row: number, column: number) => {
    columnMemory.current.set(row, column);
  };

  const animateClose = () => {
    pagerEnabled.value = false;
    flickAway.value = withTiming(150, CLOSE_TIMING, () => {
      runOnJS(onClose)();
    });
  };

  const toggleOverlay = () => {
    overlayShown.current = !overlayShown.current;
    overlayProgress.value = withTiming(
      overlayShown.current ? 1 : 0,
      OVERLAY_TIMING,
    );
  };

  const scrollToColumn = (column: number) => {
    const target = Math.min(Math.max(column, 0), currentRowSize - 1);
    pendingColumn.current = target;
    columnMemory.current.set(rowIndex, target);
    columns.value = { ...columns.value, [rowIndex]: target };
    scrollX.value = withSpring(target * width, PAGING_SPRING);
  };

  const handleTapToScrollRow = (direction: "left" | "right") => {
    const now = Date.now();
    const base =
      now - lastArrowTap.current < 300 ? pendingColumn.current : columnIndex;
    lastArrowTap.current = now;
    scrollToColumn(base + (direction === "left" ? -1 : 1));
  };

  useAnimatedReaction(
    () => {
      const row = clamp(
        Math.round(scrollY.value / height),
        0,
        rowLengths.length - 1,
      );
      const column =
        row === activeRow.value
          ? clamp(Math.round(scrollX.value / width), 0, rowLengths[row] - 1)
          : (columns.value[row] ?? 0);
      return { row, column };
    },
    (current, previous) => {
      if (
        current.row !== previous?.row ||
        current.column !== previous?.column
      ) {
        runOnJS(setFocus)(current.row, current.column);
      }
    },
  );

  const panGesture = usePanGesture({
    enabled: pagerEnabled,
    maxPointers: 1,
    onActivate: () => {
      axis.value = null;
    },
    onUpdate: (event) => {
      if (axis.value === null) {
        if (Math.abs(event.translationX) > 5) {
          axis.value = "x";
          gestureBase.value = scrollX.value + event.translationX;
        } else if (Math.abs(event.translationY) > 5) {
          axis.value = "y";
          gestureBase.value = scrollY.value + event.translationY;
        }
      }
      if (axis.value === "x") {
        const maxX = (rowLengths[activeRow.value] - 1) * width;
        scrollX.value = rubberBand(
          gestureBase.value - event.translationX,
          0,
          maxX,
        );
      } else if (axis.value === "y") {
        const maxY = (rowLengths.length - 1) * height;
        scrollY.value = rubberBand(
          gestureBase.value - event.translationY,
          0,
          maxY,
        );
      }
    },
    onDeactivate: (event) => {
      if (axis.value === "x") {
        const row = activeRow.value;
        const maxX = (rowLengths[row] - 1) * width;
        const velocity = -event.velocityX;
        const pulledPast =
          scrollX.value < -DISMISS_DISTANCE ||
          scrollX.value > maxX + DISMISS_DISTANCE;
        const flickedPast =
          (scrollX.value < 0 && velocity < -DISMISS_VELOCITY) ||
          (scrollX.value > maxX && velocity > DISMISS_VELOCITY);
        if (pulledPast || flickedPast) {
          runOnJS(animateClose)();
        } else {
          const target = snapTarget(
            scrollX.value / width,
            velocity,
            rowLengths[row] - 1,
          );
          columns.value = { ...columns.value, [row]: target };
          runOnJS(rememberColumn)(row, target);
          scrollX.value = withSpring(target * width, {
            ...PAGING_SPRING,
            velocity,
          });
        }
      } else if (axis.value === "y") {
        const maxY = (rowLengths.length - 1) * height;
        const velocity = -event.velocityY;
        const pulledPast =
          scrollY.value < -DISMISS_DISTANCE ||
          scrollY.value > maxY + DISMISS_DISTANCE;
        const flickedPast =
          (scrollY.value < 0 && velocity < -DISMISS_VELOCITY) ||
          (scrollY.value > maxY && velocity > DISMISS_VELOCITY);
        if (pulledPast || flickedPast) {
          runOnJS(animateClose)();
        } else {
          const target = snapTarget(
            scrollY.value / height,
            velocity,
            rowLengths.length - 1,
          );
          // Hand scrollX off to the new active row before the vertical spring
          // starts so neither strip's horizontal position jumps.
          activeRow.value = target;
          scrollX.value = (columns.value[target] ?? 0) * width;
          scrollY.value = withSpring(target * height, {
            ...PAGING_SPRING,
            velocity,
          });
        }
      }
      axis.value = null;
    },
  });

  // Overscroll past any edge and the flick-away close animation both pull the
  // viewer toward dismissal; the background and content fade and shrink with
  // the distance.
  const dismissAmount = useDerivedValue(() => {
    const maxX = (rowLengths[activeRow.value] - 1) * width;
    const maxY = (rowLengths.length - 1) * height;
    const overscroll = Math.max(
      -scrollX.value,
      scrollX.value - maxX,
      -scrollY.value,
      scrollY.value - maxY,
      0,
    );
    return flickAway.value + overscroll;
  });

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      dismissAmount.value,
      [0, 50, 150],
      [1, 0.85, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      dismissAmount.value,
      [0, 50, 150],
      [1, 0.85, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          dismissAmount.value,
          [0, 50, 150],
          [1, 0.95, 0.9],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayProgress.value,
  }));

  const rowDetailsStyle = useAnimatedStyle(() => ({
    opacity: 1 - overlayProgress.value,
  }));

  const verticalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  const visibleRows = [rowIndex - 1, rowIndex, rowIndex + 1].filter(
    (row) => row >= 0 && row < media.length,
  );

  useEffect(() => {
    if (!onFocusedItemChange) return;
    let trueIndex = 0;
    for (let i = 0; i < rowIndex; i++) {
      trueIndex += media[i].length;
    }
    onFocusedItemChange(trueIndex + columnIndex);
  }, [rowIndex, columnIndex]);

  // Keep the settled page in place when the frame size changes (orientation
  // change, window resize).
  const prevFrame = useRef({ width, height });
  useEffect(() => {
    const prev = prevFrame.current;
    if (prev.width === width && prev.height === height) return;
    scrollX.value = Math.round(scrollX.value / prev.width) * width;
    scrollY.value = Math.round(scrollY.value / prev.height) * height;
    prevFrame.current = { width, height };
  }, [width, height]);

  useEffect(() => {
    ExpoOrientation.unlockAsync();
    return () => {
      ExpoOrientation.lockAsync(ExpoOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const currentPost = getCurrentPost?.(rowIndex);

  return (
    <Modal
      visible={true}
      transparent={true}
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={() => animateClose()}
    >
      <GestureHandlerRootView style={styles.flex}>
        <Animated.View style={[styles.background, backgroundStyle]} />
        {currentRowSize > 1 && (
          <Animated.View
            style={[
              styles.rowDetailsContainer,
              {
                bottom: safeAreaBottom + 10,
                right: safeAreaRight + 10,
              },
              rowDetailsStyle,
            ]}
          >
            <Touchable
              activeOpacity={0.2}
              animationDuration={{ in: 0, out: 150 }}
              style={[
                styles.rowNavigationButton,
                {
                  opacity: columnIndex === 0 ? 0.5 : 1,
                },
              ]}
              disabled={columnIndex === 0}
              onPress={() => handleTapToScrollRow("left")}
              hitSlop={10}
            >
              <FontAwesome6 name="arrow-left" size={16} color="white" />
            </Touchable>
            <Touchable
              activeOpacity={0.2}
              animationDuration={{ in: 0, out: 150 }}
              style={[
                styles.rowNavigationButton,
                {
                  opacity: columnIndex === currentRowSize - 1 ? 0.5 : 1,
                },
              ]}
              disabled={columnIndex === currentRowSize - 1}
              onPress={() => handleTapToScrollRow("right")}
              hitSlop={10}
            >
              <FontAwesome6 name="arrow-right" size={16} color="white" />
            </Touchable>
            <View style={styles.itemIndexContainer}>
              <Text style={styles.itemIndexText}>
                {columnIndex + 1} / {currentRowSize}
              </Text>
            </View>
          </Animated.View>
        )}
        <Animated.View
          style={[styles.flex, contentStyle]}
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
              toggleOverlay();
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
              },
              overlayStyle,
            ]}
          >
            {currentPost && (
              <PostOverlay
                post={currentPost}
                closeViewer={() => animateClose()}
                columnIndex={columnIndex}
              />
            )}
          </Animated.View>
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[styles.flex, verticalStyle]}
              collapsable={false}
            >
              {visibleRows.map((row) => (
                <RowStrip
                  key={`${row}-${orientation}`}
                  row={row}
                  items={media[row]}
                  isRowFocused={row === rowIndex}
                  centerColumn={
                    row === rowIndex
                      ? columnIndex
                      : (columnMemory.current.get(row) ?? 0)
                  }
                  width={width}
                  height={height}
                  activeRow={activeRow}
                  scrollX={scrollX}
                  columns={columns}
                  pagerEnabled={pagerEnabled}
                  overlayStyle={overlayStyle}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                />
              ))}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

type RowStripProps = {
  row: number;
  items: MediaItemRow;
  isRowFocused: boolean;
  centerColumn: number;
  width: number;
  height: number;
  activeRow: SharedValue<number>;
  scrollX: SharedValue<number>;
  columns: SharedValue<Record<number, number>>;
  pagerEnabled: SharedValue<boolean>;
  overlayStyle: AnimatedStyleHandle<{ opacity: number }>;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
};

function RowStrip({
  row,
  items,
  isRowFocused,
  centerColumn,
  width,
  height,
  activeRow,
  scrollX,
  columns,
  pagerEnabled,
  overlayStyle,
  isMuted,
  setIsMuted,
}: RowStripProps) {
  const horizontalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          row === activeRow.value
            ? -scrollX.value
            : -(columns.value[row] ?? 0) * width,
      },
    ],
  }));

  const visibleColumns = [
    centerColumn - 1,
    centerColumn,
    centerColumn + 1,
  ].filter((column) => column >= 0 && column < items.length);

  return (
    <Animated.View
      style={[
        { position: "absolute", top: row * height, width, height },
        horizontalStyle,
      ]}
    >
      {visibleColumns.map((column) => {
        const item = items[column];
        return (
          <View
            key={column}
            style={{
              position: "absolute",
              left: column * width,
              width,
              height,
            }}
          >
            {item.type === "image" ? (
              <MediaImage item={item} pagerEnabled={pagerEnabled} />
            ) : (
              <MediaVideo
                source={item.source}
                focused={centerColumn === column && isRowFocused}
                overlayStyle={overlayStyle}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
              />
            )}
          </View>
        );
      })}
    </Animated.View>
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
  overlayContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "space-between",
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
