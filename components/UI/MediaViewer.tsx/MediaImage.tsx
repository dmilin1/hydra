import { useRecyclingState } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useRef, useState, useEffect } from "react";
import { useWindowDimensions, ScrollView } from "react-native";

export type ImageItem = {
  type: "image";
  uri: string;
};

export type MediaImageProps = {
  item: ImageItem;
  setIsScrollLocked: (isScrollLocked: boolean) => void;
};

export function MediaImage({ item, setIsScrollLocked }: MediaImageProps) {
  const { width, height } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);
  const previousTouchStart = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isZoomed, setIsZoomed] = useRecyclingState(false, [item.uri], () => {
    scrollViewRef.current?.scrollResponderZoomTo({
      x: 0,
      y: 0,
      width: width,
      height: height,
      animated: false,
    });
  });

  useEffect(() => {
    return () => {
      scrollViewRef.current?.scrollResponderZoomTo({
        x: 0,
        y: 0,
        width: width,
        height: height,
        animated: false,
      });
    };
  }, []);

  return (
    <ScrollView
      ref={scrollViewRef}
      minimumZoomScale={1}
      maximumZoomScale={10}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={{
        height,
        width,
      }}
      /**
       * These weird numbers fix some bugs where the images become offset when scrolling
       * deeply.
       *
       * The changing content container height fixes a bug where when pressing the X button
       * while zoomed in, the image would be offset weirdly after closing and reopening the
       * modal. For some magical reason, changing the height of the content container seems
       * to trigger a reflow which fixes it.
       */
      contentOffset={{ x: 0, y: 0.5 }}
      contentContainerStyle={{
        height: height + (isLoaded ? -1 : 10),
      }}
      bounces={isZoomed}
      onTouchStart={(event) => {
        const { pageX: currentX, pageY: currentY } =
          event.nativeEvent.touches[0];
        const newTouchStart = {
          x: currentX,
          y: currentY,
          timestamp: Date.now(),
        };
        if (
          // Previous touch exists
          previousTouchStart.current &&
          // Double touch is rapid enough
          newTouchStart.timestamp - previousTouchStart.current.timestamp <
            300 &&
          // Double touch is close enough
          Math.abs(currentX - previousTouchStart.current.x) < 20 &&
          Math.abs(currentY - previousTouchStart.current.y) < 20 &&
          // Only one touch is active
          event.nativeEvent.touches.length === 1
        ) {
          scrollViewRef.current?.scrollResponderZoomTo({
            x: newTouchStart.x - width / 4,
            y: newTouchStart.y - height / 4,
            width: width / (isZoomed ? 1 : 2),
            height: height / (isZoomed ? 1 : 2),
            animated: true,
          });
        }
        previousTouchStart.current = newTouchStart;
      }}
      onScroll={(event) => {
        const { zoomScale } = event.nativeEvent;
        const newIsZoomed = zoomScale > 1;
        if (newIsZoomed !== isZoomed) {
          setIsZoomed(newIsZoomed);
          setIsScrollLocked(newIsZoomed);
        }
      }}
    >
      <Image
        source={{ uri: item.uri }}
        style={{ width, height }}
        contentFit="contain"
        onLoad={() => setIsLoaded(true)}
        transition={150}
        allowDownscaling={false}
      />
    </ScrollView>
  );
}
