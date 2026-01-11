import { Image } from "expo-image";
import React, { useCallback, useContext, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableWithoutFeedback,
} from "react-native";

import { ImageLoading } from "./ImageLoading";
import { ImageSource } from "../../@types";
import useDoubleTapToZoom from "../../hooks/useDoubleTapToZoom";
import useImageDimensions from "../../hooks/useImageDimensions";
import { getImageStyles, getImageTransform } from "../../utils";
import { PostSettingsContext } from "../../../../../../../../contexts/SettingsContexts/PostSettingsContext";

const SWIPE_CLOSE_OFFSET = 50;
const SWIPE_CLOSE_VELOCITY = 1.55;
const SCREEN = Dimensions.get("window");
const SCREEN_WIDTH = SCREEN.width;
const SCREEN_HEIGHT = SCREEN.height;

type Props = {
  imageSrc: ImageSource;
  onRequestClose: () => void;
  onZoom: (scaled: boolean) => void;
  onLongPress: (image: ImageSource) => void;
  delayLongPress: number;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
};

const ImageItem = ({
  imageSrc,
  onZoom,
  onRequestClose,
  onLongPress,
  delayLongPress,
  swipeToCloseEnabled = true,
  doubleTapToZoomEnabled = true,
}: Props) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scaled, setScaled] = useState(false);
  const imageDimensions = useImageDimensions(imageSrc);
  const handleDoubleTap = useDoubleTapToZoom(scrollViewRef, scaled, SCREEN);
  const { liveTextInteraction } = useContext(PostSettingsContext);

  const [translate, scale] = getImageTransform(imageDimensions, SCREEN);
  const scrollValueY = new Animated.Value(0);
  const scaleValue = new Animated.Value(scale || 1);
  const translateValue = new Animated.ValueXY(translate);
  const maxScale = scale && scale > 0 ? Math.max(1 / scale, 1) : 1;

  const imageOpacity = scrollValueY.interpolate({
    inputRange: [
      -SWIPE_CLOSE_OFFSET,
      -SWIPE_CLOSE_OFFSET / 2,
      0,
      SWIPE_CLOSE_OFFSET / 2,
      SWIPE_CLOSE_OFFSET,
    ],
    outputRange: [0.85, 1, 1, 1, 0.85],
  });

  const imgClosingScale = scrollValueY.interpolate({
    inputRange: [
      -SWIPE_CLOSE_OFFSET * 2,
      -SWIPE_CLOSE_OFFSET,
      0,
      SWIPE_CLOSE_OFFSET,
      SWIPE_CLOSE_OFFSET * 2,
    ],
    outputRange: [0.75, 1, 1, 1, 0.75],
  });

  const imagesStyles = getImageStyles(
    imageDimensions,
    translateValue,
    Animated.multiply(scaleValue, imgClosingScale) as Animated.Value,
  );

  const onScrollEndDrag = useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const velocityY = nativeEvent?.velocity?.y ?? 0;
      const scaled = nativeEvent?.zoomScale > 1;

      onZoom(scaled);
      setScaled(scaled);

      if (!scaled) {
        // Fixes a bug where the image would get stuck when trying to swipe to close
        scrollViewRef.current?.scrollTo({ x: 0, y: 0.5 });
      }

      if (
        !scaled &&
        swipeToCloseEnabled &&
        (Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY ||
          Math.abs(nativeEvent?.contentOffset.y) > SWIPE_CLOSE_OFFSET)
      ) {
        onRequestClose();
      }
    },
    [scaled],
  );

  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = nativeEvent?.contentOffset?.y ?? 0;

    if (nativeEvent?.zoomScale > 1) {
      return;
    }

    scrollValueY.setValue(offsetY);
  };

  const onLongPressHandler = useCallback(() => {
    onLongPress(imageSrc);
  }, [imageSrc, onLongPress]);

  return (
    <Animated.View
      style={{
        opacity: imageOpacity,
        backgroundColor: "black",
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.listItem}
        contentOffset={{ x: 0, y: 0.5 }}
        pinchGestureEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        maximumZoomScale={maxScale}
        contentContainerStyle={{
          /**
           * Must be larger than the virtualized list that contains it
           * or you get a weird bug where you're unable vertically scroll
           * to exit the image. That's what all the 0.5s are about.
           *
           * Also, a new bug appeared where when pressing the X button while zoomed in,
           * the image would be offset weirdly. For some magical reason, changing the height
           * of the content container seems to trigger a reflow which fixes it.
           */
          height: SCREEN_HEIGHT + (loaded ? 1 : 10),
          width: SCREEN_WIDTH,
        }}
        scrollEnabled={swipeToCloseEnabled || scaled}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={1}
        {...(swipeToCloseEnabled && {
          onScroll,
        })}
      >
        {(!loaded || !imageDimensions) && <ImageLoading />}
        <TouchableWithoutFeedback
          onPress={doubleTapToZoomEnabled ? handleDoubleTap : undefined}
          onLongPress={onLongPressHandler}
          delayLongPress={liveTextInteraction ? 1500 : delayLongPress}
        >
          <Animated.View style={imagesStyles}>
            <Image
              source={imageSrc}
              style={{ width: "100%", height: "100%" }}
              onLoad={() => setLoaded(true)}
              enableLiveTextInteraction={liveTextInteraction}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default React.memo(ImageItem);
