import { createContext, useContext, useRef } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Animated,
} from "react-native";
import { TabSettingsContext } from "./SettingsContexts/TabSettingsContext";

const initialTabScrollContext = {
  tabBarTranslateY: new Animated.Value(0),
  handleScrollForTabBar: (_: NativeSyntheticEvent<NativeScrollEvent>) => {},
};

export const TabScrollContext = createContext(initialTabScrollContext);

export function TabScrollProvider({ children }: React.PropsWithChildren) {
  const { hideTabsOnScroll } = useContext(TabSettingsContext);

  const lastScrollY = useRef(0);
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const handleScrollForTabBar = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!hideTabsOnScroll) return;

    const currentScrollY = e.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;
    const scrollDirection =
      scrollDelta > 0 && currentScrollY > 50 ? "down" : "up";

    if (Math.abs(scrollDelta) < 5 || isAnimating.current) return;

    isAnimating.current = true;

    Animated.timing(tabBarTranslateY, {
      toValue: scrollDirection === "down" ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });

    lastScrollY.current = currentScrollY;
  };

  return (
    <TabScrollContext.Provider
      value={{
        tabBarTranslateY,
        handleScrollForTabBar,
      }}
    >
      {children}
    </TabScrollContext.Provider>
  );
}
