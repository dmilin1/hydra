import React, { ReactNode, useContext } from "react";
import { StyleSheet, Text } from "react-native";
import { Touchable, TouchableProps } from "react-native-gesture-handler";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  touchableOpacityProps?: TouchableProps;
};

export default function IconButton({
  icon,
  onPress,
  touchableOpacityProps,
}: IconButtonProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <Touchable
      activeOpacity={0.5}
      animationDuration={{ in: 0, out: 150 }}
      onPress={() => onPress?.()}
      style={[styles.touchableContainer]}
      {...touchableOpacityProps}
    >
      <Text style={{ color: theme.iconOrTextButton }}>{icon}</Text>
    </Touchable>
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
