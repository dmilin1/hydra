import React, { useState, useRef } from "react";
import { TextProps, Text } from "react-native";

/**
 * Horrible evil hack to fix what I think is an Apple text rendering bug.
 * https://www.reddit.com/r/HydraApp/comments/1n7scvs/comment/ncbmi3e/
 */

export function TextWithRepairedHeight(props: TextProps) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const heightFixed = useRef(false);

  return (
    <Text
      {...props}
      style={[
        props.style,
        {
          height: height,
        },
      ]}
      onLayout={({ nativeEvent }) => {
        if (heightFixed.current) return;
        const height = nativeEvent.layout.height;
        const roundedHeight = Math.round(height);

        if (height !== roundedHeight) {
          setHeight(roundedHeight + 1);
          heightFixed.current = true;
        }
      }}
    />
  );
}
