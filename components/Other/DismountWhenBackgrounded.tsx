import { PropsWithChildren, useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";

export default function DismountWhenBackgrounded({
  children,
}: PropsWithChildren) {
  const [mounted, setMounted] = useState(true);
  const contentSize = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "background") {
        setMounted(true);
      } else {
        setMounted(false);
      }
    });
    return () => subscription.remove();
  }, []);

  return mounted ? (
    <View
      style={styles.contentContainer}
      onLayout={({ nativeEvent }) => {
        contentSize.current = {
          width: nativeEvent.layout.width,
          height: nativeEvent.layout.height,
        };
      }}
    >
      {children}
    </View>
  ) : (
    <View
      style={[
        styles.loadingContainer,
        {
          width: contentSize.current.width,
          height: contentSize.current.height,
        },
      ]}
    >
      <ActivityIndicator size="small" />
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
