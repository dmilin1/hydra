import React, { useContext } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { useURLNavigation } from "../../utils/navigation";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useSetTheme } from "../../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView/hooks/useSetTheme";
import ThemeList from "../../components/UI/Themes/ThemeList";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";

export default function Theme() {
  const { theme, currentTheme } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();
  const setTheme = useSetTheme();

  return (
    <>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.text }]}>Themes</Text>
        <TouchableOpacity
          onPress={() => {
            if (!isPro) {
              Alert.alert(
                "Hydra Pro Feature",
                "This feature is only available to Hydra Pro subscribers. You can make and save custom themes, but will only be able to use them for 5 minutes.",
                [
                  {
                    text: "Get Hydra Pro",
                    isPreferred: true,
                    onPress: () => {
                      pushURL("hydra://settings/hydraPro");
                    },
                  },
                  {
                    text: "Just try it out",
                    style: "cancel",
                  },
                ],
              );
            }
            pushURL("hydra://settings/themeMaker");
          }}
          hitSlop={50}
          style={[styles.plusContainer, { backgroundColor: theme.buttonBg }]}
        >
          <Text style={[styles.plusText, { color: theme.buttonText }]}>
            Custom Theme +
          </Text>
        </TouchableOpacity>
      </View>

      <ThemeList
        currentTheme={currentTheme}
        onSelect={(key) => setTheme(key)}
      />

      <TouchableOpacity
        style={[styles.exploreContainer, { backgroundColor: theme.buttonBg }]}
        onPress={() => {
          pushURL("https://www.reddit.com/r/hydraThemes");
        }}
        activeOpacity={0.8}
      >
        <Text style={[styles.exploreText, { color: theme.buttonText }]}>
          Explore Community Themes
        </Text>
      </TouchableOpacity>
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
  plusContainer: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    fontSize: 12,
  },
  exploreContainer: {
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  exploreText: {
    fontSize: 18,
  },
});
