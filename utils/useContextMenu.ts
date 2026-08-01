import {
  ActionSheetOptions,
  useActionSheet,
} from "@expo/react-native-action-sheet";
import { useContext } from "react";
import * as Haptics from "expo-haptics";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { ActionSheetBgContext } from "../contexts/ActionSheetBgContext";
import { Platform } from "react-native";

type OpenContextMenuFn = <Options extends string[]>(
  actionSheetOptions: ActionSheetOptions & { options: Options },
) => Promise<Options[number] | null>;

export default function useContextMenu() {
  const { setIsActionSheetShowing } = useContext(ActionSheetBgContext);
  const { showActionSheetWithOptions } = useActionSheet();
  const { theme } = useContext(ThemeContext);

  const openContextMenu: OpenContextMenuFn = (actionSheetOptions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActionSheetShowing(true);
    return new Promise((resolve) => {
      const cancelButtonIndex = actionSheetOptions.options.length;
      showActionSheetWithOptions(
        {
          ...actionSheetOptions,
          options: [...actionSheetOptions.options, "Cancel"],
          cancelButtonIndex,
          userInterfaceStyle: theme.systemModeStyle,
        },
        async (buttonIndex) => {
          setIsActionSheetShowing(false);
          if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) {
            return resolve(null);
          }
          if (Platform.OS === "android") {
            /**
             * Fixes a bug on Android where displaying 2 action sheets in a row
             * causes the second action sheet to not be displayed.
             */
            requestAnimationFrame(() => {
              resolve(actionSheetOptions.options[buttonIndex]);
            });
          } else {
            resolve(actionSheetOptions.options[buttonIndex]);
          }
        },
      );
    });
  };

  return openContextMenu;
}
