import { Feather } from "@expo/vector-icons";
import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import Themes from "../../constants/Themes";
import { ThemeContext, t } from "../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";

const isValidColor = (color: any) => {
  return (
    typeof color === "string" &&
    color.startsWith("#") &&
    RegExp(/^#([0-9A-F]{3})|([0-9A-F]{6})|([0-9A-F]{8})$/i).test(color)
  );
};

export default function Theme() {
  const { theme, currentTheme, setCurrentTheme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  return (
    <>
      {Object.entries(Themes).map(([key, curTheme]) => (
        <TouchableOpacity
          key={key}
          onPress={() => setCurrentTheme(key as keyof typeof Themes)}
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
