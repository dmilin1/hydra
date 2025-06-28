import {
  ActionSheetOptions,
  useActionSheet,
} from "@expo/react-native-action-sheet";
import { useContext } from "react";
import * as Haptics from "expo-haptics";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";

type OpenContextMenuFn = <Options extends string[]>(
  actionSheetOptions: ActionSheetOptions & { options: Options },
) => Promise<Options[number] | null>;

export default function useContextMenu() {
  const { showActionSheetWithOptions } = useActionSheet();
  const { theme } = useContext(ThemeContext);

  const openContextMenu: OpenContextMenuFn = (actionSheetOptions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) {
            return resolve(null);
          }
          resolve(actionSheetOptions.options[buttonIndex]);
        },
      );
    });
  };

  return openContextMenu;
}
