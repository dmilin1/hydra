import { PropsWithChildren, createContext, useContext } from "react";
import { StyleProp, View, ViewStyle } from "react-native";

export const OVERLAY_BACKGROUND_COLOR = "rgba(20, 20, 20, 0.65)";

export const OverlayInteractionContext = createContext({
  bumpAutoHide: () => {},
});

export const useOverlayInteraction = () =>
  useContext(OverlayInteractionContext);

export function OverlayIsland({
  style,
  children,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={style}
      // Prevent overlay touches from triggering the tap to toggle
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {children}
    </View>
  );
}
