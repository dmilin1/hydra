import { createContext } from "react";

export const ActionSheetBgContext = createContext({
  setIsActionSheetShowing: (() => {}) as (isShowing: boolean) => void,
});
