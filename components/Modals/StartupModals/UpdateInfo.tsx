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
  updateKey: "v3.3.0-1",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Full iPad Support",
      description:
        "Opening posts on iPad now opens a split view with comments on the side. You can disable this in Settings => Appearance => Enable split view. Compact post mode is now enabled by default on iPads.",
    },
    {
      title: "In App Guide",
      description:
        "Hydra now has a searchable library of help articles that cover all of Hydra's features and settings. Go to Settings => Guide to access it, or use the new smart search bar at the top of the settings page.",
    },
    {
      title: "New App Icons",
      description:
        '"Hail Hydra!" and "Hail Hydra! (Dark)" are now available under Settings => App Icon. Thank you u/boxsitter!',
    },
    {
      title: "Download More Videos",
      description:
        'Videos can now be downloaded from redgif, imgur, and gfycat. Long press a video to open the share menu and select "Save Video".',
    },

    {
      title: "Disable Tap to Collapse",
      description:
        "You can now disable the tap to collapse for both the post body and the comments section in Settings => Appearance => Tap to collapse.",
    },
    {
      title: "Reader Mode for Links",
      description:
        "You can now open external links in reader mode by default in Settings => General => External Links => Open in reader mode.",
    },
    {
      title: "Improved Quick Search",
      description:
        "The subreddit quick search (long press the search tab) shows your subscribed subreddits (favorites first) when you haven't typed anything yet.",
    },
    {
      title: "Auto Open Keyboard",
      description:
        "When opening the search tab, making a comment, or making a post, the keyboard will now automatically open for a smoother experience.",
    },
    {
      title: "Video Player Improvements",
      description:
        "Videos dismount when Hydra is backgrounded to reduce memory usage and battery drain. Videos are now cached to improve performance. Clear the video cache in Settings => Advanced => Clear Video Cache.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "Modals and media views no longer break on iPads when using split screen, windowing, or rotating the device.",
    },
    {
      description: "EU users were unable to type their login credentials.",
    },
    {
      description:
        "Uploading images when making a post would fail for certain types of images.",
    },
    {
      description:
        "Searching for subreddits that were less than 3 characters would fail.",
    },
    {
      description: "Subreddit name was not showing when searching for posts.",
    },
    {
      description:
        "old.reddit.com links open in Hydra instead of opening in a browser.",
    },
    {
      description: "The image share menu now shows a thumbnail of the image.",
    },
    {
      description: "Fixed some minor memory leaks.",
    },
    {
      description:
        "Fixed a database query memory leak and optimized query performance.",
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
