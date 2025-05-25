import { MaterialIcons } from "@expo/vector-icons";
import { StackActions } from "@react-navigation/native";
import { useContext } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../../utils/navigation";
import { USING_CUSTOM_HYDRA_SERVER } from "../../constants/HydraServer";

type GetHydraProButtonProps = {
  onPress?: () => void;
};

export default function GetHydraProButton({ onPress }: GetHydraProButtonProps) {
  const { theme } = useContext(ThemeContext);
  const { dispatch } = useURLNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        if (USING_CUSTOM_HYDRA_SERVER) {
          Alert.alert(
            "You cannot subscribe to Hydra Pro while using a custom server.",
          );
          return;
        }
        dispatch(
          StackActions.push("SettingsPage", {
            url: "hydra://settings/hydraPro",
          }),
        );
        onPress?.();
      }}
      activeOpacity={0.5}
      style={t(styles.buyProButton, {
        backgroundColor: theme.buttonBg,
      })}
    >
      <View style={styles.buyProButtonSubContainer}>
        <View style={styles.buyProButtonIcon}>
          <Image
            source={require("./../../assets/images/icon.png")}
            style={styles.buyProButtonIconImage}
          />
        </View>
        <Text
          style={t(styles.buyProButtonText, {
            color: theme.buttonText,
          })}
        >
          Hydra Pro
        </Text>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={30}
          color={theme.buttonText}
          style={styles.buyProButtonIcon}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buyProButton: {
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 15,
  },
  buyProButtonSubContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buyProButtonText: {
    fontSize: 20,
    marginLeft: 10,
  },
  buyProButtonIcon: {
    marginVertical: -100,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buyProButtonIconImage: {
    width: 30,
    height: 30,
    borderRadius: 5,
  },
});
