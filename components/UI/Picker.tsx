import { forwardRef, Ref, useContext } from "react";
import { StyleSheet, Text } from "react-native";
import RNPickerSelect, { PickerSelectProps } from "react-native-picker-select";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

export default forwardRef(function Picker(
  props: PickerSelectProps,
  ref: Ref<RNPickerSelect>,
) {
  const { theme } = useContext(ThemeContext);

  return (
    <RNPickerSelect
      ref={ref}
      style={{
        viewContainer: {
          height: 31,
          justifyContent: "center",
        },
      }}
      placeholder={{}}
      darkTheme={theme.systemModeStyle === "dark"}
      {...props}
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.subtleText,
          },
        ]}
      >
        {props.items.find((item) => item.value === props.value)?.label}
      </Text>
    </RNPickerSelect>
  );
});

const styles = StyleSheet.create({
  pickerViewContainer: {
    // This height makes it the same as the built in toggle switch
    height: 31,
    justifyContent: "center",
  },
  text: {
    fontSize: 18,
  },
});
