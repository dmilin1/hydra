import { StyleSheet, View } from "react-native";

/**
 * A circular border in RN splits its color segments at the 45 degree diagonals,
 * so coloring only the top and right edges yields a 180 degree arc spanning
 * 315 to 135 degrees. Each half of the ring clips that arc to its own 180 degree
 * window, which lets the same rotation reveal exactly `progress` worth of it.
 */
export default function ProgressRing({
  progress,
  size,
  strokeWidth = 1,
  color = "white",
}: {
  progress: number;
  size: number;
  strokeWidth?: number;
  color?: string;
}) {
  const degrees = Math.min(Math.max(progress, 0), 1) * 360;

  const arc = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: strokeWidth,
    borderTopColor: color,
    borderRightColor: color,
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.clip, styles.rightClip, { width: size / 2 }]}>
        <View
          style={[
            styles.arc,
            arc,
            {
              right: 0,
              transform: [{ rotate: `${Math.min(degrees, 180) - 135}deg` }],
            },
          ]}
        />
      </View>
      <View style={[styles.clip, styles.leftClip, { width: size / 2 }]}>
        <View
          style={[
            styles.arc,
            arc,
            {
              left: 0,
              transform: [{ rotate: `${Math.max(degrees, 180) - 135}deg` }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  clip: {
    position: "absolute",
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },
  rightClip: {
    right: 0,
  },
  leftClip: {
    left: 0,
  },
  arc: {
    position: "absolute",
    top: 0,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
});
