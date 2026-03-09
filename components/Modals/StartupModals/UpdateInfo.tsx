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
  updateKey: "v3.4.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Disable Swipe Gestures",
      description:
        "A new \"Disabled\" option is available for post and comment swipe gestures. Configure this in Settings => General => Gestures.",
    },
    {
      title: "GIF Improvements",
      description:
        "Reddit hosted gifs now load as mp4s for much better performance. Giphy links in posts and comments now render as actual gifs instead of just showing the link text.",
    },
    {
      title: "Improved Wikis",
      description:
        "Wikis have a much better look and feel. Reddit's new style of Wiki loads properly. Short wiki links (/r/subreddit/w/page) are now supported.",
    },
    {
      title: "Temporary Subreddit Filters",
      description:
        "You can now filter a subreddit's posts for a short while. Long press a post on a combined subreddit feed, click \"Filter Subreddit\", then choose to filter for a day, a week, or forever.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description: "Fixed image posts momentarily showing the wrong image when scrolling quickly or on a slow internet connection."
    },
    {
      description: "Disabled autocorrect when searching.",
    },
    {
      description:
        "Voting on a post while viewing a comments page, then collapsing a comment would cause your vote to disappear.",
    },
    {
      description:
        "Gated and quarantined subreddits are now handled properly and are accessible.",
    },
    {
      description: "Wiki shortlinks (/r/subreddit/w/page) now load properly.",
    },
    {
      description:
        "Banned users and non-existent user profiles now show an error message instead of loading forever.",
    },
    {
      description: "Giphy gifs were loading very slowly.",
    },
    {
      description:
        "Marking posts as read would sometimes fail to update visually.",
    },
    {
      description:
        "User subreddit links (/r/u_username) would fail to load.",
    },
    {
      description:
        "Subreddit icon images now use caching to improve performance.",
    },
    {
      description:
        "Post and comment edit modals now say \"Save\" instead of \"Edit\" for the submit button.",
    },
    {
      description: "DB optimization improvements."
    }
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
    lineHeight: 17.9,
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
