import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { ScrollToNextButtonContext } from "../contexts/ScrollToNextButtonContext";
import { useContext, useEffect } from "react";

export function useScrollToNextButton({
  scrollToNext,
  scrollToPrevious,
}: {
  scrollToNext: () => void;
  scrollToPrevious: () => void;
}) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    setShowButton,
    setScrollToNext,
    setScrollToPrevious,
    setHeaderHeight,
    setTabBarHeight,
  } = useContext(ScrollToNextButtonContext);

  useEffect(() => {
    setHeaderHeight(headerHeight);
    setTabBarHeight(tabBarHeight);
  }, [headerHeight, tabBarHeight]);

  useEffect(() => {
    setShowButton(true);
    setScrollToNext(scrollToNext);
    setScrollToPrevious(scrollToPrevious);
    return () => {
      setScrollToNext(() => {});
      setScrollToPrevious(() => {});
      setShowButton(false);
    };
  }, [scrollToNext, scrollToPrevious]);
}
