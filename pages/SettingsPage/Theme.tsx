import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";

import Themes from "../../constants/Themes";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";
import { useURLNavigation } from "../../utils/navigation";

const isValidColor = (color: any) => {
  return (
    typeof color === "string" &&
    color.startsWith("#") &&
    RegExp(/^#([0-9A-F]{3})|([0-9A-F]{6})|([0-9A-F]{8})$/i).test(color)
  );
};

export default function Theme() {
  const { theme, currentTheme, setCurrentTheme, cantUseTheme } =
    useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);
  const { pushURL } = useURLNavigation();

  const setTheme = (theme: keyof typeof Themes) => {
    setCurrentTheme(theme);
    if (cantUseTheme(theme)) {
      Alert.alert(
        "Hydra Pro Theme",
        "You can use this theme for 5 minutes to try it out. Upgrade to Hydra Pro to keep using it.",
        [
          {
            text: "Get Hydra Pro",
            isPreferred: true,
            onPress: () => {
              pushURL("hydra://settings/hydraPro");
            },
          },
          {
            text: "Maybe Later",
            style: "cancel",
          },
        ],
      );
    }
  };

  return (
    <>
      {Object.entries(Themes).map(([key, curTheme]) => (
        <TouchableOpacity
          key={key}
          onPress={() => setTheme(key as keyof typeof Themes)}
          style={t(styles.themeItemContainer, {
            borderBottomColor: theme.divider,
          })}
        >
          <Text
            style={t(styles.themeNameText, {
              color: theme.text,
            })}
          >
            {curTheme.name}
          </Text>
          <View
            style={t(styles.colorsContainer, {
              borderColor: theme.divider,
            })}
          >
            {Object.entries(curTheme)
              .filter(([_, val]) => isValidColor(val))
              .map(([key, color]: [string, any]) => (
                <View
                  key={key}
                  style={{
                    backgroundColor: color,
                    flex: 1,
                    height: 20,
                  }}
                />
              ))}
          </View>
          <View style={styles.checkboxContainer}>
            {currentTheme === key ? (
              <Feather name="check" size={24} color={theme.iconOrTextButton} />
            ) : curTheme.isPro && !isPro ? (
              <Feather name="lock" size={24} color={theme.iconOrTextButton} />
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  themeItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  themeNameText: {
    width: 100,
    fontSize: 18,
    marginRight: 15,
  },
  colorsContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
  },
  checkboxContainer: {
    width: 30,
    height: 24,
    marginLeft: 25,
    alignItems: "flex-end",
  },
});
