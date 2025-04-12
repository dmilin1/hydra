import React, { ReactNode, useContext } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

type IconButtonProps = {
  icon: ReactNode;
  justifyContent?: "flex-start" | "flex-end" | "center";
  onPress: () => void;
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
        style={t(styles.touchableContainer)}
      >
        <Text style={{ color: theme.iconOrTextButton }}>{icon}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  touchableContainer: {
    marginRight: -10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingLeft: 20,
  },
});
