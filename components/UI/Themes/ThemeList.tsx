import React, { useContext } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import Slideable from "../Slideable";
import ThemeRow from "./ThemeRow";
import Themes, {
  CustomTheme,
  DEFAULT_THEME,
  Theme,
} from "../../../constants/Themes";
import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import {
  deleteCustomTheme,
  getCustomThemes,
} from "../../../db/functions/CustomThemes";

type ThemeListProps = {
  currentTheme: string;
} & (
  | {
      onSelect: (key: string, theme: CustomTheme) => void;
      showCustomOnly: true;
    }
  | {
      onSelect: (key: string, theme: Theme | CustomTheme) => void;
      showCustomOnly?: false;
    }
);

export default function ThemeList({
  currentTheme,
  onSelect,
  showCustomOnly,
}: ThemeListProps) {
  const { theme, setCurrentTheme } = useContext(ThemeContext);

  const customThemes = getCustomThemes();

  const handleDelete = (customTheme: CustomTheme) => {
    Alert.alert(
      "Delete Theme",
      `Are you sure you want to delete "${customTheme.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCustomTheme(customTheme);
            setCurrentTheme(
              currentTheme === customTheme.name
                ? DEFAULT_THEME.key
                : currentTheme,
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.themeListContainer}>
      {!showCustomOnly && (
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Built-in Themes
          </Text>
          {Object.entries(Themes).map(([key, themeData]) => (
            <ThemeRow
              key={key}
              theme={themeData}
              isSelected={currentTheme === key}
              onPress={() => onSelect(key, themeData)}
            />
          ))}
        </View>
      )}
      {customThemes.length > 0 && (
        <View>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Custom Themes
          </Text>
          {customThemes.map((customTheme) => (
            <Slideable
              key={customTheme.name}
              right={[
                {
                  icon: <Feather name="trash-2" size={24} color={theme.text} />,
                  color: theme.downvote,
                  action: () => handleDelete(customTheme),
                },
              ]}
            >
              <ThemeRow
                theme={customTheme}
                isSelected={currentTheme === customTheme.name}
                onPress={() => onSelect(customTheme.name, customTheme)}
              />
            </Slideable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  themeListContainer: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
});
