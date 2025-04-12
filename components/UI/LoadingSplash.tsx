import { SplashScreen } from "expo-router";
import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";

const splash = require("./../../assets/images/splash.png");
const splashInverted = require("./../../assets/images/splashInverted.png");

export default function LoadingSplash() {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <View style={styles.splashContainer}>
        <Image
          style={t(styles.image, {
            backgroundColor: theme.background,
          })}
          source={theme.systemModeStyle === "dark" ? splash : splashInverted}
          onLoadEnd={SplashScreen.hideAsync}
        />
      </View>
      <View style={styles.loaderContainer}>
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
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
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
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
    alignItems: "center",
    justifyContent: "center",
  },
});
