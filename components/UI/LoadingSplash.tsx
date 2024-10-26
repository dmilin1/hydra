import { SplashScreen } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";

export default function LoadingSplash() {
  return (
    <>
      <View style={styles.splashContainer}>
        <Image
          style={styles.image}
          source={require("./../../assets/images/splash.png")}
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
