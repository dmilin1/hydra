import { useHeaderHeight } from "@react-navigation/elements";
import { createContext, PropsWithChildren, useContext, useRef } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";

export const IS_LIQUID_GLASS =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

const [IOS_MAJOR, IOS_MINOR = 0] = String(Platform.Version)
  .split(".")
  .map(Number);

// The system search tab: a separate glass button that turns into a search field
export const HAS_SEARCH_TAB_ROLE =
  Platform.OS === "ios" &&
  (IOS_MAJOR > 26 || (IOS_MAJOR === 26 && IOS_MINOR >= 1));

const GlassHeaderInsetContext = createContext(0);

/**
 * Passes on the header's full height. On iOS 27 useHeaderHeight follows the
 * header every frame while it minimizes; consumers want the space a full header
 * takes, and re-rendering them each frame would make the page stutter.
 */
export function GlassHeaderInsetProvider({ children }: PropsWithChildren) {
  const headerHeight = useHeaderHeight();
  const { width } = useSafeAreaFrame();
  const expanded = useRef({ width, height: headerHeight });
  // A resize (rotation, fold) can change the full height, so start over
  if (expanded.current.width !== width) {
    expanded.current = { width, height: headerHeight };
  } else {
    expanded.current.height = Math.max(expanded.current.height, headerHeight);
  }
  return (
    <GlassHeaderInsetContext.Provider
      value={IS_LIQUID_GLASS ? expanded.current.height : 0}
    >
      {children}
    </GlassHeaderInsetContext.Provider>
  );
}

/**
 * Glass headers float over content, so a TabBarScrollView starts under the
 * header and UIKit insets its content by the header's height. Code that scrolls
 * to a position or places views at the top must add this to stay below it.
 * Only valid on screens that use the glass header.
 */
export const useGlassHeaderInset = () => useContext(GlassHeaderInsetContext);

/**
 * Glass headers let taps on their empty areas through to the post under them,
 * and the post's RNGH tap beats UIKit's scroll-to-top. A plain view there takes
 * the touch without handling it, so scroll-to-top wins again. Sized to the
 * live header, not the status bar: a folded iPhone Duo has no top inset but
 * still leaves an empty strip above the header's buttons.
 */
export function StatusBarTapShield() {
  const headerHeight = useHeaderHeight();
  return (
    <View
      // Layout-only views get flattened away and can't receive touches
      collapsable={false}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
      }}
    />
  );
}
