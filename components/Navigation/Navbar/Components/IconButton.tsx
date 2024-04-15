import React, { ReactNode, useContext } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import {
  ThemeContext,
  t,
} from "../../../../contexts/SettingsContexts/ThemeContext";

type IconButtonProps = {
  icon: ReactNode;
  justifyContent?: "flex-start" | "flex-end" | "center";
  onPress?: () => void;
};

export default function IconButton({
  icon,
  justifyContent,
  onPress,
}: IconButtonProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={t(styles.sectionContainer, {
        justifyContent: justifyContent ?? "center",
      })}
    >
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onPress?.()}
        style={t(styles.touchableContainer, {
          color: onPress ? theme.buttonText : theme.text,
        })}
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  touchableContainer: {
    paddingHorizontal: 5,
  },
});
