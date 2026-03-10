import { StyleSheet, TouchableOpacity, View } from "react-native";
import { getEffectiveTabBarRemovedPaddingBottom } from "../../constants/TabBarPadding";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useContext } from "react";
import { useURLNavigation } from "../../utils/navigation";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SplitViewOptionsProps = {
  splitViewURL: string;
  setSplitViewURL: (url: string | null) => void;
};

export default function SplitViewOptions({
  splitViewURL,
  setSplitViewURL,
}: SplitViewOptionsProps) {
  const { theme } = useContext(ThemeContext);
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const removedPaddingBottom = getEffectiveTabBarRemovedPaddingBottom(bottom);

  const navigation = useURLNavigation();

  return (
    <View
      style={[
        styles.splitViewOptionsContainer,
        {
          bottom: tabBarHeight - removedPaddingBottom,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.buttonBg,
          },
        ]}
        onPress={() => setSplitViewURL(null)}
      >
        <AntDesign name="close" size={18} color={theme.buttonText} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: theme.buttonBg,
          },
        ]}
        onPress={() => navigation.pushURL(splitViewURL)}
      >
        <AntDesign name="fullscreen" size={18} color={theme.buttonText} />
      </TouchableOpacity>
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
