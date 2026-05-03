import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import { TextWithRepairedHeight } from "../../Other/TextWithRepairedHeight";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v4.0.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Media Viewer Rewrite",
      description:
        "The media viewer has been rebuilt from scratch offering new features and better performance. This represents a significant step towards preparing Hydra for release on Android. Many of the features listed below are a result of the rewrite.",
    },
    {
      title: "Hydra in Share Sheet",
      description:
        "Hydra now appears as an option when you share a URL from another app.",
    },
    {
      title: "Right Side Thumbnails in Compact Mode",
      description:
        "Moves post thumbnail previews from the left to the right side when in compact mode. Enable this in Settings => Appearance => Post Appearance Settings => Show Thumbnails on Right. This setting will only show up if you have compact mode enabled.",
    },
    {
      title: "Collapse Child Comments Only",
      description:
        "Tapping a comment now collapses its children instead of the comment itself. This setting can be enabled in Settings => Appearance => Comment Appearance Settings => Collapse Children Only.",
    },
    {
      title: "Filter Subreddits Temporarily",
      description:
        'When on a mixed feed such as Home or Popular, long press a post and press "Filter Subreddit". You\'ll now have an option to filter for a day, a week, or forever.',
    },
    {
      title: "Support for New Wikis",
      description:
        "Hydra previously only supported old.reddit.com wikis. New wikis are now supported and used by default.",
    },
    {
      title: "Swipe to Scrub Videos",
      description:
        "When a video is full screen, you can swipe horizontally to scrub through it.",
    },
    {
      title: "Change Video Playback Rate",
      description:
        "When a video is full screen, you can tap the playback rate button in the top left corner to change the playback rate.",
    },
    {
      title: "Landscape Mode",
      description:
        "Rotate your device when in the media viewer or the in app browser to view content in landscape.",
    },
    {
      title: "Media Collection Navigation Arrows",
      description:
        "When viewing a collection of images or videos, arrows appear to allow easier swiping between items.",
    },
    {
      title: "Post Info in Media Viewer",
      description:
        "Post info is overlayed when tapping on content in the media viewer. Tap the title, subreddit, or author to quickly navigate to the relevant page.",
    },
    {
      title: "Swipe to Dismiss Media",
      description:
        "The media viewer can be dismissed by swiping up or down. Previously, you could only swipe one way.",
    },
    {
      title: "Media Viewer Optimizations",
      description:
        "Hydra is much smarter about picking the best image resolution to load, caching behavior has been improved, and background videos pause while a different video is in the foreground, granting faster load times and reduced memory usage.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description:
        "Music no longer randomly pauses while scrolling. I think I fixed this, but I haven't been able to consistently reproduce the bug, so if you experience this, a bug report would be appreciated.",
    },
    {
      description:
        "Posts with a collection of videos only displayed the first video.",
    },
    {
      description:
        "Scrubbing while in gallery mode locks vertical scrolling for a smoother experience.",
    },
    {
      description:
        "Links that are slow to respond to requests for metadata are skipped, resulting in much faster loads in the worst cases.",
    },
    {
      description:
        "Android builds successfully. An official app is coming soon.",
    },
    {
      description: "Fixed image posts momentarily showing the wrong image.",
    },
    {
      description:
        "Some link sources like Wikipedia would fail to show an image.",
    },
    {
      description: "Fixed shadowbanned users being unable to log in.",
    },
    {
      description:
        "Text URLs containing backslashes that weren't marked as links in markdown were parsed incorrectly.",
    },
    {
      description:
        "Posts linking to other Reddit pages (e.g. /r/wowthissubexists) weren't rendering as links.",
    },
    {
      description:
        'Having a multireddit named "All" would cause the "All" button to disappear in the subreddit list.',
    },
    {
      description:
        "Hydra warns you when attempting to reply in a locked or archived post.",
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
            <TextWithRepairedHeight
              style={[
                styles.versionBadgeText,
                { color: theme.iconPrimary, opacity: 1 },
              ]}
            >
              {updateInfo.updateKey}
            </TextWithRepairedHeight>
            <View
              style={[
                styles.versionBadgeBackground,
                { backgroundColor: theme.iconPrimary },
              ]}
            />
          </View>
          <TextWithRepairedHeight
            style={[
              styles.title,
              {
                color: theme.text,
              },
            ]}
          >
            {updateInfo.title}
          </TextWithRepairedHeight>
          <TextWithRepairedHeight
            style={[
              styles.subtitle,
              {
                color: theme.subtleText,
              },
            ]}
          >
            {updateInfo.subtitle}
          </TextWithRepairedHeight>
          <ScrollView>
            <View style={{ marginTop: -20 }} />
            {updateInfo.proFeatures.length > 0 && (
              <>
                <TextWithRepairedHeight
                  style={[
                    styles.heading,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  👑 Pro Features
                </TextWithRepairedHeight>
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
                      <TextWithRepairedHeight
                        style={[
                          styles.featureTitle,
                          {
                            color: theme.text,
                          },
                        ]}
                      >
                        {feature.title}
                      </TextWithRepairedHeight>
                      <TextWithRepairedHeight
                        style={[
                          styles.featureDescription,
                          {
                            color: theme.subtleText,
                          },
                        ]}
                      >
                        {feature.description}
                      </TextWithRepairedHeight>
                    </View>
                  ))}
                </View>
              </>
            )}
            <TextWithRepairedHeight
              style={[
                styles.heading,
                {
                  color: theme.text,
                },
              ]}
            >
              🚀 Features
            </TextWithRepairedHeight>
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
                  <TextWithRepairedHeight
                    style={[
                      styles.featureTitle,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {feature.title}
                  </TextWithRepairedHeight>
                  <TextWithRepairedHeight
                    style={[
                      styles.featureDescription,
                      {
                        color: theme.subtleText,
                      },
                    ]}
                  >
                    {feature.description}
                  </TextWithRepairedHeight>
                </View>
              ))}
            </View>
            <TextWithRepairedHeight
              style={[
                styles.heading,
                {
                  color: theme.text,
                },
              ]}
            >
              🐛 Bugfixes
            </TextWithRepairedHeight>
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
                  <TextWithRepairedHeight
                    key={bugfix.description}
                    style={[
                      styles.bugfixDescription,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    - {bugfix.description}
                  </TextWithRepairedHeight>
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
              <TextWithRepairedHeight
                style={[
                  styles.helpItem,
                  {
                    color: theme.text,
                  },
                ]}
              >
                If you have any feature requests, you can submit them on
                /r/HydraFeatureRequest which can be found in the settings tab
              </TextWithRepairedHeight>
            </View>
            <View style={styles.helpContainer}>
              <View style={styles.helpIcon}>
                <FontAwesome name="github" size={22} color={theme.text} />
              </View>
              <TextWithRepairedHeight
                style={[
                  styles.helpItem,
                  {
                    color: theme.text,
                  },
                ]}
              >
                If you have any familiarity with React Native and want to help,
                you can make a pull request at https://github.com/dmilin1/hydra
              </TextWithRepairedHeight>
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
