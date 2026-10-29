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
  updateKey: "v4.4.0",
  title: "Update",
  subtitle: "Here's what's new in this update",
  proFeatures: [] as { title: string; description: string }[],
  features: [
    {
      title: "New Data Loading System",
      description:
        "Hydra loads data in a new way, enabling me to build out new features that wern't previously possible. It also fixes some issues like r/all and search breaking. This only works with an account, so you'll need to be logged in to browse. Most of Hydra had to be rewritten for this, so please report anything that seems off.",
    },
    {
      title: "Login Buttons",
      description:
        "When you're logged out, pages now show buttons to log in or create an account.",
    },
    {
      title: "Vote Buttons in Feeds",
      description:
        "Add upvote and downvote buttons to posts in your feeds. Enable this in Settings => Appearance => Posts => Show Vote Buttons in Feed. Tapping a post's vote buttons now also gives haptic feedback.",
    },
    {
      title: "Comment Count on Posts",
      description:
        "A post's comment count now shows next to its score when you open it.",
    },
    {
      title: "Right to Left Languages",
      description:
        "Posts, titles, and comments in languages like Hebrew, Arabic, and Persian are now right aligned and laid out right to left.",
    },
    {
      title: "Discover Subreddits",
      description:
        "The trending subreddits list in the Search tab has been replaced with Reddit's subreddit recommendations, including ones picked for your account.",
    },
    {
      title: "Profile Posts & Comments",
      description:
        "User profiles now have a toggle to switch between posts and comments, and can be sorted by New, Hot, or Top.",
    },
    {
      title: "Subreddit Activity",
      description:
        "The sidebar now shows a subreddit's weekly visitors and weekly contributions next to its subscriber count. Subreddit search results show weekly visitors too.",
    },
    {
      title: "Endless User Search",
      description:
        "User search results now keep loading as you scroll instead of stopping after the first page.",
    },
    {
      title: "Clearer Errors",
      description:
        "If a vote, save, subscribe, or similar action fails, Hydra now tells you why instead of failing silently. Failed comments and edits also show the reason Reddit gave.",
    },
  ] as { title: string; description: string }[],
  bugfixes: [
    {
      description: "Image posts would fail to upload.",
    },
    {
      description:
        "Opening Hydra without an internet connection would log you out.",
    },
    {
      description:
        "A failed login would show two different alerts and could leave Hydra using your previous account while showing you as logged out.",
    },
    {
      description:
        "Quickly switching between accounts could break the saved login for one of them.",
    },
    {
      description:
        "Posts that failed to load would show a loading spinner forever.",
    },
    {
      description:
        "Feeds, searches, and sidebars that failed to load could leave a loading spinner stuck on screen.",
    },
    {
      description:
        "Loading more comments would get stuck if the request failed.",
    },
    {
      description:
        "In split view, selecting a post while another one was still loading could show the wrong post.",
    },
    {
      description:
        "Changing the sort while posts were loading could show posts from the previous sort.",
    },
    {
      description:
        "Votes and saves made while more posts were loading could appear to be undone.",
    },
    {
      description:
        "The filter limit message could get stuck after refreshing, stopping more posts from loading.",
    },
    {
      description:
        "Subreddits opened from a link with different capitalization, like r/askreddit, would show Subscribe instead of Unsubscribe and couldn't be favorited.",
    },
  ] as { description: string }[],
  notes: [
    "iPhone Duo support is coming soon! You can expect it in the next update.",
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
          {updateInfo.notes.length > 0 && (
            <>
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
            </>
          )}
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
