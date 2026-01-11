import React, {
  ComponentType,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  VirtualizedList,
  Text,
} from "react-native";

import { ImageSource } from "./@types";
import ImageDefaultHeader from "./components/ImageDefaultHeader";
import ImageItem from "./components/ImageItem/ImageItem";
import useAnimatedComponents from "./hooks/useAnimatedComponents";
import useImageIndexChange from "./hooks/useImageIndexChange";
import useRequestClose from "./hooks/useRequestClose";
import { ThemeContext } from "../../../../../../contexts/SettingsContexts/ThemeContext";

export type ImageSliderProps = {
  images: ImageSource[];
  keyExtractor?: (imageSrc: ImageSource, index: number) => string;
  initialImageIndex: number;
  onRequestClose: () => void;
  onLongPress?: (image: ImageSource) => void;
  onImageIndexChange?: (imageIndex: number) => void;
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  delayLongPress?: number;
  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
};

const DEFAULT_DELAY_LONG_PRESS = 800;
const SCREEN = Dimensions.get("screen");
const SCREEN_WIDTH = SCREEN.width;

export default function ImageSlider({
  images,
  keyExtractor,
  initialImageIndex,
  onRequestClose,
  onLongPress = () => {},
  onImageIndexChange,
  swipeToCloseEnabled = true,
  doubleTapToZoomEnabled,
  delayLongPress = DEFAULT_DELAY_LONG_PRESS,
  HeaderComponent,
  FooterComponent,
}: ImageSliderProps) {
  const { theme } = useContext(ThemeContext);

  const imageList = useRef<VirtualizedList<ImageSource>>(null);
  const [_opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
  const [currentImageIndex, onScroll] = useImageIndexChange(
    initialImageIndex,
    SCREEN,
  );
  const [headerTransform, footerTransform, toggleBarsVisible] =
    useAnimatedComponents();

  useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex);
    }
  }, [currentImageIndex]);

  const onZoom = useCallback(
    (isScaled: boolean) => {
      // @ts-expect-error setNativeProps is not typed correctly
      imageList?.current?.setNativeProps({ scrollEnabled: !isScaled });
      toggleBarsVisible(!isScaled);
    },
    [imageList],
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { transform: headerTransform }]}>
        {typeof HeaderComponent !== "undefined" ? (
          React.createElement(HeaderComponent, {
            imageIndex: currentImageIndex,
          })
        ) : swipeToCloseEnabled ? (
          <ImageDefaultHeader onRequestClose={onRequestCloseEnhanced} />
        ) : null}
      </Animated.View>
      <VirtualizedList
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
        ref={imageList}
        data={images}
        horizontal
        pagingEnabled
        windowSize={3}
        initialNumToRender={2}
        maxToRenderPerBatch={100}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialImageIndex}
        getItem={(_: ImageSource[], index: number) => images[index]}
        getItemCount={() => images.length}
        getItemLayout={(_: ImageSource, index: number) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        scrollEnabled={images.length > 1}
        renderItem={({ item: imageSrc }: { item: ImageSource }) => (
          <ImageItem
            onZoom={onZoom}
            imageSrc={imageSrc}
            onRequestClose={onRequestCloseEnhanced}
            onLongPress={onLongPress}
            delayLongPress={delayLongPress}
            swipeToCloseEnabled={swipeToCloseEnabled}
            doubleTapToZoomEnabled={doubleTapToZoomEnabled}
          />
        )}
        onMomentumScrollEnd={onScroll}
        keyExtractor={(imageSrc, index) =>
          keyExtractor
            ? keyExtractor(imageSrc, index)
            : typeof imageSrc === "number"
              ? `${imageSrc}`
              : (imageSrc.uri ?? index.toString())
        }
      />
      {images.length > 1 && (
        <View
          style={[
            styles.imageCounterPill,
            {
              backgroundColor: theme.background,
            },
          ]}
        >
          <Text
            style={[
              styles.counterText,
              {
                color: theme.text,
              },
            ]}
          >
            {currentImageIndex + 1} / {images.length}
          </Text>
        </View>
      )}
      {typeof FooterComponent !== "undefined" && (
        <Animated.View style={[styles.footer, { transform: footerTransform }]}>
          {React.createElement(FooterComponent, {
            imageIndex: currentImageIndex,
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
  },
  header: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    top: 0,
  },
  footer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    bottom: 0,
  },
  imageCounterPill: {
    position: "absolute",
    right: 16,
    bottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
