import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useURLNavigation } from "../../utils/navigation";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useSetTheme } from "../../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView/hooks/useSetTheme";
import ThemeList from "../../components/UI/ThemeList";

export default function Theme() {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { pushURL } = useURLNavigation();
  const setTheme = useSetTheme();

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.text }]}>
          Themes
        </Text>
        <TouchableOpacity
          onPress={() => pushURL("hydra://settings/themeMaker")}
        >
          <Feather
            name="plus"
            size={24}
            color={theme.iconOrTextButton}
          />
        </TouchableOpacity>
      </View>

      <ThemeList
        currentThemeKey={currentTheme}
        onSelect={(key, _themeData, isCustom) =>
          setTheme(key, isCustom)
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
