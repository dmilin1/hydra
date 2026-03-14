import {
  ActionSheetOptions,
  useActionSheet,
} from "@expo/react-native-action-sheet";
import { useContext } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { ActionSheetBgContext } from "../contexts/ActionSheetBgContext";

type OpenContextMenuFn = <Options extends string[]>(
  actionSheetOptions: ActionSheetOptions & { options: Options },
) => Promise<Options[number] | null>;

export default function useContextMenu() {
  const { setIsActionSheetShowing } = useContext(ActionSheetBgContext);
  const { showActionSheetWithOptions } = useActionSheet();
  const { theme } = useContext(ThemeContext);

  const waitForActionSheetToClose = () =>
    new Promise((resolve) => setTimeout(resolve, 250));

  const openContextMenu: OpenContextMenuFn = (actionSheetOptions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActionSheetShowing(true);
    const themeText = String(theme.text);
    const themeSubtleText = String(theme.subtleText);
    const themeTint = String(theme.tint);
    const themeDivider = String(theme.divider);
    const themeDelete = String(theme.delete);

    const themedOptions =
      Platform.OS === "android"
        ? {
            tintColor: themeText,
            cancelButtonTintColor: themeText,
            destructiveColor: themeDelete,
            containerStyle: {
              backgroundColor: themeTint,
            },
            separatorStyle: {
              backgroundColor: themeDivider,
            },
            textStyle: {
              color: themeText,
            },
            titleTextStyle: {
              color: themeSubtleText,
            },
            messageTextStyle: {
              color: themeSubtleText,
            },
          }
        : null;

    return new Promise((resolve) => {
      const cancelButtonIndex = actionSheetOptions.options.length;
      showActionSheetWithOptions(
        {
          ...actionSheetOptions,
          ...themedOptions,
          options: [...actionSheetOptions.options, "Cancel"],
          cancelButtonIndex,
          userInterfaceStyle: theme.systemModeStyle,
        },
        async (buttonIndex) => {
          setIsActionSheetShowing(false);
          await waitForActionSheetToClose();
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
