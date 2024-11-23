import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import {
  ThemeContext,
  t,
} from "../../../contexts/SettingsContexts/ThemeContext";

type TextButtonProps = {
  text: string;
  justifyContent?: "flex-start" | "flex-end" | "center";
  onPress: () => void;
};

export default function TextButton({
  text,
  justifyContent,
  onPress,
}: TextButtonProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={t(styles.sectionContainer, {
        justifyContent: justifyContent ?? "center",
      })}
      activeOpacity={0.5}
      onPress={() => onPress?.()}
    >
      <Text
        numberOfLines={1}
        style={t(styles.centerText, {
          color: theme.buttonText,
        })}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  centerText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
