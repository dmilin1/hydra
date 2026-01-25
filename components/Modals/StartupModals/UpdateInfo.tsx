import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v3.2.0-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Gallery Mode",
      description:
        'A new mode for viewing media heavy subreddits 😉. Open it on any subreddit by tapping the "..." menu button in the top right corner and selecting "Open In Gallery Mode". Power users can get Hydra Pro to scroll more than 100 media items deep.',
    },
    {
      title: "Open Comment Flairs",
      description: "Tap on a truncated comment flair to see the full flair.",
    },
    {
      title: "Collapsed Comment Memory",
      description:
        "Child comments will remember if they're collapsed after collapsing and expanding their parent.",
    },
    {
      title: "Swipe to Collapse Thread",
      description:
        "New swipe gesture can be set in Settings => General => Gestures. This gesture collapses the entire thread instead of just the comment you're currently viewing.",
    },
    {
      title: "More Comment Long Press Options",
      description:
        "Long pressing a comment now has 3 additional options: expand, collapse, and collapse thread.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "When logging in, some users login sessions were failing to be captured and were instead redirected to the Reddit home page.",
    },
    {
      description: "Login popup would sometimes say you are already logged in.",
    },
    {
      description:
        "Posts with links to external websites that returned an out of bounds HTTP status code would cause Hydra to crash.",
    },
    {
      description:
        "Posts with links to external websites that are slow to respond will no longer make your feed load slower.",
    },
    {
      description:
        "Posts sometimes failed to be marked as read when interacting with them.",
    },
    {
      description:
        "When trying to favorite a subreddit while not subscribed to it, an error message is now shown instead of failing silently.",
    },
    {
      description:
        "Filtering a subreddit from your feed no longer prevents the subreddit from loading when you navigate directly to it.",
    },
    {
      description:
        "Slide gestures were failing to work when swipe anywhere to navigate was disabled.",
    },
  ] as { description: string }[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);

  const { width, height } = useWindowDimensions();

  const exitUpdateInfo = () => {
    KeyStore.set(LAST_SEEN_UPDATE_KEY, updateInfo.updateKey);
    onExit();
  };

  return (
    <>
      <View
        style={[
          styles.updateInfoContainer,
          {
            marginTop: height * 0.175,
            maxHeight: height * 0.65,
            maxWidth: width - 40,
          },
        ]}
      >
        <View
          style={[
            styles.updateInfoSubContainer,
            {
              backgroundColor: theme.tint,
              borderColor: theme.divider,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.exitButton,
              {
                backgroundColor: theme.divider,
              },
            ]}
            onPress={() => exitUpdateInfo()}
          >
            <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
          </TouchableOpacity>
          <View style={styles.versionBadge}>
            <Text
              style={[
                styles.versionBadgeText,
                { color: theme.iconPrimary, opacity: 1 },
              ]}
            >
              {updateInfo.updateKey}
            </Text>
            <View
              style={[
                styles.versionBadgeBackground,
                { backgroundColor: theme.iconPrimary },
              ]}
            />
          </View>
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
                    <View
                      key={feature.title}
                      style={[
                        styles.featureContainer,
                        {
                          backgroundColor: theme.divider,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.featureTitle,
                          {
                            color: theme.text,
                          },
                        ]}
                      >
                        {feature.title}
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
                <View
                  key={feature.title}
                  style={[
                    styles.featureContainer,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.divider,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.featureTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {feature.title}
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
              <View
                style={[
                  styles.featureContainer,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.divider,
                    gap: 12,
                  },
                ]}
              >
                {updateInfo.bugfixes.map((bugfix) => (
                  <Text
                    key={bugfix.description}
                    style={[
                      styles.bugfixDescription,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    - {bugfix.description}
                  </Text>
                ))}
              </View>
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
                /r/HydraFeatureRequest which can be found in the settings tab
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
        style={[styles.background, { width, height }]}
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
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "black",
    opacity: 0.75,
    zIndex: 1,
  },
  updateInfoSubContainer: {
    borderRadius: 16,
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
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 8,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  versionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  versionBadgeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
    borderRadius: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
  },
  heading: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: 500,
    marginTop: 25,
    marginBottom: 10,
    marginLeft: -8,
  },
  featureContainer: {
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 500,
  },
  featureDescription: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 18,
  },
  bugfixDescription: {
    fontSize: 14,
    lineHeight: 18,
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
    gap: 15,
  },
});
