import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { TabSettingsContext } from "./SettingsContexts/TabSettingsContext";
import { IS_LIQUID_GLASS } from "../utils/liquidGlass";

/**
 * iOS 26+ minimizes the Liquid Glass tab bar natively on scroll, so the JS
 * hide is only needed on Android and older iOS.
 */
export const USES_NATIVE_TAB_BAR_MINIMIZE = IS_LIQUID_GLASS;

export const TabScrollContext = createContext({
  handleScrollForTabBar: (_: NativeSyntheticEvent<NativeScrollEvent>) => {},
  showTabBar: () => {},
});

// Separate so toggling the bar doesn't re-render every scroller.
export const TabBarHiddenContext = createContext(false);

export function TabScrollProvider({ children }: React.PropsWithChildren) {
  const { hideTabsOnScroll } = useContext(TabSettingsContext);

  const lastScrollY = useRef(0);
  const hiddenRef = useRef(false);
  const [tabBarHidden, setTabBarHidden] = useState(false);

  const handleScrollForTabBar = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hideTabsOnScroll || USES_NATIVE_TAB_BAR_MINIMIZE) return;

      const currentScrollY = e.nativeEvent.contentOffset.y;
      if (Number.isNaN(lastScrollY.current)) {
        lastScrollY.current = currentScrollY;
        return;
      }
      const scrollDelta = currentScrollY - lastScrollY.current;
      if (Math.abs(scrollDelta) < 5) return;
      lastScrollY.current = currentScrollY;

      const shouldHide = scrollDelta > 0 && currentScrollY > 50;
      if (shouldHide === hiddenRef.current) return;
      hiddenRef.current = shouldHide;
      setTabBarHidden(shouldHide);
    },
    [hideTabsOnScroll],
  );
  const showTabBar = useCallback(() => {
    // The next scroll may come from another tab's list, so start a fresh baseline
    lastScrollY.current = NaN;
    hiddenRef.current = false;
    setTabBarHidden(false);
  }, []);
  const scrollContextValue = useMemo(
    () => ({ handleScrollForTabBar, showTabBar }),
    [handleScrollForTabBar, showTabBar],
  );

  return (
    <TabScrollContext.Provider value={scrollContextValue}>
      <TabBarHiddenContext.Provider value={hideTabsOnScroll && tabBarHidden}>
        {children}
      </TabBarHiddenContext.Provider>
    </TabScrollContext.Provider>
  );
}
