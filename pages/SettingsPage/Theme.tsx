import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  Appearance,
} from "react-native";
import { useURLNavigation } from "../../utils/navigation";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { useSetTheme } from "../../components/RedditDataRepresentations/Post/PostParts/PostMediaParts/ImageView/hooks/useSetTheme";
import ThemeList from "../../components/UI/Themes/ThemeList";
import { SubscriptionsContext } from "../../contexts/SubscriptionsContext";
import List from "../../components/UI/List";
import { FontAwesome } from "@expo/vector-icons";

export default function Theme() {
  const {
    theme,
    lightTheme,
    darkTheme,
    currentTheme,
    useDifferentDarkTheme,
    setUseDifferentDarkTheme,
  } = useContext(ThemeContext);
  const { isPro } = useContext(SubscriptionsContext);

  const { pushURL } = useURLNavigation();
  const setTheme = useSetTheme();

  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    Appearance.getColorScheme() ?? "light",
  );

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
          hitSlop={20}
          style={[styles.plusContainer, { backgroundColor: theme.buttonBg }]}
        >
          <Text style={[styles.plusText, { color: theme.buttonText }]}>
            Custom Theme +
          </Text>
        </TouchableOpacity>
      </View>

      <List
        items={[
          {
            key: "postCompactMode",
            icon: <FontAwesome name="moon-o" size={24} color={theme.text} />,
            rightIcon: (
              <Switch
                trackColor={{
                  false: theme.iconSecondary,
                  true: theme.iconPrimary,
                }}
                value={useDifferentDarkTheme}
                onValueChange={() => {
                  setUseDifferentDarkTheme(!useDifferentDarkTheme);
                }}
              />
            ),
            text: "Different Dark Mode Theme",
            onPress: () => {
              setUseDifferentDarkTheme(!useDifferentDarkTheme);
            },
          },
        ]}
        containerStyle={{ marginBottom: 15 }}
      />

      {useDifferentDarkTheme && (
        <View style={styles.timeModeContainer}>
          {[
            {
              key: "light",
              text: "Light",
              onPress: () => setColorScheme("light"),
            },
            {
              key: "dark",
              text: "Dark",
              onPress: () => setColorScheme("dark"),
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={item.onPress}
              style={[
                styles.timeModeButton,
                colorScheme === item.key && {
                  borderColor: theme.iconOrTextButton,
                },
              ]}
            >
              <Text style={[styles.timeModeText, { color: theme.subtleText }]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ThemeList
        currentTheme={
          useDifferentDarkTheme
            ? colorScheme === "light"
              ? lightTheme
              : darkTheme
            : currentTheme
        }
        onSelect={(key) =>
          setTheme(key, useDifferentDarkTheme ? colorScheme : undefined)
        }
      />

      <TouchableOpacity
        style={[styles.exploreContainer, { backgroundColor: theme.buttonBg }]}
        onPress={() => {
          pushURL("https://www.reddit.com/r/HydraThemes");
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
  timeModeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: 15,
    gap: 10,
  },
  timeModeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  timeModeText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
