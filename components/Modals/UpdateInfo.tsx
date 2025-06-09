import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useMMKVString } from "react-native-mmkv";

import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../UI/GetHydraProButton";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

const update = {
  updateKey: "2.7.2-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Automatic Theme Switching",
      description:
        "You can now set a different theme for the system light and dark mode. To do this, go to Settings => Theme => Different Dark Mode Theme and select the theme you want to use at night.",
    },
    {
      title: "Hide Seen Posts per Subreddit",
      description:
        'You can now hide/show posts only on specific subreddits or feed pages (Home, Top, All, etc). To do this, tap the ... in the top right corner of the subreddit page and pick "Show/Hide Seen Posts". This will override the global setting you have set in Settings => General => Filters => Hide Seen Posts.',
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description: "Fixed push notifications not registering properly.",
    },
    {
      description:
        "Fixed quarantied subreddits not loading. You'll now see a prompt the first time you try to access a quarantined subreddit asking for confirmation.",
    },
    {
      description:
        "Fixed full screen images sometimes being pushed into the corner of the screen.",
    },
    {
      description:
        "Fixed the image counter pill showing the incorrect slide number when using compact mode.",
    },
    {
      description: "Fixed flairs for subreddits using non richtext flairs.",
    },
    {
      description:
        "Fixed the long press menu being overly sensitive when looking at an image in fullscreen.",
    },
    {
      description:
        "Fixed recycled posts temporarily showing the wrong image when scrolling quickly.",
    },
    {
      description: "Fixed links occasionally showing the wrong image.",
    },
  ] as { description: string }[],
};

export default function UpdateInfo() {
  const { theme } = useContext(ThemeContext);

  const [lastSeenUpdate, setLastSeenUpdate] =
    useMMKVString(LAST_SEEN_UPDATE_KEY);

  const exitUpdateInfo = () => {
    setLastSeenUpdate(update.updateKey);
  };

  return (
    lastSeenUpdate !== update.updateKey && (
      <>
        <View style={styles.updateInfoContainer}>
          <View
            style={[
              styles.updateInfoSubContainer,
              {
                backgroundColor: theme.tint,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.exitButton,
                {
                  backgroundColor: theme.verySubtleText,
                },
              ]}
              onPress={() => exitUpdateInfo()}
            >
              <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
            </TouchableOpacity>
            <Text
              style={[
                styles.title,
                {
                  color: theme.text,
                },
              ]}
            >
              {update.title}
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.subtleText,
                },
              ]}
            >
              {update.subtitle}
            </Text>
            <ScrollView>
              <View style={{ marginTop: -20 }} />
              {update.proFeatures.length > 0 && (
                <>
                  <Text
                    style={[
                      styles.heading,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    👑 Pro Features
                  </Text>
                  <View style={styles.listContainer}>
                    {update.proFeatures.map((feature) => (
                      <View key={feature.title}>
                        <Text
                          style={[
                            styles.featureTitle,
                            {
                              color: theme.text,
                            },
                          ]}
                        >
                          • {feature.title}
                        </Text>
                        <Text
                          style={[
                            styles.featureDescription,
                            {
                              color: theme.subtleText,
                            },
                          ]}
                        >
                          {feature.description}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
              <Text
                style={[
                  styles.heading,
                  {
                    color: theme.text,
                  },
                ]}
              >
                🚀 Features
              </Text>
              <View style={styles.listContainer}>
                {update.features.map((feature) => (
                  <View key={feature.title}>
                    <Text
                      style={[
                        styles.featureTitle,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      • {feature.title}
                    </Text>
                    <Text
                      style={[
                        styles.featureDescription,
                        {
                          color: theme.subtleText,
                        },
                      ]}
                    >
                      {feature.description}
                    </Text>
                  </View>
                ))}
              </View>
              <Text
                style={[
                  styles.heading,
                  {
                    color: theme.text,
                  },
                ]}
              >
                🐛 Bugfixes
              </Text>
              <View style={styles.listContainer}>
                {update.bugfixes.map((bugfix) => (
                  <View key={bugfix.description}>
                    <Text
                      style={[
                        styles.bugfixDescription,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      • {bugfix.description}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.helpContainer}>
                <View style={styles.helpIcon}>
                  <Image
                    source={require("../../assets/images/subredditIcon.png")}
                    style={{ width: 30, height: 30 }}
                  />
                </View>
                <Text
                  style={[
                    styles.helpItem,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  If you have any feature requests, you can submit them on
                  /r/HydraFeatureRequests which can be found in the settings tab
                </Text>
              </View>
              <View style={styles.helpContainer}>
                <View style={styles.helpIcon}>
                  <FontAwesome name="github" size={22} color={theme.text} />
                </View>
                <Text
                  style={[
                    styles.helpItem,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  If you have any familiarity with React Native and want to
                  help, you can make a pull request at
                  https://github.com/dmilin1/hydra
                </Text>
              </View>
              <GetHydraProButton onPress={() => exitUpdateInfo()} />
            </ScrollView>
          </View>
        </View>
        <TouchableOpacity
          style={styles.background}
          onPress={() => exitUpdateInfo()}
        />
      </>
    )
  );
}

const styles = StyleSheet.create({
  updateInfoContainer: {
    position: "absolute",
    top: 0,
    zIndex: 2,
    marginTop: Dimensions.get("window").height * 0.175,
    flex: 1,
    justifyContent: "center",
    maxHeight: Dimensions.get("window").height * 0.65,
    maxWidth: Dimensions.get("window").width - 40,
    alignSelf: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    backgroundColor: "black",
    opacity: 0.7,
    zIndex: 1,
  },
  updateInfoSubContainer: {
    borderRadius: 10,
    borderWidth: 1,
  },
  exitButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: "absolute",
    top: 10,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  heading: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 25,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  featureDescription: {
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 32,
  },
  bugfixDescription: {
    fontSize: 14,
    marginHorizontal: 20,
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  helpIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  helpItem: {
    marginTop: 5,
    fontSize: 14,
    marginHorizontal: 20,
  },
  listContainer: {
    gap: 20,
  },
});
