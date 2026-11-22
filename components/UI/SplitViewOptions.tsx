import { StyleSheet, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useContext, useEffect } from "react";
import { useVerticalBarEdgeIOS } from "expo-status-bar";
import { StackFutureContext } from "../../contexts/StackFutureContext";
import { useURLNavigation } from "../../utils/navigation";
import { useTabBarInsets } from "../../contexts/TabBarInsetsContext";
import AntDesign from "@react-native-vector-icons/ant-design";

type SplitViewOptionsProps = {
  splitViewURL: string;
  setSplitViewURL: (url: string | null) => void;
};

export default function SplitViewOptions({
  splitViewURL,
  setSplitViewURL,
}: SplitViewOptionsProps) {
  const { theme } = useContext(ThemeContext);
  const tabBarInsets = useTabBarInsets();

  const navigation = useURLNavigation();
  const { clearFuture, setVerticalBarItems } = useContext(StackFutureContext);
  // On the iPhone Duo the buttons sit in the vertical bar instead of over the post
  const inVerticalBar = !!useVerticalBarEdgeIOS();

  useEffect(() => {
    // Opening a post is a step forward, so the old forward history no longer applies
    clearFuture();
    setVerticalBarItems(
      inVerticalBar
        ? [
            {
              type: "button",
              label: "Close",
              icon: { type: "sfSymbol", name: "xmark" },
              onPress: () => setSplitViewURL(null),
            },
            {
              type: "button",
              label: "Fullscreen",
              icon: {
                type: "sfSymbol",
                name: "arrow.up.left.and.arrow.down.right",
              },
              onPress: () => navigation.pushURL(splitViewURL),
            },
          ]
        : null,
    );
    return () => setVerticalBarItems(null);
  }, [splitViewURL, inVerticalBar]);

  return inVerticalBar ? null : (
    <View
      style={[
        styles.splitViewOptionsContainer,
        {
          bottom: tabBarInsets.bottom,
        },
      ]}
    >
      <Touchable
        style={[
          styles.button,
          {
            backgroundColor: theme.buttonBg,
          },
        ]}
        activeOpacity={0.2}
        animationDuration={{ in: 0, out: 150 }}
        onPress={() => setSplitViewURL(null)}
      >
        <AntDesign name="close" size={18} color={theme.buttonText} />
      </Touchable>
      <Touchable
        style={[
          styles.button,
          {
            backgroundColor: theme.buttonBg,
          },
        ]}
        activeOpacity={0.2}
        animationDuration={{ in: 0, out: 150 }}
        onPress={() => navigation.pushURL(splitViewURL)}
      >
        <AntDesign name="fullscreen" size={18} color={theme.buttonText} />
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  splitViewOptionsContainer: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: 10,
    height: 40,
    width: 40,
    borderRadius: 100,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
