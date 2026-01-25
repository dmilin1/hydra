import { SplashScreen } from "expo-router";
import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

const splash = require("./../../assets/images/splash.png");
const splashInverted = require("./../../assets/images/splashInverted.png");

export default function LoadingSplash() {
  const { theme } = useContext(ThemeContext);
  const { width, height } = useWindowDimensions();

  return (
    <>
      <View style={[styles.splashContainer, { width, height }]}>
        <Image
          style={[
            styles.image,
            {
              backgroundColor: theme.background,
            },
          ]}
          source={theme.systemModeStyle === "dark" ? splash : splashInverted}
          onLoadEnd={SplashScreen.hideAsync}
        />
      </View>
      <View style={[styles.loaderContainer, { width, height }]}>
        <ActivityIndicator />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    zIndex: 1000,
    top: 0,
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
    top: 100,
    alignItems: "center",
    justifyContent: "center",
  },
});
