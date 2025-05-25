import React, { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, Alert, View } from "react-native";

import {
  ThemeContext,
  t,
} from "../../../contexts/SettingsContexts/ThemeContext";
import { SubscriptionsContext } from "../../../contexts/SubscriptionsContext";
import Themes, { CustomTheme } from "../../../constants/Themes";
import { useSetTheme } from "../../RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView/hooks/useSetTheme";
import { saveCustomTheme } from "../../../db/functions/CustomThemes";
import ThemeColorBand from "./ThemeColorBand";

type ThemeImportProps = {
  customTheme: CustomTheme;
};

export default function ThemeImport({ customTheme }: ThemeImportProps) {
  const { theme: currentTheme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const setTheme = useSetTheme();

  if (typeof customTheme.extends !== "string") {
    return (
      <Text
        style={t(styles.themeNameText, {
          color: currentTheme.text,
        })}
      >
        Theme is invalid
      </Text>
    );
  }

  const themeData = {
    ...Themes[customTheme.extends as keyof typeof Themes],
    ...customTheme,
  };

  const saveTheme = () =>
    Alert.alert(
      `Import Theme`,
      `Import "${customTheme.name}" to your custom themes? ${!isPro ? "Non Pro users can try themes out for 5 minutes." : ""}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Import",
          onPress: () => {
            saveCustomTheme(customTheme);
            Alert.alert(`"${customTheme.name}" imported successfully!`);
          },
        },
        {
          text: "Import & Apply",
          onPress: () => {
            saveCustomTheme(customTheme);
            setTheme(customTheme.name);
          },
        },
      ],
    );

  return (
    <View style={styles.themeItemContainer}>
      <TouchableOpacity
        onPress={() => saveTheme()}
        activeOpacity={0.5}
        style={t(styles.themeItemSubContainer, {
          borderColor: currentTheme.divider,
        })}
      >
        <View style={styles.themeNameContainer}>
          <Text
            style={t(styles.themeNameText, {
              color: currentTheme.text,
            })}
          >
            {themeData.name}
          </Text>
          <Text style={{ color: currentTheme.subtleText }}>Hydra Theme</Text>
        </View>
        <View style={styles.themeColorBandContainer}>
          <ThemeColorBand theme={themeData} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  themeItemContainer: {
    paddingVertical: 10,
    width: "100%",
  },
  themeItemSubContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 5,
  },
  themeColorBandContainer: {
    flexDirection: "row",
    maxHeight: 20,
    marginBottom: 5,
  },
  themeNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  themeNameText: {
    fontSize: 18,
    marginRight: 15,
  },
  themeNameDetailText: {
    fontSize: 12,
  },
});
