import React, { useContext } from "react";
import { StyleSheet, Text } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

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
    <Touchable
      style={[
        styles.sectionContainer,
        {
          justifyContent: justifyContent ?? "center",
        },
      ]}
      activeOpacity={0.5}
      animationDuration={{ in: 0, out: 150 }}
      onPress={() => onPress?.()}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.centerText,
          {
            color: theme.iconOrTextButton,
          },
        ]}
      >
        {text}
      </Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 5,
  },
  centerText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
