import { StyleSheet, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useContext } from "react";
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

  return (
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
