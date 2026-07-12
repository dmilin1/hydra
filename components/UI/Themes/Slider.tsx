import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  ViewStyle,
  Text,
  ColorValue,
} from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";

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
  // onFinalize needs the value at release time without depending on render
  // closures staying fresh.
  const latestValue = useRef(value);

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
      animatedValue.setValue(valueToPosition(value));
      latestValue.current = value;
      setCurrentValue(value);
    }
  }, [value, sliderWidth, valueToPosition, animatedValue]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width - thumbSize);
  };

  // The pan event's x is already relative to the track, so no view
  // measurement is needed.
  const updateValueFromX = (x: number) => {
    if (disabled || sliderWidth <= 0) return;

    const position = Math.max(0, Math.min(sliderWidth, x - thumbSize / 2));
    animatedValue.setValue(position);

    const newValue = positionToValue(position);
    latestValue.current = newValue;
    setCurrentValue(newValue);
    onValueChange?.(newValue);
  };

  const panGesture = usePanGesture({
    // The callbacks drive React state and JS callbacks, so keep them on the
    // JS thread instead of letting them be auto-workletized onto the UI
    // runtime, where they couldn't call onValueChange.
    disableReanimated: true,
    enabled: !disabled,
    // Activate without requiring movement so a drag tracks from the first
    // point. A plain tap never activates the pan, so the initial jump also
    // happens in onBegin, which fires on every touch down.
    minDistance: 0,
    // The 4pt track is too thin a target on its own. Matches the touch area
    // the thumb's hitSlop used to provide.
    hitSlop: { top: 20, bottom: 20, left: 20, right: 20 },
    onBegin: (e) => {
      if (disabled) return;
      onSlidingStart?.();
      updateValueFromX(e.x);
    },
    onUpdate: (e) => updateValueFromX(e.x),
    onFinalize: () => {
      if (disabled) return;
      onSlidingComplete?.(latestValue.current);
    },
  });

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <Text style={styles.valueText}>{Math.round(currentValue)}</Text>

      <GestureDetector gesture={panGesture}>
        <View
          style={[
            styles.track,
            { backgroundColor: maximumTrackTintColor },
            trackStyle,
          ]}
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
      </GestureDetector>
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
