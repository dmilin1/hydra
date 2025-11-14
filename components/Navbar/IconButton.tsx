import React, { ReactNode, useContext } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
} from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  touchableOpacityProps?: TouchableOpacityProps;
};

export default function IconButton({
  icon,
  onPress,
  touchableOpacityProps,
}: IconButtonProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={() => onPress?.()}
      style={[styles.touchableContainer]}
      {...touchableOpacityProps}
    >
      <Text style={{ color: theme.iconOrTextButton }}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchableContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 35,
    height: 35,
    marginLeft: 0.5,
  },
});
