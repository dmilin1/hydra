import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import { TextWithRepairedHeight } from "../../Other/TextWithRepairedHeight";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v4.1.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "Fast Account Swap",
      description:
        "Long press the accounts tab to quickly switch between accounts.",
    },
    {
      title: "New Multireddit Sort Options",
      description:
        "You can now set a default sort and enable sort remembering for multireddits. Enable this in Settings => General => Post & Comment Sorting => Multireddits.",
    },
    {
      title: "Smoother Gestures",
      description:
        "The gesture system has been fully rewritten. You'll notice this most with slide gestures on posts and comments.",
    },
    {
      title: "Faster Post & Comment Rendering",
      description:
        "Posts should display faster now, particularly for posts with large bodies or large tables.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description: "Hydra would not load any data if you were logged out.",
    },
    {
      description:
        "The video player would restart the video when changing device orientation.",
    },
    {
      description:
        "Scrolling horizontally on wide tables in comments would sometimes slide the comment instead.",
    },
    {
      description: "Videos in comments would link to an unreachable URL.",
    },
    {
      description:
        "Video thumbnails would load at the lowest quality when video autoplay was disabled.",
    },
    {
      description:
        "Posts with media that Reddit failed to process would not load.",
    },
    {
      description:
        "Changing device orientation while seeking through a video could cause Hydra to crash.",
    },
    {
      description:
        "Posts linking to certain RedGifs URLs would cause Hydra to crash.",
    },
    {
      description:
        "Posts in compact mode would sometimes show the wrong thumbnail.",
    },
    {
      description:
        "The post and link description max lines settings in Settings => Appearance could not be set to 0.",
    },
    {
      description: "Tweaked the media viewer animations to feel more fluid.",
    },
    {
      description:
        "The Hydra Pro offer modal would show up even if you were already subscribed.",
    },
    {
      description:
        "Clicking on post media would sometimes fail to mark the post as read.",
    },
    {
      description:
        "In light themes, videos would flash when a scroll gesture started on them.",
    },
    {
      description:
        "Changing orientation while scrolled deep in gallery mode would cause visual bugs.",
    },
    {
      description:
        "Clicking on links in compact mode would sometimes open the thumbnail as an image instead of opening the link.",
    },
    {
      description:
        'Accounts with "Don\'t show thumbnails next to links" enabled in their old Reddit preferences would cause images to fail to load.',
    },
  ] as { description: string }[],
  notes: [
    "Apologies for the long delay between updates. A significant amount of work over the last few months has gone into porting Hydra to Android. Hydra for Android is now in closed beta testing and should be publicly available soon!",
    "Many of you have requested tweaks to the media viewer. I want to honor those requests, and they will be my next priority after finishing the Android port.",
  ] as string[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);

  const exitUpdateInfo = () => {
    KeyStore.set(LAST_SEEN_UPDATE_KEY, updateInfo.updateKey);
    onExit();
  };

  return (
    <View style={styles.updateInfoContainer}>
      <View
        style={[
          styles.updateInfoSubContainer,
          {
            backgroundColor: theme.tint,
            borderColor: theme.divider,
          },
        ]}
      >
        <Touchable
          activeOpacity={0.2}
          animationDuration={{ in: 0, out: 150 }}
          style={[
            styles.exitButton,
            {
              backgroundColor: theme.divider,
            },
          ]}
          onPress={() => exitUpdateInfo()}
        >
          <FontAwesome6 name="xmark" size={16} color={theme.subtleText} />
        </Touchable>
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
          <TextWithRepairedHeight
            style={[
              styles.heading,
              {
                color: theme.text,
              },
            ]}
          >
            📝 Notes
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
              {updateInfo.notes.map((note) => (
                <TextWithRepairedHeight
                  key={note}
                  style={[
                    styles.bugfixDescription,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  {note}
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
      <Touchable style={styles.background} onPress={() => exitUpdateInfo()} />
    </View>
  );
}

const styles = StyleSheet.create({
  updateInfoContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  updateInfoSubContainer: {
    position: "absolute",
    top: "12.5%",
    maxHeight: "75%",
    marginHorizontal: 20,
    zIndex: 2,
    flex: 1,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    opacity: 0.75,
    zIndex: 1,
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
