import { StyleSheet, Text } from "react-native";
import useContextMenu from "./useContextMenu";
import { useContext } from "react";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";

type SettingsPickerProps<ValueType> = {
  items: { label: string; value: ValueType }[];
  value: ValueType;
  onChange: (value: ValueType) => void;
};

export function useSettingsPicker<ValueType>({
  items,
  value,
  onChange: onValueChange,
}: SettingsPickerProps<ValueType>) {
  const { theme } = useContext(ThemeContext);
  const openContextMenu = useContextMenu();

  return {
    openPicker: async () => {
      const result = await openContextMenu({
        options: items.map((item) => item.label),
      });
      if (!result) return;
      const selectedValue = items.find((item) => item.label === result)?.value;
      if (selectedValue) {
        onValueChange(selectedValue);
      }
    },
    rightIcon: (
      <Text
        style={[
          styles.text,
          {
            color: theme.subtleText,
          },
        ]}
      >
        {items.find((item) => item.value === value)?.label}
      </Text>
    ),
  };
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
  },
});
