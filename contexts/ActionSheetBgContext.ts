import { createContext } from "react";

export const ActionSheetBgContext = createContext({
  isActionSheetShowing: false,
  setIsActionSheetShowing: (() => {}) as (isShowing: boolean) => void,
});
