import { SplashScreen } from "expo-router";
import React, { useContext } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

const splash = require("./../../assets/images/splash.png");
const splashInverted = require("./../../assets/images/splashInverted.png");

export default function LoadingSplash() {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={styles.splashContainer}>
      <Image
        style={[
          styles.image,
          {
            backgroundColor: theme.background,
          },
        ]}
        resizeMode="contain"
        source={theme.systemModeStyle === "dark" ? splash : splashInverted}
        onLoadEnd={SplashScreen.hideAsync}
      />
      <View style={styles.loaderContainer}>
        <ActivityIndicator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    zIndex: 1000,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    flex: 1,
    position: "absolute",
    zIndex: 1001,
    transform: [{ translateY: "10%" }],
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
