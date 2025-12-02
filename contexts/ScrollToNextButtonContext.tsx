import { createContext } from "react";

export const ScrollToNextButtonContext = createContext({
  setScrollToNext: (() => {}) as (fn: () => void) => void,
  setScrollToPrevious: (() => {}) as (fn: () => void) => void,
});
