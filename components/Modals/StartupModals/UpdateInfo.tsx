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

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "2.10.0-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [
    {
      title: "Stats Tracking",
      description:
        "Private on device analytics to track your usage and explore your data. You can view your stats in Settings => Stats.",
    },
  ] as { title: string; description: string }[],
  features: [
    {
      title: "View Post Flairs",
      description:
        "If a post has a flair, you'll now see it as a tag at the end of the post title. You can disable this in Settings => Appearance => Post Appearance Settings => Show Post Flairs.",
    },
    {
      title: "Make Posts with Flairs",
      description:
        "If a subreddit has flairs, you'll now see a \"Select Flair\" button on the post creation screen. This should fix most of the errors you've been getting preventing post creation.",
    },
    {
      title: "Better Post Failure Messages",
      description:
        "If a post can't be submitted, you'll get a better message like \"Text body must be at least x length\" instead of a generic error message.",
    },
    {
      title: "Live Text on Images",
      description:
        "You can now extract text from images using Live Text. You can enable this in Settings => Appearance => Post Appearance Settings => Live Text.",
    },
    {
      title: "Press Tab to Go Back",
      description:
        "Tapping the current tab will take you back a page. Easier than reaching the left corner back button.",
    },
    {
      title: "Smoother Scrolling",
      description:
        "The underlying infinite scroll library has been updated. Deeply scrolling should be more responsive now.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "Fixed a bunch of video player issues, particularly involving sound.",
    },
    {
      description:
        'Fixed videos continuing to play after exiting fullscreen if "Auto play videos" is disabled.',
    },
    {
      description:
        "Lots of small tweaks in an attempt to fix some obscure crashes.",
    },
  ] as { description: string }[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);

  const exitUpdateInfo = () => {
    KeyStore.set(LAST_SEEN_UPDATE_KEY, updateInfo.updateKey);
    onExit();
  };

  return (
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
            {updateInfo.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.subtleText,
              },
            ]}
          >
            {updateInfo.subtitle}
          </Text>
          <ScrollView>
            <View style={{ marginTop: -20 }} />
            {updateInfo.proFeatures.length > 0 && (
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
                  {updateInfo.proFeatures.map((feature) => (
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
              {updateInfo.features.map((feature) => (
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
              {updateInfo.bugfixes.map((bugfix) => (
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
                  source={require("../../../assets/images/subredditIcon.png")}
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
                If you have any familiarity with React Native and want to help,
                you can make a pull request at https://github.com/dmilin1/hydra
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
