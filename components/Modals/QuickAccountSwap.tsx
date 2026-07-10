import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Animated, useAnimatedValue } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import AccountList from "../UI/AccountList";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

type QuickAccountSwapProps = {
  show: boolean;
  onExit: () => void;
};

export default function QuickAccountSwap({
  show,
  onExit,
}: QuickAccountSwapProps) {
  const { theme } = useContext(ThemeContext);

  const opacity = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: show ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [show]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacity,
          pointerEvents: show ? "auto" : "none",
        },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.tint,
              borderColor: theme.divider,
            },
          ]}
        >
          <AccountList onAccountAction={onExit} />
        </View>
      </SafeAreaView>
      <Touchable style={styles.background} onPress={() => onExit()} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    opacity: 0.7,
    zIndex: 1,
  },
  safeArea: {
    width: "100%",
    zIndex: 2,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    pointerEvents: "box-none",
  },
  card: {
    width: "100%",
    marginBottom: 20,
    pointerEvents: "auto",
    maxHeight: 400,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
});
