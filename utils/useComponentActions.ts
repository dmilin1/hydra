import { AccessibilityActionEvent } from "react-native";
import useContextMenu from "./useContextMenu";

type Actions<ActionLabel extends string> = {
  label: ActionLabel;
  isAllowed?: boolean;
  isLongPressOption?: boolean;
  isAccessibilityAction?: boolean;
  handle: () => Promise<void>;
}[];

export default function useComponentActions<ActionLabel extends string>(
  actionsWithoutDefaults: Actions<ActionLabel>,
) {
  const openContextMenu = useContextMenu();

  const actions = actionsWithoutDefaults.map((action) => ({
    ...action,
    isAllowed: action.isAllowed ?? true,
    isLongPressOption: action.isLongPressOption ?? true,
    isAccessibilityAction: action.isAccessibilityAction ?? true,
  }));

  const accessibilityActions = actions
    .filter((action) => action.isAllowed && action.isAccessibilityAction)
    .map((action) => ({ name: action.label }));

  const handleAction = async (actionName: ActionLabel) => {
    await actions
      .find((action) => action.isAllowed && action.label === actionName)
      ?.handle?.();
  };

  const handleAccessibilityAction = async (e: AccessibilityActionEvent) => {
    const actionName = e.nativeEvent.actionName;
    await actions
      .find(
        (action) =>
          action.isAllowed &&
          action.isAccessibilityAction &&
          action.label === actionName,
      )
      ?.handle?.();
  };

  const handleLongPress = async () => {
    const longPressOptions = actions
      .filter((action) => action.isAllowed && action.isLongPressOption)
      .map((action) => action.label);
    const result = await openContextMenu<ActionLabel[]>({
      options: longPressOptions,
    });
    if (result) {
      await actions
        .find(
          (action) =>
            action.isAllowed &&
            action.isLongPressOption &&
            action.label === result,
        )
        ?.handle?.();
    }
  };

  return {
    accessibilityActions,
    handleAction,
    handleAccessibilityAction,
    handleLongPress,
  };
}
