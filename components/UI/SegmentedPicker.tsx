import { useContext } from "react";
import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type SegmentedPickerProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export default function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedPickerProps<T>) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[styles.pickerContainer, { backgroundColor: theme.tint }, style]}
    >
      {options.map((option) => (
        <Touchable
          key={option.value}
          style={[
            styles.option,
            {
              backgroundColor:
                option.value === value ? theme.divider : "transparent",
            },
          ]}
          activeOpacity={0.8}
          animationDuration={{ in: 0, out: 150 }}
          onPress={() => {
            if (option.value !== value) onChange(option.value);
          }}
        >
          <Text
            style={[
              styles.optionText,
              option.value === value
                ? { color: theme.text, fontWeight: "600" }
                : { color: theme.subtleText },
            ]}
          >
            {option.label}
          </Text>
        </Touchable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: "row",
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 3,
    borderRadius: 10,
  },
  option: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },
});
