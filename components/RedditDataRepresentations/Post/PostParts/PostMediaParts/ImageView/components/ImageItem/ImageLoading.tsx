import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

export function ImageLoading() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={[styles.loading, { width, height }]}>
      <ActivityIndicator size="small" color="#FFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    justifyContent: "center",
  },
});
