import { createContext, Dispatch, SetStateAction } from "react";

export const ScrollToNextButtonContext = createContext({
  setShowButton: (() => {}) as (show: boolean) => void,
  setScrollToNext: (() => {}) as (fn: () => void) => void,
  setScrollToPrevious: (() => {}) as (fn: () => void) => void,
  setHeaderHeight: (() => {}) as Dispatch<SetStateAction<number>>,
  setTabBarHeight: (() => {}) as Dispatch<SetStateAction<number>>,
});
