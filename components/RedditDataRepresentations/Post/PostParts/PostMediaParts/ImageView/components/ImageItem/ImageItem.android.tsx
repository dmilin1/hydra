import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  NativeMethodsMixin,
  useWindowDimensions,
} from "react-native";

import { ImageLoading } from "./ImageLoading";
import { ImageSource } from "../../@types";
import useImageDimensions from "../../hooks/useImageDimensions";
import usePanResponder from "../../hooks/usePanResponder";
import { getImageStyles, getImageTransform } from "../../utils";

const SWIPE_CLOSE_OFFSET = 75;
const SWIPE_CLOSE_VELOCITY = 1.75;

type Props = {
  imageSrc: ImageSource;
  onRequestClose: () => void;
  onZoom: (isZoomed: boolean) => void;
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
  const windowDimensions = useWindowDimensions();
  const imageContainer = useRef<ScrollView & NativeMethodsMixin>(null);
  const imageDimensions = useImageDimensions(imageSrc);
  const [translate, scale] = getImageTransform(
    imageDimensions,
    windowDimensions,
  );
  const scrollValueY = new Animated.Value(0);
  const [isLoaded, setLoadEnd] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const fittedImageHeight =
    imageDimensions && scale
      ? imageDimensions.height * scale
      : windowDimensions.height;
  const verticalInset = Math.max(
    0,
    (windowDimensions.height - fittedImageHeight) / 2,
  );

  const onLoaded = useCallback(() => setLoadEnd(true), []);
  const onZoomPerformed = useCallback(
    (isZoomed: boolean) => {
      setIsZoomed(isZoomed);
      onZoom(isZoomed);
      if (imageContainer?.current) {
        imageContainer.current.setNativeProps({
          scrollEnabled: !isZoomed,
        });
      }
    },
    [imageContainer],
  );

  const onLongPressHandler = useCallback(() => {
    onLongPress(imageSrc);
  }, [imageSrc, onLongPress]);

  const [panHandlers, scaleValue, translateValue] = usePanResponder({
    initialScale: scale || 1,
    initialTranslate: translate || { x: 0, y: 0 },
    onZoom: onZoomPerformed,
    doubleTapToZoomEnabled,
    onLongPress: onLongPressHandler,
    delayLongPress,
  });

  const imagesStyles = getImageStyles(
    imageDimensions,
    translateValue,
    scaleValue,
  );
  const imageOpacity = scrollValueY.interpolate({
    inputRange: [-SWIPE_CLOSE_OFFSET, 0, SWIPE_CLOSE_OFFSET],
    outputRange: [0.7, 1, 0.7],
  });
  const imageStylesWithOpacity = { ...imagesStyles, opacity: imageOpacity };

  const onScrollEndDrag = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const velocityY = nativeEvent?.velocity?.y ?? 0;
    const offsetY = nativeEvent?.contentOffset?.y ?? 0;

    if (
      (Math.abs(velocityY) > SWIPE_CLOSE_VELOCITY &&
        offsetY > SWIPE_CLOSE_OFFSET) ||
      offsetY > windowDimensions.height / 2
    ) {
      onRequestClose();
    }
  };

  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = nativeEvent?.contentOffset?.y ?? 0;

    scrollValueY.setValue(offsetY);
  };

  return (
    <Animated.View
      style={{
        width: windowDimensions.width,
        height: windowDimensions.height,
        backgroundColor: "black",
      }}
    >
      {!isZoomed && verticalInset > 0 && (
        <>
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: verticalInset,
              zIndex: 1,
            }}
            onPress={onRequestClose}
          />
          <Pressable
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: verticalInset,
              zIndex: 1,
            }}
            onPress={onRequestClose}
          />
        </>
      )}
      <ScrollView
        ref={imageContainer}
        style={{
          width: windowDimensions.width,
          height: windowDimensions.height,
        }}
        pagingEnabled
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          height: windowDimensions.height * 2,
        }}
        scrollEnabled={swipeToCloseEnabled}
        {...(swipeToCloseEnabled && {
          onScroll,
          onScrollEndDrag,
        })}
      >
        <Animated.Image
          {...panHandlers}
          source={imageSrc}
          style={imageStylesWithOpacity}
          onLoad={onLoaded}
        />
        {(!isLoaded || !imageDimensions) && <ImageLoading />}
      </ScrollView>
    </Animated.View>
  );
};

export default React.memo(ImageItem);
