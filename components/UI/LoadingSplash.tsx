import * as SplashScreen from "expo-splash-screen";
import { useContext } from "react";
import { View, StyleSheet, Image, ActivityIndicator } from "react-native";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";

const splash = require("./../../assets/images/icon_transparent.png");
const splashInverted = require("./../../assets/images/icon_transparent_inverted.png");

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
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
  },
  loaderContainer: {
    height: 0,
    transform: [{ translateY: 5 }],
  },
});
