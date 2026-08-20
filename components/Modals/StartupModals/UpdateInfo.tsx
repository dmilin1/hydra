import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import React, { useContext } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import { ThemeContext } from "../../../contexts/SettingsContexts/ThemeContext";
import GetHydraProButton from "../../UI/GetHydraProButton";
import KeyStore from "../../../utils/KeyStore";
import { TextWithRepairedHeight } from "../../Other/TextWithRepairedHeight";
import { useURLNavigation } from "../../../utils/navigation";
import { StackActions } from "@react-navigation/native";

export const LAST_SEEN_UPDATE_KEY = "lastSeenUpdate";

export const updateInfo = {
  updateKey: "v4.2.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [
    {
      title: "Export Videos with Audio",
      description:
        "Shared and downloaded videos now automatically mux the audio track into the saved video file.",
    },
    {
      title: "Collapsed Summaries",
      description:
        "Make post and comment summaries start collapsed. Enable this under Settings => Appearance => Post/Comment section => Start summary collapsed.",
    },
    {
      title: "No Automod in Summaries",
      description:
        "Template automoderator comments will be ignored in comment summaries.",
    },
    {
      title: "Smarter Post Filters",
      description:
        "The smart post filter has been upgraded to use a better model. This should help reduce the number of false positives and false negatives for the filter you've written in Settings => General => Filters => Smart Post Filter.",
    },
  ] as { title: string; description: string }[],
  features: [
    {
      title: "Share as Image",
      description:
        "Export a post or a comment thread as an image. Long press on a comment or press the ... button while inside a post to open up the Share as Image menu. Upgrade to Hydra Pro to remove the small Hydra watermark.",
    },
    {
      title: "Media Player Redesign",
      description:
        "The new media player adds new controls and a more intuitive UI. It also comes with significant performance improvements. Swipe anywhere to seek in a video is now off by default. You can reenable it in Settings => Appearance => Slide anywhere to scrub videos.",
    },
    {
      title: "Better Gallery Mode Support",
      description:
        "Gallery Mode can now be opened when viewing your saved posts, your upvoted/downvoted posts, and on user pages.",
    },
    {
      title: "Follow Users",
      description:
        "When on a user page, you can now follow and unfollow users. Press the ... button in the top right corner of a user page to see these options.",
    },
    {
      title: "Remap Outbound Links",
      description:
        "Write custom JavaScript to remap outbound links. For example, you can redirect all outbound links from x.com to xcancel.com. Set this up in Settings => General => External Links => Modify Links.",
    },
    {
      title: "Download Progress Indicator",
      description:
        "When downloading or sharing media, a progress circle appears around the button indicating download progress.",
    },
    {
      title: "Toast Indicators",
      description:
        "Previously, many actions in Hydra would display a blocking alert. These have been replaced with a non intrusive toast that slides in from the top of the screen.",
    },
    {
      title: "Updated Guide",
      description:
        "The guide's contents have been updated to align more closely with all the features and changes added to Hydra since it was first built. Check it out in Settings => Guide.",
    },
    {
      title: "Reorganized Settings",
      description:
        "Settings are now organized into groups to make options easier to find. The settings tab now has links to Hydra related websites, servers, and subreddits.",
    },
    {
      title: "Added a Tip Jar",
      description:
        "I've had a few people tell me they aren't interested in Hydra Pro, but would still like a way to contribute. You can access this in Settings => Tip Jar.",
    },
    {
      title: "Improved Comments Performance",
      description: "Very long comment sections should render a bit faster now.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description: "Videos would sometimes display as a black screen.",
    },
    {
      description:
        "Image thumbnails in compact mode would show up on the wrong post for link posts and multi image posts.",
    },
    {
      description:
        "RedGif videos would load forever if they had been deleted. They now show an indicator.",
    },
    {
      description:
        "Trying to load deleted RedGif videos would result in being rate limited.",
    },
    {
      description: "Sorting by top would lock the app on Android.",
    },
    {
      description:
        "Subreddit image icons could be slow to load on a bad connection.",
    },
    {
      description: "Certain subreddit images would fail to load.",
    },
    {
      description: "Posts linking to Imgur would show a link, but no image.",
    },
    {
      description:
        "Posts made in Hydra would not get inbox replies in certain cases.",
    },
    {
      description:
        "The inbox tab would not immediately update the unread message badge counter when opening an unread message.",
    },
    {
      description:
        "User pages would load forever instead of indicating if they had no posts or were set to private.",
    },
  ] as { description: string }[],
  notes: [
    "Apologies for the long delay between updates. A significant amount of work over the last few months has gone into porting Hydra to Android. Hydra for Android is now in closed beta testing and should be publicly available soon!",
    "Many of you have requested tweaks to the media viewer. I want to honor those requests, and they will be my next priority after finishing the Android port.",
  ] as string[],
};

export default function UpdateInfo({ onExit }: { onExit: () => void }) {
  const { theme } = useContext(ThemeContext);
  const { dispatch } = useURLNavigation();

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
          <FontAwesome6
            iconStyle="solid"
            name="xmark"
            size={16}
            color={theme.subtleText}
          />
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
          <View style={styles.getHydraProContainer}>
            <GetHydraProButton onPress={() => exitUpdateInfo()} />
          </View>
          <Touchable
            style={styles.tipJarContainer}
            activeOpacity={0.5}
            animationDuration={{ in: 0, out: 150 }}
            onPress={() => {
              dispatch(
                StackActions.push("SettingsPage", {
                  url: "hydra://settings/tipJar",
                }),
              );
              exitUpdateInfo();
            }}
          >
            <TextWithRepairedHeight
              style={[styles.tipJarText, { color: theme.iconOrTextButton }]}
            >
              Leave a tip
            </TextWithRepairedHeight>
          </Touchable>
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
  getHydraProContainer: {
    marginTop: 10,
  },
  tipJarContainer: {
    paddingTop: 10,
    paddingBottom: 30,
    marginHorizontal: 20,
  },
  tipJarText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
