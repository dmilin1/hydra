import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  ViewStyle,
  Text,
  GestureResponderEvent,
  ColorValue,
} from "react-native";

interface SliderProps {
  value?: number;
  minimumValue?: number;
  maximumValue?: number;
  onValueChange?: (value: number) => void;
  onSlidingStart?: () => void;
  onSlidingComplete?: (value: number) => void;
  disabled?: boolean;
  minimumTrackTintColor?: ColorValue;
  maximumTrackTintColor?: ColorValue;
  thumbTintColor?: ColorValue;
  style?: ViewStyle;
  trackStyle?: ViewStyle;
  thumbStyle?: ViewStyle;
  thumbSize?: number;
}

export default function Slider({
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  disabled = false,
  minimumTrackTintColor = "#3182CE",
  maximumTrackTintColor = "#E2E8F0",
  thumbTintColor = "#FFFFFF",
  style,
  trackStyle,
  thumbStyle,
  thumbSize = 20,
}: SliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [currentValue, setCurrentValue] = useState(value);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const trackRef = useRef<View>(null);

  // Calculate position from value
  const valueToPosition = useCallback(
    (val: number) => {
      const clampedValue = Math.max(minimumValue, Math.min(maximumValue, val));
      const percentage =
        (clampedValue - minimumValue) / (maximumValue - minimumValue);
      return percentage * sliderWidth;
    },
    [minimumValue, maximumValue, sliderWidth],
  );

  // Calculate value from position
  const positionToValue = useCallback(
    (position: number) => {
      const percentage = Math.max(0, Math.min(1, position / sliderWidth));
      const newValue =
        minimumValue + percentage * (maximumValue - minimumValue);
      return Math.max(minimumValue, Math.min(maximumValue, newValue));
    },
    [minimumValue, maximumValue, sliderWidth],
  );

  // Update animated value when value prop changes
  useEffect(() => {
    if (sliderWidth > 0) {
      const position = valueToPosition(value);
      Animated.timing(animatedValue, {
        toValue: position,
        duration: 0,
        useNativeDriver: false,
      }).start();
      setCurrentValue(value);
    }
  }, [value, sliderWidth, valueToPosition, animatedValue]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width - thumbSize);
  };

  const updateValueFromEvent = (event: GestureResponderEvent) => {
    if (!trackRef.current || disabled) return;

    trackRef.current.measure((_x, _y, _width, _height, pageX, _pageY) => {
      const touchX = event.nativeEvent.pageX - pageX;
      const position = Math.max(
        0,
        Math.min(sliderWidth, touchX - thumbSize / 2),
      );

      Animated.timing(animatedValue, {
        toValue: position,
        duration: 0,
        useNativeDriver: false,
      }).start();

      const newValue = positionToValue(position);
      setCurrentValue(newValue);
      onValueChange?.(newValue);
    });
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    if (disabled) return;
    onSlidingStart?.();
    updateValueFromEvent(event);
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    updateValueFromEvent(event);
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    onSlidingComplete?.(currentValue);
  };

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <Text style={styles.valueText}>{Math.round(currentValue)}</Text>

      <View
        ref={trackRef}
        style={[
          styles.track,
          { backgroundColor: maximumTrackTintColor },
          trackStyle,
        ]}
        onStartShouldSetResponder={() => !disabled}
        onMoveShouldSetResponder={() => !disabled}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        <Animated.View
          style={[
            styles.minimumTrack,
            {
              backgroundColor: minimumTrackTintColor,
              width: animatedValue,
            },
          ]}
        />

        <Animated.View
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbTintColor,
              transform: [{ translateX: animatedValue }],
            },
            thumbStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: "relative",
  },
  minimumTrack: {
    position: "absolute",
    height: "100%",
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    top: -8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  valueText: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 8,
    textAlign: "center",
  },
});
